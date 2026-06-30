import Product from '../models/Product.js';
import PricingRule from '../models/PricingRule.js';
import Review from '../models/Review.js';

export async function listProducts(req, res) {
  try {
    const { category, status, sort, minPrice, maxPrice, finish } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'active';
    if (minPrice || maxPrice) {
      filter.base_price = {};
      if (minPrice) filter.base_price.$gte = Number(minPrice);
      if (maxPrice) filter.base_price.$lte = Number(maxPrice);
    }
    if (finish) filter.available_finishes = { $regex: finish, $options: 'i' };
    const allowedSort = {
      price_asc: { base_price: 1 },
      price_desc: { base_price: -1 },
      popular: { order_count: -1 },
      newest: { created_at: -1 },
      rating: { avg_rating: -1 }
    };
    const sortOption = allowedSort[sort] || { order_count: -1 };
    const products = await Product.find(filter).sort(sortOption);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProduct(req, res) {
  try {
    if (!req.params.id || req.params.id === 'undefined' || req.params.id.length !== 24) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product.toObject());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, category, description, base_price, turnaround_time, available_sizes, available_finishes, status } = req.body;
    const product = await Product.create({
      name,
      category,
      description: description || '',
      base_price: Number(base_price),
      turnaround_time: turnaround_time || '3-5 business days',
      available_sizes: available_sizes || [],
      available_finishes: available_finishes || [],
      status: status || 'active',
    });
    const pid = product._id;
    const defaultRules = [
      { product: pid, min_qty: 1, max_qty: 4, discount_percent: 0 },
      { product: pid, min_qty: 5, max_qty: 9, discount_percent: 10 },
      { product: pid, min_qty: 10, max_qty: 24, discount_percent: 18 },
      { product: pid, min_qty: 25, max_qty: 999999, discount_percent: 25 },
    ];
    await PricingRule.insertMany(defaultRules);
    res.status(201).json({ id: pid.toString(), message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { name, category, description, base_price, turnaround_time, available_sizes, available_finishes } = req.body;
    await Product.findByIdAndUpdate(req.params.id, {
      name, category, description, base_price: Number(base_price), turnaround_time,
      available_sizes: available_sizes || [],
      available_finishes: available_finishes || [],
    });
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function toggleProductStatus(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    await Product.findByIdAndUpdate(req.params.id, { status: newStatus });
    res.json({ status: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
}

export async function getProductReviews(req, res) {
  try {
    if (!req.params.id || req.params.id === 'undefined' || req.params.id.length !== 24) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name')
      .sort({ created_at: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
