import Review from '../models/Review.js';
import OrderItem from '../models/OrderItem.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export async function createReview(req, res) {
  try {
    const { product_id, order_item_id, rating, comment } = req.body;
    const orderItem = await OrderItem.findById(order_item_id).populate('order');
    if (!orderItem) return res.status(404).json({ error: 'Order item not found' });
    if (orderItem.order.user?.toString() !== req.user.id) return res.status(403).json({ error: 'Not your order' });
    if (orderItem.order.status !== 'delivered') return res.status(400).json({ error: 'Can only review delivered items' });
    const existing = await Review.findOne({ order_item: order_item_id, user: req.user.id });
    if (existing) return res.status(400).json({ error: 'Already reviewed this item' });
    await Review.create({
      product: product_id,
      user: req.user.id,
      order_item: order_item_id,
      rating,
      comment: comment || '',
    });
    const stats = await Review.aggregate([
      { $match: { product: product_id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const newAvg = stats[0]?.avg || rating;
    const newTotal = stats[0]?.count || 1;
    await Product.findByIdAndUpdate(product_id, {
      avg_rating: Math.round(newAvg * 10) / 10,
      total_reviews: newTotal,
    });
    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
}

export async function updateReview(req, res) {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    const { rating, comment } = req.body;
    await Review.findByIdAndUpdate(req.params.id, { rating, comment });
    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    await Product.findByIdAndUpdate(review.product, {
      avg_rating: Math.round((stats[0]?.avg || rating) * 10) / 10,
      total_reviews: stats[0]?.count || 1,
    });
    res.json({ message: 'Review updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
}

export async function getDeliveredItemsWithoutReview(req, res) {
  try {
    const items = await OrderItem.aggregate([
      { $lookup: { from: 'orders', localField: 'order', foreignField: '_id', as: 'order' } },
      { $unwind: '$order' },
      { $match: { 'order.user': req.user.id, 'order.status': 'delivered' } },
      { $lookup: { from: 'reviews', localField: '_id', foreignField: 'order_item', as: 'reviews' } },
      { $match: { reviews: { $size: 0 } } },
      { $project: {
        id: '$_id',
        product_id: '$product',
        product_name: 1,
        category: 1,
        configuration: 1,
        quantity: 1,
        order_number: '$order.order_number',
        created_at: '$order.created_at'
      }},
      { $sort: { created_at: -1 } }
    ]);
    for (const item of items) {
      if (typeof item.configuration === 'string') {
        try { item.configuration = JSON.parse(item.configuration); } catch (e) { }
      }
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
}

export async function getUserReviews(req, res) {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name category')
      .sort({ created_at: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
