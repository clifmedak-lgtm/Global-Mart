// Diagnostic script — run with: node debug-orders.mjs
// It does NOT change any data, it only reads and prints.
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

function line() { console.log('-'.repeat(60)); }

async function main() {
  line();
  console.log('VENDOR ACCOUNTS');
  line();
  const vendors = await prisma.user.findMany({ where: { role: 'vendor' } });
  for (const v of vendors) {
    console.log(`id=${v.id}  fullName="${v.fullName}"  email=${v.email}  businessName=${v.businessName || ''}`);
  }

  line();
  console.log('PRODUCTS (last 20, newest first)');
  line();
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  for (const p of products) {
    console.log(`id=${p.id}  name="${p.name}"  vendor="${p.vendor}"  vendorId=${p.vendorId || 'NULL'}`);
  }

  line();
  console.log('ORDERS (last 20, newest first)');
  line();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { items: { include: { product: true } }, user: true }
  });
  for (const o of orders) {
    console.log(`orderId=${o.id}  customer=${o.user?.fullName}  status=${o.status}  paymentStatus=${o.paymentStatus}  total=${o.totalAmount}`);
    for (const item of o.items) {
      console.log(`   -> product="${item.product?.name}"  productId=${item.productId}  productVendor="${item.product?.vendor}"  productVendorId=${item.product?.vendorId || 'NULL'}  qty=${item.quantity}`);
    }
  }
  line();
  console.log('If an order\'s item shows productVendorId=NULL and productVendor does not exactly');
  console.log('match one of the vendor fullName values printed above, that is why it is not showing up.');
  line();

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
