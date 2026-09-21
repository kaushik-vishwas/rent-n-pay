import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String, default: null },
    variantName: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    rentalMonths: { type: Number, default: 1 },
    pricePerDay: { type: Number, default: 0 },
    title: { type: String, default: '' },
    image: { type: String, default: '' },
    tenureUnit: { type: String, default: 'month' },
    productType: { type: String, default: 'Rental' },
    refundableDeposit: { type: Number, default: 0 },
    condition: { type: String, default: '' },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    dailyRate: { type: Number, default: null },
  },
  { _id: false },
);

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('Cart', CartSchema);
