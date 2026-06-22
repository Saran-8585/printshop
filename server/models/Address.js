import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, default: 'Home' },
  line1: { type: String, required: true },
  line2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  is_default: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Address', addressSchema);
