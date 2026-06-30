import mongoose from 'mongoose';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import OrderStatusHistory from '../models/OrderStatusHistory.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Counter from '../models/Counter.js';
import { jsPDF } from 'jspdf';

export async function createOrder(req, res) {
  try {
    const { items, customer_name, customer_email, customer_phone, delivery_address, order_notes, subtotal, coupon_code, coupon_discount, payment_method } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });
    const gstAmount = Math.round((subtotal - (coupon_discount || 0)) * 0.18 * 100) / 100;
    const grandTotal = Math.round((subtotal - (coupon_discount || 0) + gstAmount) * 100) / 100;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const counter = await Counter.findByIdAndUpdate(
      { _id: `order_${dateStr}` },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const seq = String(counter.seq).padStart(3, '0');
    const orderNumber = `ORD-${dateStr}-${seq}`;
    const addressStr = typeof delivery_address === 'string' ? delivery_address : JSON.stringify(delivery_address);

    const order = await Order.create({
      order_number: orderNumber,
      user: req.user?.id || null,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address: addressStr,
      order_notes: order_notes || '',
      subtotal,
      coupon_code: coupon_code || '',
      coupon_discount: coupon_discount || 0,
      gst_amount: gstAmount,
      grand_total: grandTotal,
      payment_method,
      payment_status: 'completed',
      status: 'pending',
      internal_notes: '',
    });

    const orderId = order._id;
    const insertItemPromises = items.map(item =>
      OrderItem.create({
        order: orderId,
        product: item.product_id || null,
        product_name: item.product_name,
        category: item.category,
        configuration: item.configuration,
        design_file_path: item.design_file_path || '',
        design_notes: item.design_notes || '',
        no_design_flag: item.no_design_flag || false,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_applied: item.discount_applied || 0,
        line_total: item.line_total,
      })
    );
    await Promise.all(insertItemPromises);

    const productUpdatePromises = items.map(item =>
      Product.findByIdAndUpdate(item.product_id, { $inc: { order_count: item.quantity } })
    );
    await Promise.all(productUpdatePromises);

    await OrderStatusHistory.create({
      order: orderId,
      status: 'pending',
      changed_by: 'customer',
      notes: 'Order placed',
    });

    if (coupon_code) {
      await Coupon.findOneAndUpdate({ code: coupon_code }, { $inc: { usage_count: 1 } });
    }

    res.status(201).json({
      order_id: orderId.toString(),
      order_number: orderNumber,
      grand_total: grandTotal,
      gst_amount: gstAmount,
      coupon_discount: coupon_discount || 0
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $lookup: { from: 'orderitems', localField: '_id', foreignField: 'order', as: 'items' } },
      { $addFields: { items_count: { $size: '$items' } } },
      { $project: { items: 0 } },
      { $sort: { created_at: -1 } }
    ]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const [items, statusHistory] = await Promise.all([
      OrderItem.find({ order: order._id }),
      OrderStatusHistory.find({ order: order._id }).sort({ created_at: 1 })
    ]);
    for (const item of items) {
      if (typeof item.configuration === 'string') {
        try { item.configuration = JSON.parse(item.configuration); } catch (e) { }
      }
    }
    let deliveryAddress = order.delivery_address;
    if (typeof deliveryAddress === 'string') {
      try { deliveryAddress = JSON.parse(deliveryAddress); } catch (e) { }
    }
    res.json({ ...order.toObject(), delivery_address: deliveryAddress, items, status_history: statusHistory });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

export async function listAllOrders(req, res) {
  try {
    const { status, search, dateFrom, dateTo } = req.query;
    const match = {};
    if (status) match.status = status;
    if (search) {
      match.$or = [
        { order_number: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } }
      ];
    }
    if (dateFrom || dateTo) {
      match.created_at = {};
      if (dateFrom) match.created_at.$gte = new Date(dateFrom);
      if (dateTo) match.created_at.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    const orders = await Order.aggregate([
      { $match: match },
      { $lookup: { from: 'orderitems', localField: '_id', foreignField: 'order', as: 'items' } },
      { $addFields: { items_count: { $size: '$items' } } },
      { $project: { items: 0 } },
      { $sort: { created_at: -1 } }
    ]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status, internal_notes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await Order.findByIdAndUpdate(req.params.id, { status, updated_at: new Date() });
    if (internal_notes !== undefined) {
      await Order.findByIdAndUpdate(req.params.id, { internal_notes });
    }
    await OrderStatusHistory.create({
      order: req.params.id,
      status,
      changed_by: req.user.role === 'admin' ? 'admin' : 'customer',
      notes: `Status changed to ${status}`,
    });
    res.json({ message: 'Order status updated', status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

export async function cancelOrder(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: new mongoose.Types.ObjectId(req.user.id) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled', updated_at: new Date() });
    await OrderStatusHistory.create({
      order: req.params.id,
      status: 'cancelled',
      changed_by: 'customer',
      notes: 'Cancelled by customer',
    });
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
}

export async function generateInvoice(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const items = await OrderItem.find({ order: order._id });
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('PrintShop', 14, 22);
    doc.setFontSize(10);
    doc.text('Invoice', 14, 30);
    doc.setFontSize(9);
    doc.text(`Order #: ${order.order_number}`, 14, 38);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 44);
    doc.text(`Customer: ${order.customer_name}`, 14, 50);
    doc.text(`Email: ${order.customer_email}`, 14, 56);
    doc.text(`Phone: ${order.customer_phone}`, 14, 62);
    let y = 72;
    doc.setFontSize(10);
    doc.text('Items', 14, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, 182, 5, 'F');
    doc.text('Product', 16, y + 4);
    doc.text('Qty', 120, y + 4);
    doc.text('Unit Price', 140, y + 4);
    doc.text('Total', 175, y + 4);
    y += 8;
    for (const item of items) {
      doc.text(item.product_name.substring(0, 30), 16, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`₹${item.unit_price.toFixed(2)}`, 140, y);
      doc.text(`₹${item.line_total.toFixed(2)}`, 175, y);
      y += 5;
      if (y > 270) { doc.addPage(); y = 20; }
    }
    y += 4;
    doc.line(14, y, 196, y);
    y += 6;
    doc.text(`Subtotal: ₹${order.subtotal.toFixed(2)}`, 150, y);
    y += 5;
    if (order.coupon_discount > 0) {
      doc.text(`Discount (${order.coupon_code}): -₹${order.coupon_discount.toFixed(2)}`, 150, y);
      y += 5;
    }
    doc.text(`GST (18%): ₹${order.gst_amount.toFixed(2)}`, 150, y);
    y += 5;
    doc.setFontSize(10);
    doc.text(`Total: ₹${order.grand_total.toFixed(2)}`, 150, y);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.order_number}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
}
