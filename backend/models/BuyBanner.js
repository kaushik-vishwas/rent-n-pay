import mongoose from 'mongoose';

const buyBannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    clickableUrl: { type: String, default: '' },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('BuyBanner', buyBannerSchema);
