import mongoose from 'mongoose';

const adsPlanProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true },
    category: { type: String },
    image: { type: String },
    // startDate: { type: String },
    // duration: { type: String },
    startDate: { type: Date },
    duration: { type: Number, default: 24 }, // hours
    price: { type: Number, required: true },
  },
  { _id: false },
);

const adsPlanSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    planType: {
      type: String,
      enum: ['category_hero', 'featured_spotlight', 'mega_flash'],
      default: 'category_hero',
    },
    products: {
      type: [adsPlanProductSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'upi', 'card', 'razorpay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid',
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true },
);

export default mongoose.model('AdsPlan', adsPlanSchema);
