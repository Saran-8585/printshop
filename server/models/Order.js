import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, required: true },
  delivery_address: { type: mongoose.Schema.Types.Mixed, required: true },
  order_notes: { type: String, default: '' },
  subtotal: { type: Number, required: true },
  coupon_code: { type: String, default: '' },
  coupon_discount: { type: Number, default: 0 },
  gst_amount: { type: Number, required: true },
  grand_total: { type: Number, required: true },
  payment_method: { type: String, required: true },
  payment_status: { type: String, default: 'completed' },
  status: { type: String, enum: ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  internal_notes: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Order', orderSchema);
