import db from '../db/database.js';

export function validateCoupon(req, res) {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ?').get(code.toUpperCase());
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
    if (!coupon.is_active) return res.status(400).json({ error: 'Coupon is inactive' });

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }
    if (coupon.max_uses > 0 && coupon.usage_count >= coupon.max_uses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    const orderTotal = subtotal || 0;
    if (orderTotal < coupon.min_order_amount) {
      return res.status(400).json({ error: `Minimum order amount of ₹${coupon.min_order_amount} required` });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round(orderTotal * coupon.discount_value / 100 * 100) / 100;
      if (discount > orderTotal) discount = orderTotal;
    } else {
      discount = Math.min(coupon.discount_value, orderTotal);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount,
      description: coupon.discount_type === 'percentage'
        ? `${coupon.discount_value}% off (max ₹${discount})`
        : `₹${coupon.discount_value} flat off`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
}

export function listCoupons(req, res) {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
}

export function createCoupon(req, res) {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_uses, expiry_date, is_active } = req.body;
    db.prepare(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, expiry_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(code.toUpperCase(), discount_type, Number(discount_value), Number(min_order_amount || 0), Number(max_uses || 0), expiry_date || null, is_active !== undefined ? (is_active ? 1 : 0) : 1);
    res.status(201).json({ message: 'Coupon created' });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: 'Failed to create coupon' });
  }
}

export function updateCoupon(req, res) {
  try {
    const { discount_type, discount_value, min_order_amount, max_uses, expiry_date, is_active } = req.body;
    db.prepare(
      'UPDATE coupons SET discount_type=?, discount_value=?, min_order_amount=?, max_uses=?, expiry_date=?, is_active=? WHERE id=?'
    ).run(discount_type, Number(discount_value), Number(min_order_amount || 0), Number(max_uses || 0), expiry_date || null, is_active !== undefined ? (is_active ? 1 : 0) : 1, req.params.id);
    res.json({ message: 'Coupon updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
}

export function deleteCoupon(req, res) {
  try {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
}
