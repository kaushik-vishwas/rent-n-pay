import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    promotionName: {
      type: String,
      required: true,
      trim: true,
    },

    // Logic & Parameters
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    applicableOn: {
      type: [String],
      enum: ["rentals", "selling", "services"],
      default: ["rentals"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscountCap: {
      type: Number,
      default: null,
    },

    // Targeting & Usage Limits
    userSegment: {
      type: String,
      enum: ["all", "new_customers", "existing_customers"],
      default: "all",
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    totalUsageLimit: {
      type: Number,
      required: true,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual: derived status (active / inactive / expired)
couponSchema.virtual("status").get(function () {
  const now = new Date();
  if (this.usedCount >= this.totalUsageLimit) return "expired";
  if (now > this.validUntil) return "expired";
  if (!this.isActive) return "inactive";
  return "active";
});

couponSchema.set("toJSON", { virtuals: true });
couponSchema.set("toObject", { virtuals: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;