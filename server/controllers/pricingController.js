import Product from '../models/Product.js';
import PricingRule from '../models/PricingRule.js';
import FinishUpcharge from '../models/FinishUpcharge.js';

export async function computePrice(req, res) {
  try {
    const productId = req.params.productId;
    const { size, finish, quantity: qtyParam, waterproof, sides, corners, weight } = req.query;
    const quantity = parseInt(qtyParam) || 1;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const category = product.category;
    let basePrice = product.base_price;
    if (category === 'posters') {
      const sizeMultipliers = { 'A4': 1, 'A3': 1.4, 'A2': 2.2, 'A1': 3.4 };
      basePrice = product.base_price * (sizeMultipliers[size] || 1);
    }
    let upcharges = [];
    if (finish) {
      const upchargeRow = await FinishUpcharge.findOne({ product: productId, finish_name: finish });
      if (upchargeRow && upchargeRow.upcharge_amount > 0) {
        upcharges.push({ name: finish, amount: upchargeRow.upcharge_amount });
      }
    }
    const totalUpcharge = upcharges.reduce((sum, u) => sum + u.amount, 0);
    let effectiveBase = basePrice + totalUpcharge;
    if (category === 'stickers' && waterproof === 'true') effectiveBase = effectiveBase * 1.1;
    let extraNotes = [];
    if (category === 'visiting-cards') {
      if (sides === 'Double') { const d = 200 / quantity; effectiveBase += d; extraNotes.push({ name: 'Double-sided', amount: d }); }
      if (corners === 'Rounded') { const r = 150 / quantity; effectiveBase += r; extraNotes.push({ name: 'Rounded corners', amount: r }); }
    }
    const rule = await PricingRule.findOne({
      product: productId,
      min_qty: { $lte: quantity },
      max_qty: { $gte: quantity }
    });
    const discountPercent = rule ? rule.discount_percent : 0;
    const unitPrice = Math.round(effectiveBase * (1 - discountPercent / 100) * 100) / 100;
    const subtotal = Math.round(unitPrice * quantity * 100) / 100;
    const discountAmount = Math.round((effectiveBase * quantity - subtotal) * 100) / 100;
    res.json({
      product_id: parseInt(productId), product_name: product.name, category,
      base_price: basePrice,
      upcharges: [...upcharges, ...extraNotes],
      total_upcharge: Math.round(totalUpcharge * 100) / 100,
      effective_base: Math.round(effectiveBase * 100) / 100,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      unit_price: unitPrice,
      quantity,
      subtotal,
      turnaround_time: product.turnaround_time
    });
  } catch (err) {
    console.error('Pricing error:', err);
    res.status(500).json({ error: 'Failed to compute price' });
  }
}

export async function getPricingRules(req, res) {
  try {
    const [rules, upcharges] = await Promise.all([
      PricingRule.aggregate([
        { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $sort: { 'product.name': 1, min_qty: 1 } },
        { $project: { id: '$_id', product_id: '$product._id', product_name: '$product.name', category: '$product.category', min_qty: 1, max_qty: 1, discount_percent: 1 } }
      ]),
      FinishUpcharge.aggregate([
        { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $sort: { 'product.name': 1, finish_name: 1 } },
        { $project: { id: '$_id', product_id: '$product._id', product_name: '$product.name', category: '$product.category', finish_name: 1, upcharge_amount: 1 } }
      ]),
    ]);
    res.json({ rules, upcharges });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
}

export async function updatePricingRules(req, res) {
  try {
    const { rules, upcharges } = req.body;
    if (rules) {
      await Promise.all(rules.map(rule =>
        PricingRule.findByIdAndUpdate(rule.id, { discount_percent: rule.discount_percent })
      ));
    }
    if (upcharges) {
      await Promise.all(upcharges.map(u =>
        FinishUpcharge.findByIdAndUpdate(u.id, { upcharge_amount: u.upcharge_amount })
      ));
    }
    res.json({ message: 'Pricing rules updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pricing rules' });
  }
}
