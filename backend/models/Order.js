import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },

  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  variantName: {
    type: String,
    default: '',
  },

  // productType: { type: String, enum: ['Rental', 'Sell'], default: 'Rental' },
  // quantity: { type: Number, required: true, default: 1 },
  // pricePerDay: { type: Number, required: true },

  // productType: { type: String, enum: ['Rental', 'Sell'], default: 'Rental' },
  // quantity: { type: Number, required: true, default: 1 },
  // pricePerDay: { type: Number, required: true },

  // // Per-line monthly rent tracking — each Rental product line in a
  // // multi-product order pays down its own months independently.
  // monthsPaid: { type: Number, default: 1 },
  // lateFeesCollected: { type: Number, default: 0 },
  // productType: { type: String, enum: ['Rental', 'Sell'], default: 'Rental' },
  // quantity: { type: Number, required: true, default: 1 },
  // pricePerDay: { type: Number, required: true },

  // // Per-line tenure tracking — each Rental product line in a multi-product
  productType: { type: String, enum: ['Rental', 'Sell'], default: 'Rental' },
  quantity: { type: Number, required: true, default: 1 },
  pricePerDay: { type: Number, required: true },

  originalPricePerDay: { type: Number, default: null },

  offerSource: { type: String, enum: ['admin', 'vendor', null], default: null },

  gstRatePercent: { type: Number, default: 0 },
  careTaxRatePercent: { type: Number, default: 0 },

  /** Per-unit vendor payout frozen at checkout (0 = commission path; null = legacy). */
  vendorUnitRateAtOrder: { type: Number, default: null },

  // rentalDuration: { type: Number, default: null },
  // originalRentalDuration: { type: Number, default: null },
  // tenureUnit: {
  //   type: String,
  //   enum: ['month', 'day', null],
  //   default: null,
  // },
  // extendedDurationTotal: { type: Number, default: 0 },

  rentalDuration: { type: Number, default: null },
  originalRentalDuration: { type: Number, default: null },
  tenureUnit: {
    type: String,
    enum: ['month', 'day', null],
    default: null,
  },
  extendedDurationTotal: { type: Number, default: 0 },
  // Rentomojo-style extension tracking: each extension keeps its OWN
  // rate for its OWN months, instead of overwriting the rate for the
  // whole line. `startMonth`/`endMonth` are 1-indexed month numbers
  // within the line's total tenure (e.g. original 12mo + this 3mo
  // extension = startMonth 13, endMonth 15).
  extensions: [
    {
      startMonth: { type: Number, required: true },
      endMonth: { type: Number, required: true },
      monthlyBaseRate: { type: Number, required: true }, // before tax
      monthlyRateWithTax: { type: Number, required: true }, // what's charged
      unit: { type: String, enum: ['month', 'day'], default: 'month' },
      addedAt: { type: Date, default: Date.now },
    },
  ],

  // monthsPaid: { type: Number, default: 1 },
  // lateFeesCollected: { type: Number, default: 0 },
  // // monthlyPayments: [

  // monthsPaid: { type: Number, default: 1 },
  // lateFeesCollected: { type: Number, default: 0 },
  // // Frozen at the moment return/pickup is requested — the unpaid late fee
  // // for the current overdue cycle (if any), so vendor/admin pickup tables
  // // can show a fixed number instead of one that keeps climbing while the
  // // return request is in transit.
  // pendingDue: { type: Number, default: 0 },
  monthsPaid: { type: Number, default: 1 },
  lateFeesCollected: { type: Number, default: 0 },
  // Frozen at the moment return/pickup is requested — the unpaid late fee
  // for the current overdue cycle (if any), so vendor/admin pickup tables
  // can show a fixed number instead of one that keeps climbing while the
  // return request is in transit.
  pendingDue: { type: Number, default: 0 },
  // Admin-granted waivers on a still-UNPAID (pending) month's live-computed
  // late fee — separate from monthlyPayments (which only exists AFTER a
  // month is paid). One entry per month waived; if the same month is
  // waived again later, a new entry is pushed and amounts sum.
  pendingLateFeeWaivers: [
    {
      month: { type: Number, required: true },
      waiverAmount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
      approvedAt: { type: Date, default: Date.now },
    },
  ],
  // monthlyPayments: [
  //   {
  //     month: { type: Number, required: true },
  //     baseAmount: { type: Number, default: 0 },
  //     lateFeeAmount: { type: Number, default: 0 },
  //     daysLate: { type: Number, default: 0 },
  //     paidAt: { type: Date, default: Date.now },
  //   },
  // ],

  // refundableDeposit: { type: Number, default: 0 },
  monthlyPayments: [
    {
      month: { type: Number, required: true },
      baseAmount: { type: Number, default: 0 },
      lateFeeAmount: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      careTaxAmount: { type: Number, default: 0 },
      daysLate: { type: Number, default: 0 },
      paidAt: { type: Date, default: Date.now },
    },
  ],

  // refundableDeposit: { type: Number, default: 0 },
  // deliveryOtp: { type: String, default: null },
  refundableDeposit: { type: Number, default: 0 },
  // refundBreakdown: {
  //   productPrice: { type: Number, default: 0 },
  //   deposit: { type: Number, default: 0 },
  //   feePct: { type: Number, default: 0 },
  //   feeAmount: { type: Number, default: 0 },
  //   refundAmount: { type: Number, default: 0 },
  // },
  refundBreakdown: {
    productPrice: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    feePct: { type: Number, default: 0 },
    feeAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
  },
  // Plain-cancel refund tracking (separate from returnRequest's refund
  // fields, which belong to the pickup/return flow). Razorpay payout is
  // not wired up yet — admin manually marks these as paid for now.
  cancelRefundStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  // cancelRefundTransactionId: { type: String, default: '' },
  // cancelRefundPaidAt: { type: Date, default: null },
  // cancelRefundPaidBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   default: null,
  // },
  cancelRefundTransactionId: { type: String, default: '' },
  cancelRefundPaidAt: { type: Date, default: null },
  cancelRefundPaidBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  cancelRefundDetails: {
    method: { type: String, enum: ['bank', 'upi'], default: 'bank' },
    upiId: { type: String, default: '' },
    bankAccountName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    bankIfsc: { type: String, default: '' },
  },
  cancelRefundRazorpayContactId: { type: String, default: '' },
  cancelRefundRazorpayFundAccountId: { type: String, default: '' },
  cancelledAt: { type: Date, default: null },
  deliveryOtp: { type: String, default: null },
  deliveryOtpExpire: { type: Date, default: null },
  deliveryBlockedByKyc: { type: Boolean, default: false },
  lineStatus: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
    ],
    default: 'pending',
  },

  cancelledBy: {
    type: String,
    enum: ['vendor', 'user', null],
    default: null,
  },
  cancelReason: { type: String, default: '' },

  returnRequest: {
    status: {
      type: String,
      enum: ['none', 'requested', 'review_submitted'],
      default: 'none',
    },
    pickupDate: { type: Date },
    vendorPickupDate: { type: Date },
    vendorPickupTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
    },
    vendorPickupAddress: { type: String, default: '' },
    vendorDriverName: { type: String, default: '' },
    pickupScheduledAt: { type: Date },
    inspectionChecklist: {
      powerFunctionCheck: { type: Boolean, default: true },
      surfaceScratches: { type: Boolean, default: false },
      structuralIntegrity: { type: Boolean, default: true },
      accessoriesAccountedFor: { type: Boolean, default: true },
      cleanlinessCheck: { type: Boolean, default: true },
    },
    // pickupPhotoName: { type: String, default: '' },
    // qcCompletedAt: { type: Date },
    pickupPhotoName: { type: String, default: '' },
    pickupPhotoUrl: { type: String, default: '' },
    qcCompletedAt: { type: Date },
    damageDeduction: { type: Number, default: 0 },
    cleaningFees: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },
    finalRefundAmount: { type: Number, default: 0 },
    refundInitiatedAt: { type: Date },
    // refundApprovedAt: { type: Date, default: null },
    // refundApprovedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: null,
    // },
    // refundRejectedAt: { type: Date, default: null },
    // refundRejectedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: null,
    // },
    // rejectionNote: { type: String, default: '' },
    refundApprovedAt: { type: Date, default: null },
    refundApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    refundRejectedAt: { type: Date, default: null },
    refundRejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    rejectionNote: { type: String, default: '' },
    refundPaidAt: { type: Date, default: null },
    refundPaidBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    refundTransactionId: { type: String, default: '' },
    // refundMethod: {
    //   type: String,
    //   enum: ['original', 'upi', 'bank'],
    // },
    // refundDetails: {
    //   upiId: { type: String, default: '' },
    //   bankAccountName: { type: String, default: '' },
    //   bankAccountNumber: { type: String, default: '' },
    //   bankIfsc: { type: String, default: '' },
    // },
    refundMethod: {
      type: String,
      enum: ['original', 'upi', 'bank'],
    },
    refundDetails: {
      upiId: { type: String, default: '' },
      bankAccountName: { type: String, default: '' },
      bankAccountNumber: { type: String, default: '' },
      bankIfsc: { type: String, default: '' },
    },
    // Cached RazorpayX IDs for this specific refund payout, so a repeat
    // cron run doesn't recreate the contact/fund account each time.
    refundRazorpayContactId: { type: String, default: '' },
    refundRazorpayFundAccountId: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    reviewText: { type: String, default: '' },
    mediaNames: [{ type: String }],
    media: [
      {
        url: { type: String, default: '' },
        type: { type: String, default: '' },
        name: { type: String, default: '' },
      },
    ],
    requestedAt: { type: Date },
    reviewedAt: { type: Date },
  },
  relocationRequest: {
    status: {
      type: String,
      enum: [
        'none',
        'requested',
        'confirmed',
        'scheduled',
        'completed',
        'cancelled',
      ],
      default: 'none',
    },
    newAddressId: { type: mongoose.Schema.Types.ObjectId, default: null },
    newAddress: {
      label: { type: String, default: '' },
      addressLine: { type: String, default: '' },
      area: { type: String, default: '' },
      pincode: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    oldAddressSnapshot: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    requestedAt: { type: Date },
    scheduledAt: { type: Date },
    completedAt: { type: Date },
  },
  issueReports: [
    {
      issueType: {
        type: String,
        enum: [
          'structural_damage',
          'fabric_stain',
          'functionality_issue',
          'other',
        ],
        default: 'other',
      },
      description: { type: String, default: '' },
      photoNames: [{ type: String }],
      photos: [
        {
          url: { type: String, default: '' },
          type: { type: String, default: '' },
          name: { type: String, default: '' },
        },
      ],
      // status: {
      //   type: String,
      //   enum: ['open', 'in_progress', 'resolved'],
      //   default: 'open',
      // },

      // queryCode: { type: Number },
      // createdAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved'],
        default: 'open',
      },
      resolutionNote: { type: String, default: '' },
      resolvedAt: { type: Date, default: null },

      queryCode: { type: Number },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const vendorFulfillmentSchema = new mongoose.Schema(
  {
    packingChecklist: {
      verifyQuality: { type: Boolean, default: false },
      packSecurely: { type: Boolean, default: false },
      labelPasted: { type: Boolean, default: false },
    },
    markedPackedAt: { type: Date },
    delivery: {
      method: {
        type: String,
        enum: ['self', 'third_party'],
        default: 'self',
      },
      driverName: { type: String, default: '' },
      driverPhone: { type: String, default: '' },
      vehicleNumber: { type: String, default: '' },
      markedShippedAt: { type: Date },
    },
  },
  { _id: false },
);

// const orderSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     products: [orderItemSchema],
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [orderItemSchema],
    // rentalDuration: { type: Number, required: true },

    // originalRentalDuration: { type: Number },
    rentalDuration: { type: Number, required: true },

    originalRentalDuration: { type: Number },

    // // How many rental months have been paid so far. Starts at 1 because
    // // month 1 is paid at checkout. Incremented by the "Pay Nth Month" flow.
    // monthsPaid: { type: Number, default: 1 },

    // // Running total of late fees actually collected (₹10/day late), stored
    // // permanently once a late payment is made — not recomputed on the fly.
    // lateFeesCollected: { type: Number, default: 0 },

    // // Per-month history of what was paid, so admin/user views can show an
    // // accurate breakdown later (base amount + any late fee for that month).
    // monthlyPayments: [
    //   {
    //     month: { type: Number, required: true }, // 1-indexed
    //     baseAmount: { type: Number, default: 0 },
    //     lateFeeAmount: { type: Number, default: 0 },
    //     daysLate: { type: Number, default: 0 },
    //     paidAt: { type: Date, default: Date.now },
    //   },
    // ],

    monthsPaid: { type: Number, default: 1 },
    lateFeesCollected: { type: Number, default: 0 },
    monthlyPayments: [
      {
        month: { type: Number, required: true },
        baseAmount: { type: Number, default: 0 },
        lateFeeAmount: { type: Number, default: 0 },
        daysLate: { type: Number, default: 0 },
        paidAt: { type: Date, default: Date.now },
      },
    ],

    extendedDurationTotal: { type: Number, default: 0 },

    tenureUnit: {
      type: String,
      enum: ['month', 'day'],
    },
    // address: { type: String, required: true },
    // phone: { type: String, required: true },
    // name: { type: String, required: true },
    // deliveryOtp: { type: String, default: null },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    deliveryInstructions: { type: String, default: '' },
    orderLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      label: { type: String, default: '' },
      area: { type: String, default: '' },
    },
    deliveryOtp: { type: String, default: null },
    deliveryOtpExpire: { type: Date, default: null },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'shipped',
        'delivered',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    vendorAcknowledged: { type: Boolean, default: false },
    vendorAcknowledgedAt: { type: Date },
    vendorFulfillment: { type: vendorFulfillmentSchema },
    // ── price snapshot ──────────────────────────────────────
    totalAmount: { type: Number, default: 0 },
    baseRentalCost: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    refundableDeposit: { type: Number, default: 0 },
    careProtection: { type: Number, default: 0 },
    repairWarranty: { type: Number, default: 0 },
    relocationWarranty: { type: Number, default: 0 },
    deliveryPackaging: { type: Number, default: 0 },
    installationFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    // paymentMethod: { type: String, default: '' },
    // paymentId: { type: String, default: '' },
    paymentMethod: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    paymentMethodDetail: { type: String, default: '' },
    // city: { type: String, default: '', index: true },
    // lateFee: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('Order', orderSchema);
