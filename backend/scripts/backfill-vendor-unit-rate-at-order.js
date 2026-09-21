/**
 * One-time: snapshot vendorUnitRateAtOrder on existing order lines that lack it.
 * Run: node scripts/backfill-vendor-unit-rate-at-order.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { resolveVendorUnitRateForOrderSnapshot } from '../utils/vendorPayout.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const orders = await Order.find({}).sort({ orderNumber: 1 });
  let linesUpdated = 0;

  for (const order of orders) {
    let changed = false;
    for (const line of order.products || []) {
      const existing = line.vendorUnitRateAtOrder;
      if (existing !== null && existing !== undefined && Number.isFinite(Number(existing))) {
        continue;
      }

      const product = await Product.findById(line.product);
      if (!product) continue;

      const lineDraft = {
        variantId: line.variantId || null,
        variantName: line.variantName || '',
        productType: line.productType || 'Rental',
        quantity: Math.max(1, Number(line.quantity || 1)),
        pricePerDay: Number(line.pricePerDay || 0),
        originalPricePerDay: Number(
          line.originalPricePerDay ?? line.pricePerDay ?? 0,
        ),
        offerSource: line.offerSource || null,
        rentalDuration: line.rentalDuration,
        originalRentalDuration: line.originalRentalDuration,
        tenureUnit: line.tenureUnit || order.tenureUnit || 'month',
      };
      const orderDraft = {
        rentalDuration: Number(
          line.rentalDuration || order.rentalDuration || 0,
        ),
        originalRentalDuration: Number(
          line.originalRentalDuration ?? order.originalRentalDuration ?? 0,
        ),
        tenureUnit: line.tenureUnit || order.tenureUnit || 'month',
      };

      const rate = await resolveVendorUnitRateForOrderSnapshot(
        product,
        lineDraft,
        orderDraft,
      );
      line.vendorUnitRateAtOrder = Number.isFinite(rate) ? rate : 0;
      changed = true;
      linesUpdated += 1;
      console.log(
        `ORD-${String(order.orderNumber).padStart(4, '0')} line ${line._id}: vendorUnitRateAtOrder=${line.vendorUnitRateAtOrder}`,
      );
    }

    if (changed) {
      await order.save();
    }
  }

  console.log(`Done. Updated ${linesUpdated} order line(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
