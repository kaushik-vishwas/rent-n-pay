/**
 * One-time: push listing-template vendorRent onto all template-based vendor products.
 * Run: node scripts/sync-all-template-vendor-rents.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ListingTemplate from '../models/ListingTemplate.js';
import { syncVendorProductsFromListingTemplate } from '../utils/listingTemplateVendorRent.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const templates = await ListingTemplate.find({ isActive: { $ne: false } });
  let totalUpdated = 0;
  for (const template of templates) {
    const { updated } = await syncVendorProductsFromListingTemplate(template);
    if (updated) {
      console.log(`Synced ${updated} product(s) for "${template.productName}"`);
    }
    totalUpdated += updated;
  }
  console.log(`Done. Total vendor products updated: ${totalUpdated}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
