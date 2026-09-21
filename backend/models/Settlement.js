import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    lineId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    vendorName: { type: String, default: '' },
    period: { type: String, default: '' },
    grossAmount: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    platformFee: { type: Number, required: true },
    netPayout: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid'],
      default: 'Pending',
    },
    paidAt: { type: Date, default: null },
    paidBy: { type: String, default: '' },
    razorpayPayoutId: { type: String, default: '' },
    payoutFailureReason: { type: String, default: '' },
  },
  { timestamps: true },
);

// Unique per line item, not per order+vendor — so each delivered
// product line in a multi-item order gets its own settlement.
settlementSchema.index(
  { orderId: 1, vendorId: 1, lineId: 1 },
  { unique: true },
);

export default mongoose.model('Settlement', settlementSchema);
