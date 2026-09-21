// import mongoose from 'mongoose';

// const taxRowSchema = new mongoose.Schema(
//   {
//     gst: { type: Number, default: 0 },
//     careTax: { type: Number, default: 0 },
//     repairWarranty: { type: Number, default: 0 },
//     relocationWarranty: { type: Number, default: 0 },
//     deliveryPackaging: { type: Number, default: 0 },
//     installationFee: { type: Number, default: 0 },
//     platformFee: { type: Number, default: 0 },
//     lastUpdated: { type: Date, default: null },
//   },
//   { _id: false },
// );

// const globalTaxConfigSchema = new mongoose.Schema(
//   {
//     config: {
//       rental: { type: taxRowSchema, default: () => ({}) },
//       buying_new: { type: taxRowSchema, default: () => ({}) },
//       buying_refurbished: { type: taxRowSchema, default: () => ({}) },
//       services: { type: taxRowSchema, default: () => ({}) },
//     },
//   },
//   { timestamps: true },
// );

// export default mongoose.models.GlobalTaxConfig ||
//   mongoose.model('GlobalTaxConfig', globalTaxConfigSchema);

import mongoose from 'mongoose';

const taxRowSchema = new mongoose.Schema(
  {
    gst: { type: Number, default: 0 },
    careTax: { type: Number, default: 0 },
    repairWarranty: { type: Number, default: 0 },
    relocationWarranty: { type: Number, default: 0 },
    deliveryPackaging: { type: Number, default: 0 },
    installationFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: null },
  },
  { _id: false },
);

const globalTaxConfigSchema = new mongoose.Schema(
  {
    config: {
      rental: { type: taxRowSchema, default: () => ({}) },
      buying_new: { type: taxRowSchema, default: () => ({}) },
      buying_refurbished: { type: taxRowSchema, default: () => ({}) },
      buying_mint: { type: taxRowSchema, default: () => ({}) },
      services: { type: taxRowSchema, default: () => ({}) },
    },
  },
  { timestamps: true },
);

export default mongoose.models.GlobalTaxConfig ||
  mongoose.model('GlobalTaxConfig', globalTaxConfigSchema);
