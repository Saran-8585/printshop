import Order from '../models/Order.js';
import User from '../models/User.js';
import OrderItem from '../models/OrderItem.js';

export async function getAdminDashboard(req, res) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      ordersToday,
      revenueToday,
      pendingOrders,
      totalCustomers,
      totalOrdersAgg,
      totalRevenueAgg,
      dailyRevenue,
      ordersByCategory,
      ordersByStatus,
      topProducts,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments({ created_at: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { created_at: { $gte: todayStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$grand_total' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$grand_total' } } }
      ]),
      Order.aggregate([
        { $match: { created_at: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          revenue: { $sum: '$grand_total' },
          orders_count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', revenue: 1, orders_count: 1, _id: 0 } }
      ]),
      OrderItem.aggregate([
        { $lookup: { from: 'orders', localField: 'order', foreignField: '_id', as: 'order' } },
        { $unwind: '$order' },
        { $match: { 'order.status': { $ne: 'cancelled' } } },
        { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$line_total' } } },
        { $sort: { count: -1 } },
        { $project: { category: '$_id', count: 1, total: 1, _id: 0 } }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]),
      OrderItem.aggregate([
        { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $lookup: { from: 'orders', localField: 'order', foreignField: '_id', as: 'order' } },
        { $unwind: '$order' },
        { $match: { 'order.status': { $ne: 'cancelled' } } },
        { $group: {
          _id: '$product._id',
          name: { $first: '$product.name' },
          category: { $first: '$product.category' },
          total_qty: { $sum: '$quantity' },
          order_count: { $addToSet: '$order' }
        }},
        { $project: {
          id: '$_id',
          name: 1,
          category: 1,
          total_qty: 1,
          order_count: { $size: '$order_count' }
        }},
        { $sort: { total_qty: -1 } },
        { $limit: 5 }
      ]),
      Order.aggregate([
        { $lookup: { from: 'orderitems', localField: '_id', foreignField: 'order', as: 'items' } },
        { $sort: { created_at: -1 } },
        { $limit: 10 },
        { $project: {
          id: '$_id',
          order_number: 1,
          customer_name: 1,
          grand_total: 1,
          status: 1,
          payment_method: 1,
          created_at: 1,
          items_count: { $size: '$items' }
        }}
      ]),
    ]);

    res.json({
      summary: {
        orders_today: ordersToday,
        revenue_today: revenueToday[0]?.total || 0,
        pending_orders: pendingOrders,
        total_customers: totalCustomers,
        total_orders: totalOrdersAgg,
        total_revenue: totalRevenueAgg[0]?.total || 0
      },
      charts: {
        daily_revenue: dailyRevenue,
        orders_by_category: ordersByCategory,
        orders_by_status: ordersByStatus,
        top_products: topProducts
      },
      recent_orders: recentOrders
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
