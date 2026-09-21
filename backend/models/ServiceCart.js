import mongoose from 'mongoose';

const ServiceCartBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true },
    productId: { type: String, required: true },
    vendorId: { type: String, default: '' },
    bookingDate: { type: String, default: '' },
    timeSlot: {
      from: { type: String, default: '' },
      to: { type: String, default: '' },
      label: { type: String, default: '' },
    },
    isUrgent: { type: Boolean, default: false },
    totalAmount: { type: Number, default: 0 },
    originalAmount: { type: Number, default: 0 },
    serviceName: { type: String, default: '' },
    image: { type: String, default: '' },
    category: { type: String, default: '' },
    subCategory: { type: String, default: '' },
    taxBlocked: { type: Boolean, default: false },
  },
  { _id: false },
);

const ServiceCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bookings: { type: [ServiceCartBookingSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('ServiceCart', ServiceCartSchema);
