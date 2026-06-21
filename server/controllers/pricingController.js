import db from '../db/database.js';

export function computePrice(req, res) {
  try {
    const productId = req.params.productId;
    const { size, finish, quantity: qtyParam, waterproof, sides, corners, weight } = req.query;
    const quantity = parseInt(qtyParam) || 1;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const category = product.category;
    let basePrice = product.base_price;

    // Size multiplier for posters (larger = more expensive)
    if (category === 'posters') {
      const sizeMultipliers = { 'A4': 1, 'A3': 1.4, 'A2': 2.2, 'A1': 3.4 };
      basePrice = product.base_price * (sizeMultipliers[size] || 1);
    }

    // Finish upcharge
    let upcharges = [];
    if (finish) {
      const upchargeRow = db.prepare(
        'SELECT upcharge_amount FROM finish_upcharges WHERE product_id = ? AND finish_name = ?'
      ).get(productId, finish);
      if (upchargeRow && upchargeRow.upcharge_amount > 0) {
        upcharges.push({ name: finish, amount: upchargeRow.upcharge_amount });
      }
    }
    const totalUpcharge = upcharges.reduce((sum, u) => sum + u.amount, 0);

    let effectiveBase = basePrice + totalUpcharge;

    // Sticker waterproof upcharge (10%)
    if (category === 'stickers' && waterproof === 'true') {
      effectiveBase = effectiveBase * 1.1;
    }

    // Visiting card extras
    let extraNotes = [];
    if (category === 'visiting-cards') {
      if (sides === 'Double') {
        const doubleSidedUpcharge = 200 / quantity;
        effectiveBase += doubleSidedUpcharge;
        extraNotes.push({ name: 'Double-sided', amount: doubleSidedUpcharge });
      }
      if (corners === 'Rounded') {
        const roundedUpcharge = 150 / quantity;
        effectiveBase += roundedUpcharge;
        extraNotes.push({ name: 'Rounded corners', amount: roundedUpcharge });
      }
    }

    // Bulk discount
    const rule = db.prepare(
      'SELECT discount_percent FROM pricing_rules WHERE product_id = ? AND min_qty <= ? AND max_qty >= ?'
    ).get(productId, quantity, quantity);
    const discountPercent = rule ? rule.discount_percent : 0;

    const unitPrice = Math.round(effectiveBase * (1 - discountPercent / 100) * 100) / 100;
    const subtotal = Math.round(unitPrice * quantity * 100) / 100;
    const discountAmount = Math.round((effectiveBase * quantity - subtotal) * 100) / 100;

    res.json({
      product_id: parseInt(productId),
      product_name: product.name,
      category,
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

export function getPricingRules(req, res) {
  try {
    const rules = db.prepare(
      'SELECT pr.*, p.name as product_name, p.category FROM pricing_rules pr JOIN products p ON pr.product_id = p.id ORDER BY p.name, pr.min_qty'
    ).all();
    const upcharges = db.prepare(
      'SELECT fu.*, p.name as product_name, p.category FROM finish_upcharges fu JOIN products p ON fu.product_id = p.id ORDER BY p.name, fu.finish_name'
    ).all();
    res.json({ rules, upcharges });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
}

export function updatePricingRules(req, res) {
  try {
    const { rules, upcharges } = req.body;

    const updateRule = db.prepare('UPDATE pricing_rules SET discount_percent = ? WHERE id = ?');
    if (rules) {
      for (const rule of rules) {
        updateRule.run(rule.discount_percent, rule.id);
      }
    }

    const updateUpcharge = db.prepare('UPDATE finish_upcharges SET upcharge_amount = ? WHERE id = ?');
    if (upcharges) {
      for (const u of upcharges) {
        updateUpcharge.run(u.upcharge_amount, u.id);
      }
    }

    res.json({ message: 'Pricing rules updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pricing rules' });
  }
}
