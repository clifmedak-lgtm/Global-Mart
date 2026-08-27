import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const app = express();
const prisma = new PrismaClient();

// NotchPay config (Mobile Money + Orange Money + Cartes, Cameroun + international).
// Works with a sandbox key (starts with "sb.") available immediately at signup —
// no business registration required to start testing.
const NOTCHPAY_PUBLIC_KEY = process.env.NOTCHPAY_PUBLIC_KEY;
const NOTCHPAY_BASE_URL = 'https://api.notchpay.co';
// Public base URL of this app, used to build NotchPay's callback URL.
const APP_URL = process.env.APP_URL || `http://localhost:${port}`;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

app.use(cors());
// CinetPay's notify_url is called as x-www-form-urlencoded, so we need both parsers.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (session && new Date(session.expiresAt) >= new Date()) {
      req.user = session.user;
    } else if (session) {
      await prisma.session.delete({ where: { token } }).catch(() => { });
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

// Products belonging to a vendor: match by the reliable vendorId first,
// fall back to the display-name match for old rows created before vendorId existed.
function vendorProductsWhere(user) {
  return { OR: [{ vendorId: user.id }, { vendor: user.fullName }] };
}

// ===== CUSTOMER ENDPOINTS =====

app.get('/api/products', asyncHandler(async (req, res) => {
  const { category, search, id, priceMin, priceMax } = req.query;

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
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { vendor: { contains: searchTerm, mode: 'insensitive' } },
      { category: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }
  if (priceMin || priceMax) {
    where.price = {};
    if (priceMin) where.price.gte = Math.max(0, parseInt(priceMin) || 0);
    if (priceMax) where.price.lte = Math.max(0, parseInt(priceMax) || 0);
  }

  const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(products);
}));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing registration fields' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName, email: email.toLowerCase(), password: hashed, role: 'customer' }
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, expiresAt } });

  res.json({ token, user: { fullName: user.fullName, email: user.email, role: user.role } });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, expiresAt } });

  res.json({ token, user: { fullName: user.fullName, email: user.email, role: user.role } });
}));

app.get('/api/recommendations', asyncHandler(async (req, res) => {
  const { category } = req.query;
  const where = {};
  if (category) {
    where.category = category === 'phones' ? { in: ['android', 'iphone'] } : category;
  }
  const products = await prisma.product.findMany({ where, orderBy: { rating: 'desc' }, take: 8 });
  res.json(products);
}));

app.get('/api/orders', requireAuth, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } }
  });
  res.json(orders);
}));

app.get('/api/orders/:id', requireAuth, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } }
  });
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json(order);
}));

// Step 1 of checkout: create the order in PENDING_PAYMENT / UNPAID state.
// No money moves yet - the order only becomes real (PROCESSING/PAID) once
// /api/payment/notify or /api/payment/status confirms the CinetPay transaction.
// Flat delivery fee for now (CFA). Configurable via env so it's data, not hardcoded frontend logic.
// A future upgrade can turn this into a per-city table once volume justifies it.
const DELIVERY_FEE_XAF = Math.max(0, parseInt(process.env.DELIVERY_FEE_XAF) || 1000);

// Public — lets the frontend show the correct total (incl. delivery) before the customer commits.
app.get('/api/config', (req, res) => {
  res.json({ deliveryFeeXaf: DELIVERY_FEE_XAF });
});

app.post('/api/checkout', requireAuth, asyncHandler(async (req, res) => {
  const { items, shippingAddress, shippingCity, shippingPhone } = req.body;

  if (!items?.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }
  if (!shippingAddress?.trim() || !shippingCity?.trim() || !shippingPhone?.trim()) {
    return res.status(400).json({ success: false, message: 'Shipping address, city and phone are required' });
  }

  const productIds = items.map(i => String(i.id || i.productId)).filter(Boolean);
  const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productById = Object.fromEntries(dbProducts.map(p => [p.id, p]));

  const requestedItems = items
    .filter(i => productById[String(i.id || i.productId)] !== undefined)
    .map(i => ({
      productId: String(i.id || i.productId),
      quantity: Math.max(1, parseInt(i.quantity) || 1),
    }));

  if (!requestedItems.length) {
    return res.status(400).json({ success: false, message: 'No valid products in cart' });
  }

  // Stock check — catches obvious overselling. Not a hard reservation lock (two people
  // could still race on the very last unit before either pays), but it stops the common
  // case: someone trying to order more than what's actually available right now.
  const outOfStock = requestedItems
    .map(i => ({ ...i, product: productById[i.productId] }))
    .filter(i => i.product.stock < i.quantity);

  if (outOfStock.length) {
    return res.status(409).json({
      success: false,
      message: 'Some items in your cart no longer have enough stock',
      outOfStock: outOfStock.map(i => ({
        productId: i.productId,
        name: i.product.name,
        requested: i.quantity,
        available: i.product.stock,
      })),
    });
  }

  const orderItems = requestedItems.map(i => ({
    productId: i.productId,
    quantity: i.quantity,
    price: productById[i.productId].price,
  }));

  const itemsSubtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = DELIVERY_FEE_XAF;
  const totalAmount = itemsSubtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      itemsSubtotal,
      deliveryFee,
      totalAmount,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'UNPAID',
      shippingAddress: shippingAddress.trim(),
      shippingCity: shippingCity.trim(),
      shippingPhone: shippingPhone.trim(),
      items: { create: orderItems }
    },
    include: { items: { include: { product: true } } }
  });

  res.json({ success: true, order });
}));

