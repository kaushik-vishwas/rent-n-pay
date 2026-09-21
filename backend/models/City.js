import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    cityKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    cityName: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    country: { type: String, default: 'India', trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    serviceEnabled: { type: Boolean, default: true },
    updatedBy: { type: String, default: '' },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('City', citySchema);
