// import mongoose from 'mongoose';

// const vendorSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: true,
//     },
//     emailAddress: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     mobileNumber: {
//       type: String,
//       default: '',
//       trim: true,
//     },
//     referralCode: {
//       type: String,
//       default: '',
//       trim: true,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     otp: String,
//     otpExpire: Date,
//     bankChangeOtp: String,
//     bankChangeOtpExpire: Date,
//     // city: {
//     //   type: String,
//     //   default: '',
//     // },
//     bankDetails: {
//       accountHolderName: { type: String, default: '' },
//       accountNumber: { type: String, default: '' },
//       ifscCode: { type: String, default: '' },
//       bankName: { type: String, default: '' },
//       verified: { type: Boolean, default: false },
//       status: { type: String, default: 'Not Added' }, // 'Not Added' | 'Pending' | 'Verified' | 'Rejected'
//       rejectionReason: { type: String, default: '' },
//       chequeImage: { type: String, default: '' },
//       reviewedAt: Date,
//       reviewedBy: String,
//       updatedAt: Date,
//     },
//   },

//   { timestamps: true },
// );

// export default mongoose.model('Vendor', vendorSchema);

import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      default: '',
      trim: true,
    },
    referralCode: {
      type: String,
      default: '',
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpire: Date,
    bankChangeOtp: String,
    bankChangeOtpExpire: Date,
    // city: {
    //   type: String,
    //   default: '',
    // },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      verified: { type: Boolean, default: false },
      status: { type: String, default: 'Not Added' }, // 'Not Added' | 'Pending' | 'Verified' | 'Rejected'
      rejectionReason: { type: String, default: '' },
      chequeImage: { type: String, default: '' },
      reviewedAt: Date,
      reviewedBy: String,
      updatedAt: Date,
      razorpayContactId: { type: String, default: '' },
      razorpayFundAccountId: { type: String, default: '' },
    },
  },

  { timestamps: true },
);

export default mongoose.model('Vendor', vendorSchema);
