import mongoose from 'mongoose';

const orderStatusHistorySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, required: true },
  changed_by: { type: String, default: 'system' },
  notes: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