// ===== PAYMENT (NotchPay: MTN MoMo, Orange Money, cartes Visa/Mastercard) =====

app.post('/api/payment/initiate', requireAuth, asyncHandler(async (req, res) => {
  if (!NOTCHPAY_PUBLIC_KEY) {
    return res.status(503).json({ success: false, message: 'Payment provider is not configured yet (missing NOTCHPAY_PUBLIC_KEY)' });
  }

  const { orderId, paymentMethod } = req.body;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (order.paymentStatus === 'PAID') {
    return res.status(400).json({ success: false, message: 'Order already paid' });
  }

  // NotchPay only lets us restrict by category — "mobile_money" (covers both MTN and Orange)
  // or "card". The specific operator (MTN vs Orange) is auto-detected from the phone number
  // itself once the customer is on NotchPay's page, not something we can force from here.
  const channels = paymentMethod === 'CARD' ? ['card'] : ['mobile_money'];

  const payload = {
    amount: order.totalAmount,
    currency: 'XAF',
    email: req.user.email,
    phone: order.shippingPhone || undefined,
    reference: order.id,
    description: `Commande GlobalMart #${order.id}`,
    callback: `${APP_URL}/checkout.html?order=${order.id}`,
    channels,
  };

  const notchpayRes = await fetch(`${NOTCHPAY_BASE_URL}/payments/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': NOTCHPAY_PUBLIC_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await notchpayRes.json();

  if (!notchpayRes.ok || !data.authorization_url) {
    console.error('NotchPay initiate error:', data);
    return res.status(502).json({ success: false, message: data.message || 'Unable to start payment' });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentMethod: paymentMethod || 'MOMO',
      paymentProvider: 'notchpay',
      paymentReference: data.transaction?.reference || order.id,
    }
  });

  res.json({ success: true, paymentUrl: data.authorization_url });
}));

async function verifyNotchpayTransaction(reference) {
  const notchpayRes = await fetch(`${NOTCHPAY_BASE_URL}/payments/${encodeURIComponent(reference)}`, {
    headers: { 'Authorization': NOTCHPAY_PUBLIC_KEY, 'Accept': 'application/json' },
  });
  return notchpayRes.json();
}

async function markOrderFromNotchpayResult(orderId, result) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentStatus === 'PAID') return order; // already handled / not found

  const status = result?.transaction?.status;
  if (status === 'complete') {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', status: 'PROCESSING' }
    });
    // best-effort stock decrement, never blocks payment confirmation
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      await prisma.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      }).catch(() => {});
    }
    return updated;
  }
  if (status === 'failed' || status === 'canceled' || status === 'expired') {
    return prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'FAILED' } });
  }
  // pending/processing or unknown: leave as UNPAID, caller can retry later
  return order;
}

// NotchPay calls this server-to-server after a payment attempt (event "payment.complete").
// Requires a public HTTPS URL in production - unreachable from NotchPay on localhost.
// The exact reference field can vary by event payload shape, so we check the common ones.
app.post('/api/payment/notify', asyncHandler(async (req, res) => {
  const reference = req.body?.data?.reference || req.body?.reference || req.body?.transaction?.reference;
  if (!reference) return res.sendStatus(400);
  try {
    const result = await verifyNotchpayTransaction(reference);
    await markOrderFromNotchpayResult(reference, result);
  } catch (e) {
    console.error('NotchPay notify error:', e);
  }
  res.sendStatus(200);
}));

// Frontend polls this after redirect back from NotchPay (also re-verifies directly
// with NotchPay as a fallback for local dev, where the webhook can't be reached).
app.get('/api/payment/status/:orderId', requireAuth, asyncHandler(async (req, res) => {
  let order = await prisma.order.findUnique({ where: { id: req.params.orderId } });
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (order.paymentStatus === 'UNPAID' && NOTCHPAY_PUBLIC_KEY) {
    try {
      const result = await verifyNotchpayTransaction(order.paymentReference || order.id);
      order = await markOrderFromNotchpayResult(order.id, result) || order;
    } catch (e) {
      console.error('NotchPay status check error:', e);
    }
  }
  res.json({ success: true, status: order.status, paymentStatus: order.paymentStatus, order });
}));

// ===== IMAGE UPLOAD (Cloudinary) =====

app.post('/api/upload/image', requireVendor, asyncHandler(async (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({ success: false, message: 'Image upload is not configured yet' });
  }
  const { image } = req.body; // expects a base64 data URL: "data:image/png;base64,...."
  if (!image?.startsWith('data:')) {
    return res.status(400).json({ success: false, message: 'Send a base64 data URL in the "image" field' });
  }
  const result = await cloudinary.uploader.upload(image, { folder: 'globalmart/products' });
  res.json({ success: true, url: result.secure_url });
}));

// ===== VENDOR ENDPOINTS =====

app.post('/api/vendor/auth/register', asyncHandler(async (req, res) => {
  const { fullName, email, password, businessName } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password?.trim() || !businessName?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing vendor registration fields' });
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
      businessName
    }
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: vendor.id, expiresAt } });

  res.json({ token, vendor: { fullName: vendor.fullName, email: vendor.email, role: vendor.role } });
}));

app.post('/api/vendor/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const vendor = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });
  if (!vendor || vendor.role !== 'vendor') {
    return res.status(401).json({ success: false, message: 'Invalid vendor credentials' });
  }

  const ok = await bcrypt.compare(password, vendor.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid vendor credentials' });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: vendor.id, expiresAt } });

  res.json({ token, vendor: { fullName: vendor.fullName, email: vendor.email, role: vendor.role } });
}));

app.get('/api/vendor/products', requireVendor, asyncHandler(async (req, res) => {
  const { search } = req.query;
  const where = { ...vendorProductsWhere(req.user) };
  if (search) {
    const term = String(search).trim();
    where.AND = [{ OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { category: { contains: term, mode: 'insensitive' } },
    ] }];
  }
  const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(products);
}));

app.post('/api/vendor/products', requireVendor, asyncHandler(async (req, res) => {
  const { name, description, price, category, image, stock } = req.body;
  if (!name?.trim() || !price || !category?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing product fields' });
  }

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const uniqueSuffix = crypto.randomBytes(3).toString('hex');

  const product = await prisma.product.create({
    data: {
      id: `${category.toLowerCase()}-${slug}-${uniqueSuffix}`,
      name: name.trim(),
      description: description?.trim() || '',
      price: Math.max(1, parseInt(price)),
      category: category.toLowerCase(),
      image: image || '',
      stock: stock !== undefined ? Math.max(0, parseInt(stock) || 0) : 999,
      vendor: req.user.fullName,
      vendorId: req.user.id,
      rating: 4.0
    }
  });

  res.json({ success: true, product });
}));

app.put('/api/vendor/products/:id', requireVendor, asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({ where: { id: req.params.id, ...vendorProductsWhere(req.user) } });
  if (!product) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name || product.name,
      description: req.body.description !== undefined ? req.body.description : product.description,
      price: req.body.price ? Math.max(1, parseInt(req.body.price)) : product.price,
      image: req.body.image || product.image,
      stock: req.body.stock !== undefined ? Math.max(0, parseInt(req.body.stock) || 0) : product.stock,
      vendorId: product.vendorId || req.user.id, // backfill link for old rows on first edit
    }
  });

  res.json({ success: true, product: updated });
}));

app.delete('/api/vendor/products/:id', requireVendor, asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({ where: { id: req.params.id, ...vendorProductsWhere(req.user) } });
  if (!product) {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Product deleted' });
}));

const VENDOR_ALLOWED_STATUSES = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

app.put('/api/vendor/orders/:id/status', requireVendor, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VENDOR_ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${VENDOR_ALLOWED_STATUSES.join(', ')}` });
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } }
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const ownsAnItem = order.items.some(i => i.product?.vendorId === req.user.id || i.product?.vendor === req.user.fullName);
  if (!ownsAnItem) return res.status(403).json({ success: false, message: 'Not your order' });

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status } });
  res.json({ success: true, order: updated });
}));

