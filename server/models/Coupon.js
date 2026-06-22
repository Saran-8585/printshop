import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount_type: { type: String, required: true, enum: ['percentage', 'flat'] },
  discount_value: { type: Number, required: true },
  min_order_amount: { type: Number, default: 0 },
  max_uses: { type: Number, default: 0 },
  usage_count: { type: Number, default: 0 },
  expiry_date: { type: Date, default: null },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Coupon', couponSchema);
