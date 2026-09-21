import mongoose from 'mongoose';

const labelValueSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    value: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const pricingTierSchema = new mongoose.Schema(
  {
    periodUnit: {
      type: String,
      enum: ['month', 'day'],
      default: 'month',
    },
    months: { type: Number, default: 0 },
    days: { type: Number, default: 0 },
    label: { type: String, default: '' },
    tierLabel: { type: String, default: '' },
    pricePerDay: { type: Number, default: 0 },
    customerRent: { type: Number, default: 0 },
    customerShipping: { type: Number, default: 0 },
    vendorRent: { type: Number, default: 0 },
    vendorShipping: { type: Number, default: 0 },
  },
  { _id: false },
);

const serviceVariantSchema = new mongoose.Schema(
  {
    variantName: { type: String, trim: true, default: '' },
    images: { type: [String], default: [] },
    variantSpecs: { type: [labelValueSchema], default: [] },
    rentalPricingModel: {
      type: String,
      enum: ['month', 'day'],
      default: 'month',
    },
    allowVendorEditRentalPrices: { type: Boolean, default: true },
    rentalConfigurations: { type: [pricingTierSchema], default: [] },
    refundableDeposit: { type: Number, default: 0 },
    price: { type: String, trim: true, default: '' },
    stock: { type: Number, default: 0 },
  },
  { _id: false },
);

const serviceListingTemplateSchema = new mongoose.Schema(
  {
    sku: { type: String, default: '', trim: true },
    productName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    price: { type: String, required: true },
    type: { type: String, default: 'Service', enum: ['Service'] },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    brand: { type: String, default: '' },
    condition: {
      type: String,
      enum: ['Brand New', 'Refurbished'],
      default: 'Brand New',
    },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    productCustomSpecs: { type: [labelValueSchema], default: [] },
    variants: { type: [serviceVariantSchema], default: [] },
    rentalConfigurations: { type: [pricingTierSchema], default: [] },
    refundableDeposit: { type: Number, default: 0 },
    logisticsVerification: {
      type: {
        inventoryOwnerName: { type: String, default: '' },
        city: { type: String, default: '' },
      },
      default: {},
    },
    salesConfiguration: {
      type: {
        allowVendorEditSalePrice: { type: Boolean, default: true },
        salePrice: { type: Number, default: 0 },
        mrpPrice: { type: Number, default: 0 },
      },
      default: {},
    },
    serviceMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
    stock: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Low Stock', 'Out of Stock'],
      default: 'Active',
    },
  },
  { timestamps: true },
);

export default mongoose.model('ServiceListingTemplate', serviceListingTemplateSchema);
