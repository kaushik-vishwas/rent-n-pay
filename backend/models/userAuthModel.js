import mongoose from 'mongoose';

// const withdrawalSchema = new mongoose.Schema({
//   amount: { type: Number, required: true },
//   status: {
//     type: String,
//     enum: ['pending', 'processing', 'paid', 'failed'],
//     default: 'pending',
//   },
//   requestedAt: { type: Date, default: Date.now },
//   processedAt: { type: Date, default: null },
//   utr: { type: String, default: null },
// });

const withdrawalSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending',
  },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: null },
  utr: { type: String, default: null },
  // Snapshot of the bank account this withdrawal must be paid to — locked in
  // at request time so a later bank-details edit can never redirect an
  // already-requested payout to a different account.
  payoutBankSnapshot: {
    accountName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    ifscCode: { type: String, default: null },
    bankName: { type: String, default: null },
  },
  razorpayContactId: { type: String, default: null },
  razorpayFundAccountId: { type: String, default: null },
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    emailAddress: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: { type: String, default: null },
    otpExpire: { type: Date, default: null },

    // Mobile OTP login/signup fields
    mobileNumber: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    mobileOtp: { type: String, default: null },
    mobileOtpExpire: { type: Date, default: null },

    /** Stable platform customer id (CUST-001). */
    customerNumber: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    referredByCode: {
      type: String,
      default: null,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    referralEarnings: {
      type: Number,
      default: 0,
    },

    withdrawnAmount: {
      type: Number,
      default: 0,
    },

    bankDetails: {
      accountName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      ifscCode: { type: String, default: null },
      bankName: { type: String, default: null },
      razorpayContactId: { type: String, default: null },
      razorpayFundAccountId: { type: String, default: null },
    },

    withdrawals: [withdrawalSchema],

    firstOrderCompleted: {
      type: Boolean,
      default: false,
    },

    //     referralCommissionEarned: {
    //       type: Number,
    //       default: 0,
    //     },
    //   },
    //   {
    //     timestamps: true,
    //   },
    // );

    // userSchema.index({ emailAddress: 1 }, { unique: true });
    referralCommissionEarned: {
      type: Number,
      default: 0,
    },

    referralCommissionEarnedAt: {
      type: Date,
      default: null,
    },

    referralPaymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },

    referralPaidAt: {
      type: Date,
      default: null,
    },

    referralTransactionId: {
      type: String,
      default: null,
    },

    referralWithdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ emailAddress: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
