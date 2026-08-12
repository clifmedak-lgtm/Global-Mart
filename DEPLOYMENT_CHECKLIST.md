🚀 GLOBALMART - DEPLOYMENT CHECKLIST (TODAY)
============================================

## STEP 1: Update Prisma Schema
File: prisma/schema.prisma

Add to User model:
  role String @default("customer")
  businessName String?

Add to Order model:
  shippingAddress String @default("")
  shippingCity String @default("")
  shippingPhone String @default("")

## STEP 2: Run Database Migration
```bash
npx prisma migrate dev --name add_vendor_shipping
```

## STEP 3: Replace Files

### Root server.js
REPLACE the current server.js (in root folder) with server-complete.js
This includes:
- Vendor auth routes (/api/vendor/auth/login, /api/vendor/auth/register)
- Vendor product management (/api/vendor/products)
- Vendor stats (/api/vendor/stats)
- Shipping address support in checkout

### Vendor Dashboard
REPLACE public/vendor-dashboard.html with vendor-dashboard-complete.html
This is now 100% dynamic:
- Real vendor login
- Real product management (add/edit/delete)
- Real order tracking
- Real revenue stats

### App.js Update
In app.js, update the checkout handler to include shipping fields:
Find: apiFetch('/api/checkout', ...)
Update body to include:
  shippingAddress: document.getElementById('shipping-address')?.value || '',
  shippingCity: document.getElementById('shipping-city')?.value || '',
  shippingPhone: document.getElementById('shipping-phone')?.value || ''

### Checkout.html
Add these fields after the cart summary (before payment button):
  <label>Shipping Address</label>
  <input type="text" id="shipping-address" placeholder="Street address" required>
  <label>City</label>
  <input type="text" id="shipping-city" placeholder="City" required>
  <label>Phone</label>
  <input type="tel" id="shipping-phone" placeholder="Phone number" required>

## STEP 4: Test Locally
```bash
npm start
```

Go to http://localhost:3000/vendor-dashboard.html
- Try vendor register (e.g., "John Shop" / john@shop.com / password123)
- Try adding a product
- Go back to homepage, add to cart, checkout with shipping address

## STEP 5: Git Push & Deploy
```bash
git add .
git commit -m "Complete vendor dashboard and shipping support"
git push
```

Vercel will auto-deploy (if you set up Git integration earlier)

## WHAT'S NOW DYNAMIC (NOT HARDCODED):
✅ Vendor login/register
✅ Vendor product CRUD
✅ Vendor stats (real numbers from DB)
✅ Vendor order tracking
✅ Shipping address on orders
✅ All product sections (PS5, Android, iPhone, Cases)
✅ Search functionality
✅ Shopping cart + checkout
✅ Customer account & order history

## WHAT'S STILL PENDING (after today):
⏳ Payment integration (Monetbil - can be added later)
⏳ Cloudinary image upload (can be added later)

==============================================
YOU CAN LAUNCH TODAY. These are the core features.
