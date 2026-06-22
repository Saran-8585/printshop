import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_item: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Review', reviewSchema);