app.get('/api/vendor/stats', requireVendor, asyncHandler(async (req, res) => {
  const vendorWhere = vendorProductsWhere(req.user);
  const products = await prisma.product.findMany({ where: vendorWhere });

  // All orders touching this vendor's products, regardless of payment status —
  // the vendor needs to see pending-payment orders too (read-only, waiting on the customer).
  const orders = await prisma.order.findMany({
    where: {
      items: { some: { product: vendorWhere } }
    },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } }, user: true }
  });

  const isMine = (item) => item.product?.vendorId === req.user.id || item.product?.vendor === req.user.fullName;

  // Revenue only counts confirmed/paid orders.
  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'PAID')
    .reduce((sum, order) => {
      const vendorAmount = order.items
        .filter(isMine)
        .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      return sum + vendorAmount;
    }, 0);

  res.json({
    productCount: products.length,
    orderCount: orders.length,
    totalRevenue,
    products,
    orders: orders.map(o => {
      const myItems = o.items.filter(isMine);
      const vendorAmount = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return {
        id: o.id,
        customerName: o.user.fullName,
        vendorAmount, // this vendor's share only — excludes delivery fee and other vendors' items
        status: o.status,
        paymentStatus: o.paymentStatus,
        shippingAddress: o.shippingAddress,
        shippingCity: o.shippingCity,
        shippingPhone: o.shippingPhone,
        createdAt: o.createdAt,
        // Only this vendor's line items from the order, with product name/qty for display
        items: myItems.map(i => ({
          productName: i.product?.name || 'Product',
          quantity: i.quantity,
          price: i.price,
        }))
      };
    })
  });
}));

// ===== STATIC FILES =====

app.use(express.static(join(__dirname, 'public')));

app.use(/^\/api\//, (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
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
