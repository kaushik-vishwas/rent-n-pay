// import mongoose from "mongoose";

// const contactSchema = new mongoose.Schema(
//   {
//     subject: { type: String, required: true },
//     fullName: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     message: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Contact", contactSchema);

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Contact', contactSchema);
