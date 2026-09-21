import mongoose from 'mongoose';

const investorEnquirySchema = new mongoose.Schema(
  {
    subject: { type: String, default: '', trim: true },
    fullName: { type: String, required: true, trim: true },
    emailAddress: { type: String, default: '', trim: true, lowercase: true },
    phoneNumber: { type: String, default: '', trim: true },
    companyName: { type: String, default: '', trim: true },
    investmentRange: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('InvestorEnquiry', investorEnquirySchema);

