import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['posters', 'stickers', 'visiting-cards'] },
  description: { type: String, default: '' },
  base_price: { type: Number, required: true },
  turnaround_time: { type: String, default: '3-5 business days' },
  available_sizes: { type: [String], default: [] },
  available_finishes: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  order_count: { type: Number, default: 0 },
  avg_rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Product', productSchema);
