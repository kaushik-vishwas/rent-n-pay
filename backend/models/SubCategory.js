// import mongoose from 'mongoose';

// const operationRuleSchema = new mongoose.Schema(
//   {
//     commissionRate: { type: Number, default: 0 },
//     otherTax: { type: Number, default: 0 },
//   },
//   { _id: false },
// );

// const subCategorySchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     slug: { type: String, default: '' },

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Category',
//       required: true,
//     },
//     image: { type: String, default: '' },
//     icon: { type: String, default: '' },
//     availableInRent: { type: Boolean, default: true },
//     availableInBuy: { type: Boolean, default: false },
//     availableInServices: { type: Boolean, default: false },
//     commissionRate: { type: Number, default: 0 },
//     otherTax: { type: Number, default: 0 },
//     // operations: { type: [operationRuleSchema], default: [] },
//     operations: { type: [operationRuleSchema], default: [] },
//     defaultGst: { type: Number, default: 0 },
//     defaultCareTax: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// );

// export default mongoose.model('SubCategory', subCategorySchema);

import mongoose from 'mongoose';

const operationRuleSchema = new mongoose.Schema(
  {
    commissionRate: { type: Number, default: 0 },
    otherTax: { type: Number, default: 0 },
  },
  { _id: false },
);

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, default: '' },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: { type: String, default: '' },
    icon: { type: String, default: '' },
    availableInRent: { type: Boolean, default: true },
    availableInBuy: { type: Boolean, default: false },
    availableInServices: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 0 },
    otherTax: { type: Number, default: 0 },
    // operations: { type: [operationRuleSchema], default: [] },
    operations: { type: [operationRuleSchema], default: [] },
    defaultGst: { type: Number, default: 0 },
    defaultCareTax: { type: Number, default: 0 },
    defaultRepairWarranty: { type: Number, default: 0 },
    defaultRelocationWarranty: { type: Number, default: 0 },
    defaultDeliveryPackaging: { type: Number, default: 0 },
    defaultInstallationFee: { type: Number, default: 0 },
    defaultPlatformFee: { type: Number, default: 0 },
    taxBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('SubCategory', subCategorySchema);
