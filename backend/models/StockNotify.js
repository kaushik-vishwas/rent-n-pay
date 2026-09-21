import mongoose from 'mongoose';

const stockNotifySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

stockNotifySchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model('StockNotify', stockNotifySchema);
