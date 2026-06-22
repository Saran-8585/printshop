import mongoose from 'mongoose';

const finishUpchargeSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  finish_name: { type: String, required: true },
  upcharge_amount: { type: Number, default: 0 },
});

export default mongoose.model('FinishUpcharge', finishUpchargeSchema);
