import mongoose from 'mongoose';

const locationSourceSettingsSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    rentEnabled: { type: Boolean, default: true },
    buyEnabled: { type: Boolean, default: true },
    serviceEnabled: { type: Boolean, default: true },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true },
);

const LocationSourceSettings = mongoose.model(
  'LocationSourceSettings',
  locationSourceSettingsSchema,
);
export default LocationSourceSettings;
