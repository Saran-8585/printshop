import Coupon from '../models/Coupon.js';

export async function validateCoupon(req, res) {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
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

export async function listCoupons(req, res) {
  try {
    const coupons = await Coupon.find().sort({ created_at: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
}

export async function createCoupon(req, res) {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_uses, expiry_date, is_active } = req.body;
    await Coupon.create({
      code: code.toUpperCase(),
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount || 0),
      max_uses: Number(max_uses || 0),
      expiry_date: expiry_date || null,
      is_active: is_active !== undefined ? is_active : true,
    });
    res.status(201).json({ message: 'Coupon created' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: 'Failed to create coupon' });
  }
}

export async function updateCoupon(req, res) {
  try {
    const { discount_type, discount_value, min_order_amount, max_uses, expiry_date, is_active } = req.body;
    await Coupon.findByIdAndUpdate(req.params.id, {
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount || 0),
      max_uses: Number(max_uses || 0),
      expiry_date: expiry_date || null,
      is_active: is_active !== undefined ? is_active : true,
    });
    res.json({ message: 'Coupon updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
}

export async function deleteCoupon(req, res) {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
}
