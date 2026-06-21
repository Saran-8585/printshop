import db from '../db/database.js';

export function getAdminDashboard(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const ordersToday = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?").get(today);
    const revenueToday = db.prepare("SELECT COALESCE(SUM(grand_total), 0) as total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'").get(today);
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get();
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get();
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get();
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(grand_total), 0) as total FROM orders WHERE status != 'cancelled'").get();

    // Daily revenue for last 30 days
    const dailyRevenue = db.prepare(`
      SELECT date(created_at) as date, COALESCE(SUM(grand_total), 0) as revenue, COUNT(*) as orders_count
      FROM orders WHERE created_at >= datetime('now', '-30 days') AND status != 'cancelled'
      GROUP BY date(created_at) ORDER BY date(created_at) ASC
    `).all();

    // Orders by category
    const ordersByCategory = db.prepare(`
      SELECT oi.category, COUNT(*) as count, SUM(oi.line_total) as total
      FROM order_items oi JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.category ORDER BY count DESC
    `).all();

    // Orders by status
    const ordersByStatus = db.prepare(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC
    `).all();

    // Top products
    const topProducts = db.prepare(`
      SELECT p.id, p.name, p.category, SUM(oi.quantity) as total_qty, COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id ORDER BY total_qty DESC LIMIT 5
    `).all();

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT o.id, o.order_number, o.customer_name, o.grand_total, o.status, o.payment_method, o.created_at,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o ORDER BY o.created_at DESC LIMIT 10
    `).all();

    res.json({
      summary: {
        orders_today: ordersToday.count,
        revenue_today: revenueToday.total,
        pending_orders: pendingOrders.count,
        total_customers: totalCustomers.count,
        total_orders: totalOrders.count,
        total_revenue: totalRevenue.total
      },
      charts: { daily_revenue: dailyRevenue, orders_by_category: ordersByCategory, orders_by_status: ordersByStatus, top_products: topProducts },
      recent_orders: recentOrders
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
