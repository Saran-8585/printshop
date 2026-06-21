import db from '../db/database.js';

export function listProducts(req, res) {
  try {
    const { category, status, sort, minPrice, maxPrice, finish } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    } else {
      sql += " AND status = 'active'";
    }
    if (minPrice) {
      sql += ' AND base_price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ' AND base_price <= ?';
      params.push(Number(maxPrice));
    }
    if (finish) {
      sql += ' AND available_finishes LIKE ?';
      params.push(`%${finish}%`);
    }

    const allowedSort = {
      'price_asc': 'base_price ASC',
      'price_desc': 'base_price DESC',
      'popular': 'order_count DESC',
      'newest': 'created_at DESC',
      'rating': 'avg_rating DESC'
    };
    sql += ' ORDER BY ' + (allowedSort[sort] || 'order_count DESC');

    const products = db.prepare(sql).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export function getProduct(req, res) {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Parse JSON fields for response
    product.available_sizes = JSON.parse(product.available_sizes || '[]');
    product.available_finishes = JSON.parse(product.available_finishes || '[]');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export function createProduct(req, res) {
  try {
    const { name, category, description, base_price, turnaround_time, available_sizes, available_finishes, status } = req.body;
    const result = db.prepare(
      'INSERT INTO products (name, category, description, base_price, turnaround_time, available_sizes, available_finishes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      name, category, description || '', Number(base_price), turnaround_time || '3-5 business days',
      JSON.stringify(available_sizes || []), JSON.stringify(available_finishes || []), status || 'active'
    );

    // Add default pricing rules
    const pid = result.lastInsertRowid;
    const rules = db.prepare('INSERT INTO pricing_rules (product_id, min_qty, max_qty, discount_percent) VALUES (?, ?, ?, ?)');
    rules.run(pid, 1, 4, 0);
    rules.run(pid, 5, 9, 10);
    rules.run(pid, 10, 24, 18);
    rules.run(pid, 25, 999999, 25);

    res.status(201).json({ id: pid, message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export function updateProduct(req, res) {
  try {
    const { name, category, description, base_price, turnaround_time, available_sizes, available_finishes } = req.body;
    db.prepare(
      'UPDATE products SET name=?, category=?, description=?, base_price=?, turnaround_time=?, available_sizes=?, available_finishes=? WHERE id=?'
    ).run(
      name, category, description, Number(base_price), turnaround_time,
      JSON.stringify(available_sizes || []), JSON.stringify(available_finishes || []), req.params.id
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export function toggleProductStatus(req, res) {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    db.prepare('UPDATE products SET status = ? WHERE id = ?').run(newStatus, req.params.id);
    res.json({ status: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
}

export function getProductReviews(req, res) {
  try {
    const reviews = db.prepare(
      'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC'
    ).all(req.params.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
