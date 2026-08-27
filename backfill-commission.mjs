// One-time backfill — run with: node backfill-commission.mjs
// Fills in commissionRate/platformFee/vendorEarning for OrderItems created BEFORE the
// commission system existed (they were set to 0 by default when the columns were added).
// Safe to run more than once: it only touches rows still at commissionRate = 0, so any
// order item already backfilled (or created after the fix, which already has a real rate)
// is left untouched.
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const COMMISSION_RATE_PERCENT = Math.min(100, Math.max(0, parseFloat(process.env.COMMISSION_RATE_PERCENT) || 10));
const commissionRate = COMMISSION_RATE_PERCENT / 100;

async function main() {
  const itemsToFix = await prisma.orderItem.findMany({
    where: { commissionRate: 0 },
    include: { product: true, order: true }
  });

  if (itemsToFix.length === 0) {
    console.log('Nothing to backfill — every order item already has a commission rate set.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${itemsToFix.length} order item(s) to backfill at ${COMMISSION_RATE_PERCENT}%...\n`);

  for (const item of itemsToFix) {
    const lineTotal = item.price * item.quantity;
    const platformFee = Math.round(lineTotal * commissionRate);
    const vendorEarning = lineTotal - platformFee;

    await prisma.orderItem.update({
      where: { id: item.id },
      data: { commissionRate, platformFee, vendorEarning }
    });

    console.log(`Order ${item.orderId} — ${item.product?.name || item.productId} x${item.quantity}: vendorEarning=${vendorEarning} (was 0)`);
  }

  console.log(`\nDone. ${itemsToFix.length} order item(s) updated.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
