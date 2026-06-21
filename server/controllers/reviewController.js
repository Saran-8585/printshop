import db from '../db/database.js';

export function createReview(req, res) {
  try {
    const { product_id, order_item_id, rating, comment } = req.body;

    // Check order item belongs to user and is delivered
    const orderItem = db.prepare(
      'SELECT oi.*, o.status, o.user_id FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.id = ?'
    ).get(order_item_id);

    if (!orderItem) return res.status(404).json({ error: 'Order item not found' });
    if (orderItem.user_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
    if (orderItem.status !== 'delivered') return res.status(400).json({ error: 'Can only review delivered items' });

    // Check if already reviewed
    const existing = db.prepare('SELECT id FROM reviews WHERE order_item_id = ? AND user_id = ?').get(order_item_id, req.user.id);
    if (existing) return res.status(400).json({ error: 'Already reviewed this item' });

    db.prepare('INSERT INTO reviews (product_id, user_id, order_item_id, rating, comment) VALUES (?, ?, ?, ?, ?)').run(
      product_id, req.user.id, order_item_id, rating, comment || ''
    );

    // Update product rating
    const stats = db.prepare('SELECT avg_rating, total_reviews FROM products WHERE id = ?').get(product_id);
    const newTotal = stats.total_reviews + 1;
    const newAvg = ((stats.avg_rating * stats.total_reviews) + rating) / newTotal;
    db.prepare('UPDATE products SET avg_rating = ?, total_reviews = ? WHERE id = ?').run(Math.round(newAvg * 10) / 10, newTotal, product_id);

    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
}

export function updateReview(req, res) {
  try {
    const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const { rating, comment } = req.body;
    db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?').run(rating, comment, req.params.id);

    // Recalculate product rating
    const productStats = db.prepare('SELECT AVG(rating) as avg_r, COUNT(*) as total FROM reviews WHERE product_id = ?').get(review.product_id);
    db.prepare('UPDATE products SET avg_rating = ?, total_reviews = ? WHERE id = ?').run(
      Math.round(productStats.avg_r * 10) / 10, productStats.total, review.product_id
    );

    res.json({ message: 'Review updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
}

export function getDeliveredItemsWithoutReview(req, res) {
  try {
    const items = db.prepare(`
      SELECT oi.id, oi.product_id, oi.product_name, oi.category, oi.configuration, oi.quantity, o.order_number, o.created_at
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ? AND o.status = 'delivered'
      AND oi.id NOT IN (SELECT order_item_id FROM reviews WHERE user_id = ? AND order_item_id IS NOT NULL)
      ORDER BY o.created_at DESC
    `).all(req.user.id, req.user.id);

    for (const item of items) {
      try { item.configuration = JSON.parse(item.configuration); } catch (e) {}
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
}

export function getUserReviews(req, res) {
  try {
    const reviews = db.prepare(`
      SELECT r.*, p.name as product_name, p.category
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(req.user.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
