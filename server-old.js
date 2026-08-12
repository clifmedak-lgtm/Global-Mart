import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

const addUserToRequest = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  req.user = null;
  if (!token) return next();

  try {
    const session = await prisma.session.findUnique({ 
      where: { token }, 
      include: { user: true } 
    });
    if (session && new Date(session.expiresAt) >= new Date()) {
      req.user = session.user;
    } else if (session) {
      await prisma.session.delete({ where: { token } }).catch(() => {});
    }
  } catch (e) {
    console.error('Auth middleware error:', e);
  }
  next();
};

app.use(addUserToRequest);

const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  next();
};

const requireVendor = (req, res, next) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Vendor access required' });
  }
  next();
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ===== CUSTOMER PRODUCTS =====

app.get('/api/products', asyncHandler(async (req, res) => {
  const { category, search, id } = req.query;

  try {
    if (id) {
      const product = await prisma.product.findUnique({ 
        where: { id: String(id) } 
      });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json(product);
    }

    const where = {};
    if (category) {
      where.category = category === 'phones' ? { in: ['android', 'iphone'] } : String(category);
    }
    if (search) {
      const searchTerm = String(search).trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { vendor: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
}));

app.get('/api/recommendations', asyncHandler(async (req, res) => {
  const { category } = req.query;
  const where = {};
  if (category) {
    where.category = category === 'phones' ? { in: ['android', 'iphone'] } : String(category);
  }
  const products = await prisma.product.findMany({ 
    where, 
    orderBy: { rating: 'desc' }, 
    take: 8 
  });
  res.json(products);
}));

// ===== CUSTOMER AUTH =====

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { 
      fullName, 
      email: email.toLowerCase(), 
      password: hashed,
      role: 'customer'
    }
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, expiresAt } });

  res.json({ token, user: { fullName: user.fullName, email: user.email, role: user.role } });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, expiresAt } });

  res.json({ token, user: { fullName: user.fullName, email: user.email, role: user.role } });
}));

// ===== CUSTOMER ORDERS =====

app.get('/api/orders', requireAuth, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } }
  });
  res.json(orders);
}));

app.post('/api/checkout', requireAuth, asyncHandler(async (req, res) => {
  const { items, shippingAddress, shippingCity, shippingPhone } = req.body;

  if (!items?.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const productIds = items.map(i => String(i.id || i.productId)).filter(Boolean);
  const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const priceMap = Object.fromEntries(dbProducts.map(p => [p.id, p.price]));

  const orderItems = items
    .filter(i => priceMap[String(i.id || i.productId)] !== undefined)
    .map(i => ({
      productId: String(i.id || i.productId),
      quantity: Math.max(1, parseInt(i.quantity) || 1),
      price: priceMap[String(i.id || i.productId)],
    }));

  if (!orderItems.length) {
    return res.status(400).json({ success: false, message: 'No valid products in cart' });
  }

  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      totalAmount,
      status: 'PENDING',
      shippingAddress: shippingAddress || '',
      shippingCity: shippingCity || '',
      shippingPhone: shippingPhone || '',
      items: { create: orderItems }
    },
    include: { items: { include: { product: true } } }
  });

  res.json({ success: true, order });
}));

// ===== VENDOR AUTH =====

app.post('/api/vendor/auth/register', asyncHandler(async (req, res) => {
  const { fullName, email, password, businessName } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password?.trim() || !businessName?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const vendor = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      password: hashed,
      role: 'vendor',
    
    }
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: vendor.id, expiresAt } });

  res.json({ token, vendor: { fullName: vendor.fullName, email: vendor.email, role: vendor.role } });
}));

app.post('/api/vendor/auth/register', asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  const ok = await bcrypt.compare(password, vendor.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid vendor credentials' });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: vendor.id, expiresAt } });

  res.json({ token, vendor: { fullName: vendor.fullName, email: vendor.email, role: vendor.role } });
}));

// ===== VENDOR PRODUCTS =====

app.get('/api/vendor/products', requireVendor, asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({ 
    where: { vendor: req.user.fullName } 
  });
  res.json(products);
}));

app.post('/api/vendor/products', requireVendor, asyncHandler(async (req, res) => {
  const { name, description, price, category, image } = req.body;
  if (!name?.trim() || !price || !category?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing product fields' });
  }

  const product = await prisma.product.create({
    data: {
      id: `${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      price: Math.max(1, parseInt(price)),
      category: category.toLowerCase(),
      image: image || '',
      vendor: req.user.fullName,
      rating: 4.0
    }
  });

  res.json({ success: true, product });
}));

app.put('/api/vendor/products/:id', requireVendor, asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product || product.vendor !== req.user.fullName) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name || product.name,
      description: req.body.description !== undefined ? req.body.description : product.description,
      price: req.body.price ? Math.max(1, parseInt(req.body.price)) : product.price,
      image: req.body.image || product.image,
    }
  });

  res.json({ success: true, product: updated });
}));

app.delete('/api/vendor/products/:id', requireVendor, asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product || product.vendor !== req.user.fullName) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Product deleted' });
}));

// ===== VENDOR STATS =====

app.get('/api/vendor/stats', requireVendor, asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({ where: { vendor: req.user.fullName } });
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: { product: { vendor: req.user.fullName } }
      }
    },
    include: { items: { include: { product: true } }, user: true }
  });

  const totalRevenue = orders.reduce((sum, order) => {
    const vendorAmount = order.items
      .filter(item => item.product?.vendor === req.user.fullName)
      .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    return sum + vendorAmount;
  }, 0);

  res.json({
    productCount: products.length,
    orderCount: orders.length,
    totalRevenue,
    products,
    orders: orders.map(o => ({
      id: o.id,
      customerName: o.user.fullName,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items
    }))
  });
}));

// ===== STATIC FILES =====

app.use(express.static(join(__dirname, 'public')));

app.use(/^\/api\//, (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;