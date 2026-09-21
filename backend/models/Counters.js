import mongoose from 'mongoose';

const countersSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model('Counters', countersSchema);
