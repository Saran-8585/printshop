import db from '../db/database.js';
import { jsPDF } from 'jspdf';

export function createOrder(req, res) {
  try {
    const { items, customer_name, customer_email, customer_phone, delivery_address, order_notes, subtotal, coupon_code, coupon_discount, payment_method } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    const gstAmount = Math.round((subtotal - (coupon_discount || 0)) * 0.18 * 100) / 100;
    const grandTotal = Math.round((subtotal - (coupon_discount || 0) + gstAmount) * 100) / 100;

    // Generate order number: ORD-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = db.prepare("SELECT COUNT(*) as cnt FROM orders WHERE order_number LIKE ?").get(`ORD-${dateStr}-%`);
    const seq = String(countToday.cnt + 1).padStart(3, '0');
    const orderNumber = `ORD-${dateStr}-${seq}`;

    const addressStr = typeof delivery_address === 'string' ? delivery_address : JSON.stringify(delivery_address);

    const result = db.prepare(
      `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, delivery_address, order_notes, subtotal, coupon_code, coupon_discount, gst_amount, grand_total, payment_method, payment_status, status, internal_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'pending', '', datetime('now'), datetime('now'))`
    ).run(
      orderNumber, req.user?.id || null, customer_name, customer_email, customer_phone,
      addressStr, order_notes || '', subtotal, coupon_code || '', coupon_discount || 0,
      gstAmount, grandTotal, payment_method
    );

    const orderId = result.lastInsertRowid;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, category, configuration, design_file_path, design_notes, no_design_flag, quantity, unit_price, discount_applied, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const item of items) {
      insertItem.run(
        orderId, item.product_id, item.product_name, item.category,
        JSON.stringify(item.configuration), item.design_file_path || '',
        item.design_notes || '', item.no_design_flag ? 1 : 0,
        item.quantity, item.unit_price, item.discount_applied || 0, item.line_total
      );
      // Update product order count
      db.prepare('UPDATE products SET order_count = order_count + ? WHERE id = ?').run(item.quantity, item.product_id);
    }

    // Status history
    db.prepare("INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, 'pending', 'customer', 'Order placed')").run(orderId);

    // Update coupon usage
    if (coupon_code) {
      db.prepare('UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?').run(coupon_code);
    }

    res.status(201).json({ order_id: orderId, order_number: orderNumber, grand_total: grandTotal, gst_amount: gstAmount, coupon_discount: coupon_discount || 0 });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

export function getMyOrders(req, res) {
  try {
    const orders = db.prepare(
      "SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC"
    ).all(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export function getOrder(req, res) {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check access
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const statusHistory = db.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC').all(order.id);

    // Parse configurations
    for (const item of items) {
      try { item.configuration = JSON.parse(item.configuration); } catch (e) { /* keep as string */ }
    }
    try { order.delivery_address = JSON.parse(order.delivery_address); } catch (e) { /* keep as string */ }

    res.json({ ...order, items, status_history: statusHistory });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

export function listAllOrders(req, res) {
  try {
    const { status, search, dateFrom, dateTo } = req.query;
    let sql = "SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count FROM orders o WHERE 1=1";
    const params = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (dateFrom) {
      sql += ' AND o.created_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ' AND o.created_at <= ?';
      params.push(dateTo + 'T23:59:59.999Z');
    }

    sql += ' ORDER BY o.created_at DESC';
    const orders = db.prepare(sql).all(...params);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export function updateOrderStatus(req, res) {
  try {
    const { status, internal_notes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);

    if (internal_notes !== undefined) {
      db.prepare('UPDATE orders SET internal_notes = ? WHERE id = ?').run(internal_notes, req.params.id);
    }

    db.prepare(
      "INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, ?, ?, ?)"
    ).run(req.params.id, status, req.user.role === 'admin' ? 'admin' : 'customer', `Status changed to ${status}`);

    res.json({ message: 'Order status updated', status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

export function cancelOrder(req, res) {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled' });

    db.prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    db.prepare(
      "INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, 'cancelled', 'customer', 'Cancelled by customer')"
    ).run(req.params.id);

    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
}

export function generateInvoice(req, res) {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    let addressStr = order.delivery_address;
    try { const addr = JSON.parse(addressStr); addressStr = `${addr.line1}, ${addr.line2}, ${addr.city}, ${addr.state} - ${addr.pincode}`; } catch (e) {}

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('PRINTSHOP', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Premium Print Solutions', 105, 27, { align: 'center' });
    doc.line(20, 32, 190, 32);

    doc.setFontSize(14);
    doc.text('INVOICE', 105, 42, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Invoice #: ${order.order_number}`, 20, 52);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 20, 58);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 64);

    doc.text('Bill To:', 140, 52);
    doc.text(order.customer_name, 140, 58);
    doc.text(order.customer_email, 140, 64);
    doc.text(`Phone: ${order.customer_phone}`, 140, 70);
    doc.text(`Address: ${addressStr}`, 140, 76, { maxWidth: 60 });

    doc.line(20, 82, 190, 82);

    // Table header
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    const cols = [20, 85, 118, 142, 165];
    doc.text('Item', cols[0], 90);
    doc.text('Qty', cols[1], 90);
    doc.text('Unit Price', cols[2], 90);
    doc.text('Discount', cols[3], 90);
    doc.text('Total', cols[4], 90);
    doc.setFont('Helvetica', 'normal');
    doc.line(20, 92, 190, 92);

    let y = 100;
    for (const item of items) {
      let config = item.configuration;
      try { const c = JSON.parse(config); config = Object.values(c).slice(0, 3).join(', '); } catch (e) {}
      doc.text(`${item.product_name.substring(0, 25)}`, 20, y);
      doc.text(`${item.quantity}`, cols[1], y);
      doc.text(`₹${item.unit_price.toFixed(2)}`, cols[2], y);
      doc.text(`₹${item.discount_applied.toFixed(2)}`, cols[3], y);
      doc.text(`₹${item.line_total.toFixed(2)}`, cols[4], y);
      doc.setFontSize(7);
      doc.text(config, 20, y + 4);
      doc.setFontSize(9);
      y += 10;
      if (y > 250) { doc.addPage(); y = 20; }
    }

    doc.line(20, y + 2, 190, y + 2);

    y += 8;
    doc.text(`Subtotal:`, 140, y);
    doc.text(`₹${order.subtotal.toFixed(2)}`, 165, y, { align: 'right' });
    y += 6;
    if (order.coupon_discount > 0) {
      doc.text(`Coupon (${order.coupon_code}):`, 140, y);
      doc.text(`-₹${order.coupon_discount.toFixed(2)}`, 165, y, { align: 'right' });
      y += 6;
    }
    doc.text(`GST (18%):`, 140, y);
    doc.text(`₹${order.gst_amount.toFixed(2)}`, 165, y, { align: 'right' });
    y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.text(`Grand Total:`, 140, y);
    doc.text(`₹${order.grand_total.toFixed(2)}`, 165, y, { align: 'right' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.order_number}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
}
