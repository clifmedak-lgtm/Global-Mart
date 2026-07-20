import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Log incoming requests to the console
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

function generateToken() {
  return `${Math.random().toString(36).slice(2)}.${Date.now()}`;
}

const addUserToRequest = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  req.user = null;
  if (!token) return next();

  try {
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } }); // user.role will be included
    if (session && new Date(session.expiresAt) >= new Date()) {
      req.user = session.user;
    } else if (session) {
      await prisma.session.delete({ where: { token } }).catch(() => { });
    }
  } catch (e) {
    console.error('Authentication middleware error:', e);
  }
  next();
};
app.use(addUserToRequest);

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// API Routes
app.get('/api/product', asyncHandler(async (req, res) => {
  const { id } = req.query;
  const product = await prisma.product.findUnique({ where: { id: String(id) } });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json(product);
}));

app.get('/api/products', asyncHandler(async (req, res) => {
  const { category, search, id } = req.query;

  if (id) {
    const product = await prisma.product.findUnique({ where: { id: String(id) } });
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
      { name: { contains: searchTerm } },
      { vendor: { contains: searchTerm } },
      { category: { contains: searchTerm } },
    ];
  }

  const products = await prisma.product.findMany({ where });
  res.json(products);
}));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { body } = req;
  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  if (!fullName || !email || !password) return res.status(400).json({ success: false, message: 'Missing registration fields' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { fullName, email, password: hashed } });
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, expiresAt } });
  res.json({ token, user: { fullName: user.fullName, email: user.email } });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { body } = req;
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, expiresAt } });
  res.json({ token, user: { fullName: user.fullName, email: user.email } });
}));

app.get('/api/recommendations', asyncHandler(async (req, res) => {
  const { category } = req.query;
  const where = {};
  if (category) {
    if (category === 'phones') {
      where.category = { in: ['android', 'iphone'] };
    } else {
      where.category = category;
    }
  }

  const products = await prisma.product.findMany({ where, orderBy: { rating: 'desc' }, take: 8 });
  res.json(products);
}));

app.get('/api/orders', requireAuth, asyncHandler(async (req, res) => {
  const userOrders = await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true } });
  res.json(userOrders);
}));

app.post('/api/checkout', requireAuth, asyncHandler(async (req, res) => {
  const { body } = req;
  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      totalAmount: body.total || 0,
      status: 'PENDING',
      items: {
        create: (body.items || []).map(i => ({ productId: i.id || i.productId, quantity: i.quantity || 1, price: i.price || 0 }))
      }
    },
    include: { items: true }
  });
  res.json({ success: true, order });
}));

app.delete('/api/product', asyncHandler(async (req, res) => {
  // NOTE: In a real-world application, you would add authorization here
  // to ensure only administrators can delete products.
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }
  await prisma.product.delete({ where: { id: String(id) } });
  res.json({ success: true, message: 'Product deleted successfully' });
}));

// Static file serving
app.use(express.static(join(__dirname, 'public')));

// Catch-all for API routes that don't exist
app.use('/api/*path', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  // Prisma's record not found error
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Export for testing
export default app;
