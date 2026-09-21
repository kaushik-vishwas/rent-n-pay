import mongoose from 'mongoose';

const vendorBankAccountSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    confirmAccountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    cancelledCheque: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verified: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('VendorBankAccount', vendorBankAccountSchema);
