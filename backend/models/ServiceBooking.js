import mongoose from 'mongoose';

// const serviceBookingSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     vendor: {
const serviceBookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: Number, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    serviceProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProduct',
      required: true,
      index: true,
    },
    serviceSnapshot: {
      productName: { type: String, default: '' },
      image: { type: String, default: '' },
      category: { type: String, default: '' },
      subCategory: { type: String, default: '' },
      serviceType: { type: String, default: '' },
      serviceProductId: { type: String, default: '' },
    },
    bookingDate: { type: Date, required: true },
    timeSlot: {
      from: { type: String, required: true },
      to: { type: String, required: true },
      label: { type: String, required: true },
    },
    // isUrgent: { type: Boolean, default: false },
    // baseAmount: { type: Number, required: true, default: 0 },
    // urgentFee: { type: Number, default: 0 },
    // totalAmount: { type: Number, required: true, default: 0 },
    isUrgent: { type: Boolean, default: false },
    baseAmount: { type: Number, required: true, default: 0 },
    urgentFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    taxBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    taxLines: [
      {
        label: { type: String },
        value: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
      index: true,
    },
    lateFee: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'card' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    customerNotes: { type: String, default: '' },
    cancelledBy: {
      type: String,
      enum: ['vendor', 'user', 'admin', null],
      default: null,
    },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
    completedAt: { type: Date, default: null },
    completionOtp: { type: String, default: null },
    completionOtpExpire: { type: Date, default: null },
  },
  { timestamps: true },
);

serviceBookingSchema.index({
  serviceProduct: 1,
  bookingDate: 1,
  'timeSlot.from': 1,
  'timeSlot.to': 1,
});

export default mongoose.model('ServiceBooking', serviceBookingSchema);
