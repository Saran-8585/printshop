import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  min_qty: { type: Number, required: true },
  max_qty: { type: Number, required: true },
  discount_percent: { type: Number, required: true },
});

export default mongoose.model('PricingRule', pricingRuleSchema);
