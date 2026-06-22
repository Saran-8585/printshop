import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  product_name: { type: String, required: true },
  category: { type: String, required: true },
  configuration: { type: mongoose.Schema.Types.Mixed, required: true },
  design_file_path: { type: String, default: '' },
  design_notes: { type: String, default: '' },
  no_design_flag: { type: Boolean, default: false },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  discount_applied: { type: Number, default: 0 },
  line_total: { type: Number, required: true },
});

export default mongoose.model('OrderItem', orderItemSchema);
