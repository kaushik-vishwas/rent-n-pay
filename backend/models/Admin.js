// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const adminSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },
//     plainPassword: {
//       type: String,
//       default: null,
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ['admin', 'subadmin'], // <-- only change to existing field
//       default: 'admin',
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     permissions: {
//       type: [String],
//       default: [],
//     },
//     lastLogin: {
//       type: Date,
//       default: null,
//     },

//     // ---- NEW FIELDS (only used when role === 'subadmin') ----
//     phone: {
//       type: String,
//       default: null,
//     },
//     location: {
//       type: String, // e.g. "Kerala" — auto-detected on frontend
//       default: null,
//     },
//     approvalStatus: {
//       type: String,
//       enum: ['pending', 'approved', 'rejected'],
//       default: 'approved', // existing/regular admins are always "approved"
//     },
//     approvedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Admin',
//       default: null,
//     },
//     approvedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true },
// );

// adminSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// adminSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// const Admin = mongoose.model('Admin', adminSchema);
// export default Admin;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    plainPassword: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'subadmin'], // <-- only change to existing field
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    // ---- NEW FIELDS (only used when role === 'subadmin') ----
    phone: {
      type: String,
      default: null,
    },
    location: {
      type: String, // e.g. "Kerala" — auto-detected on frontend
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // existing/regular admins are always "approved"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    // ---- NEW: forgot password OTP fields ----
    // otp: {
    //   type: String,
    //   default: null,
    //   select: false,
    // },
    // otpExpire: {
    //   type: Date,
    //   default: null,
    //   select: false,
    // },
    otp: { type: String, select: false },
    otpExpire: { type: Date, select: false },
    oldPassword: { type: String, select: false },
    oldPlainPassword: { type: String, select: false },
    oldPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true },
);

// adminSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // keep a plaintext copy so the admin Settings page can display current password
  this.plainPassword = this.password;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
