import bcrypt from 'bcryptjs';
import db, { initDatabase } from './database.js';

initDatabase();

function clearTables() {
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM order_status_history;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM finish_upcharges;
    DELETE FROM pricing_rules;
    DELETE FROM coupons;
    DELETE FROM addresses;
    DELETE FROM products;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);
}

function seed() {
  clearTables();
  console.log('Seeding database...');

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const hashedCust = bcrypt.hashSync('cust123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)'
  );

  insertUser.run('Admin User', 'admin@printshop.com', hashedPassword, '9876543210', 'admin');
  const custIds = [];
  for (let i = 1; i <= 5; i++) {
    const r = insertUser.run(
      `Customer ${i}`,
      `customer${i}@printshop.com`,
      hashedCust,
      `98765432${10 + i}`,
      'customer'
    );
    custIds.push(r.lastInsertRowid);
  }

  const insertProduct = db.prepare(
    'INSERT INTO products (name, category, description, base_price, turnaround_time, available_sizes, available_finishes, status, order_count, avg_rating, total_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const insertPricing = db.prepare(
    'INSERT INTO pricing_rules (product_id, min_qty, max_qty, discount_percent) VALUES (?, ?, ?, ?)'
  );

  const insertUpcharge = db.prepare(
    'INSERT INTO finish_upcharges (product_id, finish_name, upcharge_amount) VALUES (?, ?, ?)'
  );

  const insertOrder = db.prepare(
    `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, delivery_address, order_notes, subtotal, coupon_code, coupon_discount, gst_amount, grand_total, payment_method, payment_status, status, internal_notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertOrderItem = db.prepare(
    `INSERT INTO order_items (order_id, product_id, product_name, category, configuration, design_file_path, design_notes, no_design_flag, quantity, unit_price, discount_applied, line_total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertStatusHistory = db.prepare(
    'INSERT INTO order_status_history (order_id, status, changed_by, notes, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  const insertReview = db.prepare(
    'INSERT INTO reviews (product_id, user_id, order_item_id, rating, comment) VALUES (?, ?, ?, ?, ?)'
  );

  const insertCoupon = db.prepare(
    'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, usage_count, expiry_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const insertAddress = db.prepare(
    'INSERT INTO addresses (user_id, label, line1, line2, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  // Products - Posters
  const poster1 = insertProduct.run(
    'Premium Matte Poster',
    'posters',
    'High-quality matte finish posters printed on premium paper. Perfect for wall art, photography prints, and promotional displays. The matte finish reduces glare and gives a professional, elegant look.',
    25,
    '3-5 business days',
    JSON.stringify(['A4', 'A3', 'A2', 'A1']),
    JSON.stringify(['Matte', 'Glossy', 'Satin']),
    'active', 85, 4.3, 4
  );

  const poster2 = insertProduct.run(
    'Glossy Photo Poster',
    'posters',
    'Vibrant glossy photo posters with brilliant colour reproduction. Ideal for portraits, event posters, and marketing materials where colours need to pop. UV resistant coating protects against fading.',
    28,
    '3-5 business days',
    JSON.stringify(['A4', 'A3', 'A2', 'A1']),
    JSON.stringify(['Matte', 'Glossy', 'Satin']),
    'active', 62, 4.5, 3
  );

  const poster3 = insertProduct.run(
    'Satin Finish Art Print',
    'posters',
    'Professional satin finish art prints with a subtle sheen between matte and glossy. Museum-quality archival paper. Recommended for fine art reproductions, gallery prints, and premium photography.',
    30,
    '3-5 business days',
    JSON.stringify(['A4', 'A3', 'A2', 'A1']),
    JSON.stringify(['Matte', 'Glossy', 'Satin']),
    'active', 48, 4.7, 3
  );

  const productPosters = [poster1.lastInsertRowid, poster2.lastInsertRowid, poster3.lastInsertRowid];

  // Products - Stickers
  const sticker1 = insertProduct.run(
    'Custom Die-Cut Stickers',
    'stickers',
    'Custom shaped die-cut stickers made from high-quality vinyl. Available in various finishes including holographic and transparent. Perfect for branding, packaging, and personal projects. Waterproof option available.',
    12,
    '5-7 business days',
    JSON.stringify(['5×5cm', '7×7cm', '10×10cm']),
    JSON.stringify(['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic']),
    'active', 120, 4.6, 5
  );

  const sticker2 = insertProduct.run(
    'Glossy Square Stickers',
    'stickers',
    'Bold glossy square stickers with vibrant print quality. Ideal for product labels, branding stickers, and promotional giveaways. Durable vinyl with strong adhesive backing.',
    8,
    '5-7 business days',
    JSON.stringify(['5×5cm', '7×7cm', '10×10cm']),
    JSON.stringify(['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic']),
    'active', 95, 4.4, 3
  );

  const sticker3 = insertProduct.run(
    'Holographic Circle Stickers',
    'stickers',
    'Eye-catching holographic circle stickers that shine and shimmer in light. Great for special editions, event stickers, and premium packaging. Each sticker has a unique rainbow effect.',
    10,
    '5-7 business days',
    JSON.stringify(['5×5cm', '7×7cm', '10×10cm']),
    JSON.stringify(['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic']),
    'active', 73, 4.8, 4
  );

  const productStickers = [sticker1.lastInsertRowid, sticker2.lastInsertRowid, sticker3.lastInsertRowid];

  // Products - Visiting Cards
  const vc1 = insertProduct.run(
    'Premium Business Cards',
    'visiting-cards',
    'Professional premium business cards on heavy 350gsm stock. Choose from multiple finishes including Soft Touch and Spot UV. Stand out with our premium quality card stock and precise cutting.',
    3,
    '4-6 business days',
    JSON.stringify(['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)']),
    JSON.stringify(['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil']),
    'active', 156, 4.5, 5
  );

  const vc2 = insertProduct.run(
    'Luxury Spot UV Cards',
    'visiting-cards',
    'Make an impression with Spot UV coated business cards. The glossy UV coating highlights selected areas creating a striking contrast against the matte background. 400gsm premium stock.',
    4,
    '4-6 business days',
    JSON.stringify(['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)']),
    JSON.stringify(['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil']),
    'active', 89, 4.6, 3
  );

  const vc3 = insertProduct.run(
    'Foil Print Visiting Cards',
    'visiting-cards',
    'Luxurious foil printed business cards available in Gold or Silver. The metallic foil creates a premium raised effect that catches light beautifully. Choose from gold or silver foil on premium card stock.',
    5,
    '5-7 business days',
    JSON.stringify(['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)']),
    JSON.stringify(['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil']),
    'active', 67, 4.9, 4
  );

  const productVC = [vc1.lastInsertRowid, vc2.lastInsertRowid, vc3.lastInsertRowid];

  const allProducts = [...productPosters, ...productStickers, ...productVC];

  // Pricing Rules (bulk discount tiers)
  for (const pid of allProducts) {
    insertPricing.run(pid, 1, 4, 0);
    insertPricing.run(pid, 5, 9, 10);
    insertPricing.run(pid, 10, 24, 18);
    insertPricing.run(pid, 25, 999999, 25);
  }

  // Finish upcharges
  for (const pid of productPosters) {
    insertUpcharge.run(pid, 'Matte', 0);
    insertUpcharge.run(pid, 'Glossy', 0);
    insertUpcharge.run(pid, 'Satin', 5);
  }

  for (const pid of productStickers) {
    insertUpcharge.run(pid, 'Matte Laminate', 0);
    insertUpcharge.run(pid, 'Gloss Laminate', 0);
    insertUpcharge.run(pid, 'Transparent', 5);
    insertUpcharge.run(pid, 'Holographic', 8);
  }

  for (const pid of productVC) {
    insertUpcharge.run(pid, 'Matte', 0);
    insertUpcharge.run(pid, 'Glossy', 0);
    insertUpcharge.run(pid, 'Soft Touch', 500);
    insertUpcharge.run(pid, 'Spot UV', 300);
    insertUpcharge.run(pid, 'Foil', 800);
  }

  // Coupons
  insertCoupon.run('WELCOME10', 'percentage', 10, 500, 100, 15, '2026-12-31', 1);
  insertCoupon.run('BULK20', 'percentage', 20, 2000, 50, 8, '2026-12-31', 1);
  insertCoupon.run('FLAT100', 'flat', 100, 800, 30, 12, '2026-12-31', 1);

  // Addresses for customers
  const cities = [
    { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    { city: 'Delhi', state: 'Delhi', pincode: '110001' },
    { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  ];
  const streets = ['123 MG Road', '456 Park Street', '789 Brigade Road', '321 FC Road', '654 Anna Salai'];

  for (let i = 0; i < custIds.length; i++) {
    insertAddress.run(custIds[i], 'Home', streets[i], 'Near Main Market', cities[i].city, cities[i].state, cities[i].pincode, 1);
  }

  // Orders
  const statuses = ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['UPI', 'Net Banking', 'Credit Card', 'Debit Card', 'COD'];

  const configurations = {
    posters: {
      base_config: { size: 'A4', finish: 'Matte', weight: '170gsm' },
      configs: [
        { size: 'A3', finish: 'Glossy', weight: '250gsm' },
        { size: 'A4', finish: 'Satin', weight: '170gsm' },
        { size: 'A2', finish: 'Matte', weight: '130gsm' },
        { size: 'A1', finish: 'Glossy', weight: '250gsm' },
        { size: 'A4', finish: 'Matte', weight: '170gsm' },
        { size: 'A3', finish: 'Satin', weight: '170gsm' },
      ]
    },
    stickers: {
      base_config: { type: 'Die-Cut', size: '7×7cm', finish: 'Matte Laminate', waterproof: false },
      configs: [
        { type: 'Square', size: '5×5cm', finish: 'Gloss Laminate', waterproof: true },
        { type: 'Circle', size: '10×10cm', finish: 'Holographic', waterproof: false },
        { type: 'Die-Cut', size: '7×7cm', finish: 'Transparent', waterproof: true },
        { type: 'Square', size: '10×10cm', finish: 'Gloss Laminate', waterproof: false },
        { type: 'Circle', size: '5×5cm', finish: 'Matte Laminate', waterproof: true },
      ]
    },
    'visiting-cards': {
      base_config: { size: 'Standard (90×54mm)', finish: 'Matte', thickness: '350gsm', corners: 'Rounded', sides: 'Double' },
      configs: [
        { size: 'Standard (90×54mm)', finish: 'Soft Touch', thickness: '400gsm', corners: 'Square', sides: 'Single' },
        { size: 'Square (55×55mm)', finish: 'Spot UV', thickness: '350gsm', corners: 'Rounded', sides: 'Double' },
        { size: 'Mini (85×28mm)', finish: 'Foil', thickness: '300gsm', corners: 'Square', sides: 'Single' },
        { size: 'Standard (90×54mm)', finish: 'Glossy', thickness: '350gsm', corners: 'Rounded', sides: 'Double' },
      ]
    }
  };

  const catProducts = {
    posters: productPosters,
    stickers: productStickers,
    'visiting-cards': productVC
  };

  const catNames = {
    posters: 'Posters',
    stickers: 'Stickers',
    'visiting-cards': 'Visiting Cards'
  };

  const productNames = {
    [poster1.lastInsertRowid]: 'Premium Matte Poster',
    [poster2.lastInsertRowid]: 'Glossy Photo Poster',
    [poster3.lastInsertRowid]: 'Satin Finish Art Print',
    [sticker1.lastInsertRowid]: 'Custom Die-Cut Stickers',
    [sticker2.lastInsertRowid]: 'Glossy Square Stickers',
    [sticker3.lastInsertRowid]: 'Holographic Circle Stickers',
    [vc1.lastInsertRowid]: 'Premium Business Cards',
    [vc2.lastInsertRowid]: 'Luxury Spot UV Cards',
    [vc3.lastInsertRowid]: 'Foil Print Visiting Cards'
  };

  const orderCounts = {};
  for (const pid of allProducts) orderCounts[pid] = 0;

  // Generate 25 orders
  for (let i = 0; i < 25; i++) {
    const custIdx = i % custIds.length;
    const userId = custIds[custIdx];
    const createdAt = new Date(Date.now() - (25 - i) * 86400000 * (Math.random() * 0.5 + 0.5));
    const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(i + 1).padStart(3, '0');
    const orderNumber = `ORD-${dateStr}-${seq}`;

    // Pick a random category
    const cats = ['posters', 'stickers', 'visiting-cards'];
    const cat = cats[i % 3];
    const catProdArr = catProducts[cat];
    const prodsUsed = [
      catProdArr[i % catProdArr.length],
      catProdArr[(i + 1) % catProdArr.length]
    ];

    const catConfig = configurations[cat];
    const items = [];
    let subtotal = 0;
    let numItems = (i % 3) + 1;

    let allItems = [];

    for (let j = 0; j < numItems; j++) {
      const pid = catProdArr[(i + j) % catProdArr.length];
      const qty = [5, 10, 25, 50, 100][i % 5];
      const configIdx = j % catConfig.configs.length;
      const cfg = { ...catConfig.configs[configIdx], quantity: qty };

      let unitPrice = 0;
      const basePriceRow = db.prepare('SELECT base_price FROM products WHERE id = ?').get(pid);
      const basePrice = basePriceRow.base_price;

      let discountPercent = 0;
      const rule = db.prepare('SELECT discount_percent FROM pricing_rules WHERE product_id = ? AND min_qty <= ? AND max_qty >= ?').get(pid, qty, qty);
      if (rule) discountPercent = rule.discount_percent;

      const upchargeRow = db.prepare('SELECT upcharge_amount FROM finish_upcharges WHERE product_id = ? AND finish_name = ?').get(pid, cfg.finish);
      const upcharge = upchargeRow ? upchargeRow.upcharge_amount : 0;

      let effectiveUnitPrice = basePrice + upcharge;
      if (cat === 'stickers' && cfg.waterproof) {
        effectiveUnitPrice = effectiveUnitPrice * 1.1;
      }
      if (cat === 'visiting-cards') {
        if (cfg.sides === 'Double') effectiveUnitPrice += 200 / qty;
        if (cfg.corners === 'Rounded') effectiveUnitPrice += 150 / qty;
      }

      const discountedPrice = effectiveUnitPrice * (1 - discountPercent / 100);
      const lineTotal = Math.round(discountedPrice * qty * 100) / 100;
      subtotal += lineTotal;

      orderCounts[pid] = (orderCounts[pid] || 0) + qty;

      allItems.push({
        pid,
        name: productNames[pid],
        category: cat,
        configuration: JSON.stringify(cfg),
        design_file_path: '',
        design_notes: '',
        no_design_flag: i % 3 === 0 ? 1 : 0,
        quantity: qty,
        unit_price: Math.round(discountedPrice * 100) / 100,
        discount_applied: Math.round((effectiveUnitPrice - discountedPrice) * 100) / 100,
        line_total: lineTotal
      });
    }

    // Apply random coupon sometimes
    let couponCode = '';
    let couponDiscount = 0;
    let gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
    let grandTotal = subtotal + gstAmount;

    if (i % 5 === 0 && subtotal >= 500) {
      couponCode = 'WELCOME10';
      couponDiscount = Math.round(subtotal * 0.1 * 100) / 100;
      const afterCoupon = subtotal - couponDiscount;
      gstAmount = Math.round(afterCoupon * 0.18 * 100) / 100;
      grandTotal = afterCoupon + gstAmount;
    }

    const status = statuses[i % statuses.length];
    const paymentMethod = paymentMethods[i % paymentMethods.length];
    const customerName = `Customer ${custIdx + 1}`;
    const customerEmail = `customer${custIdx + 1}@printshop.com`;
    const customerPhone = `98765432${10 + custIdx}`;
    const deliveryAddress = JSON.stringify({
      line1: streets[custIdx],
      line2: 'Near Main Market',
      city: cities[custIdx].city,
      state: cities[custIdx].state,
      pincode: cities[custIdx].pincode
    });

    insertOrder.run(
      orderNumber, userId, customerName, customerEmail, customerPhone,
      deliveryAddress, i % 4 === 0 ? 'Please handle with care. Rush order.' : '',
      subtotal, couponCode, couponDiscount, gstAmount, grandTotal,
      paymentMethod, 'completed', status, '',
      createdAt.toISOString(), createdAt.toISOString()
    );
    const orderId = db.prepare('SELECT id FROM orders WHERE order_number = ?').get(orderNumber).id;

    for (const item of allItems) {
      insertOrderItem.run(
        orderId, item.pid, item.name, item.category,
        item.configuration, item.design_file_path, item.design_notes,
        item.no_design_flag, item.quantity, item.unit_price,
        item.discount_applied, item.line_total
      );
    }

    // Status history
    const statusFlow = ['pending', 'confirmed', 'printing', 'shipped', 'delivered'];
    const statusIdx = statusFlow.indexOf(status);
    if (statusIdx >= 0) {
      insertStatusHistory.run(orderId, 'pending', 'system', 'Order placed', createdAt.toISOString());
      for (let s = 1; s <= statusIdx; s++) {
        const stDate = new Date(createdAt.getTime() + s * 86400000);
        insertStatusHistory.run(orderId, statusFlow[s], 'system', `Status updated to ${statusFlow[s]}`, stDate.toISOString());
      }
    } else if (status === 'cancelled') {
      insertStatusHistory.run(orderId, 'pending', 'system', 'Order placed', createdAt.toISOString());
      insertStatusHistory.run(orderId, 'cancelled', 'customer', 'Cancelled by customer', new Date(createdAt.getTime() + 86400000).toISOString());
    }
  }

  // Update order counts
  for (const [pid, count] of Object.entries(orderCounts)) {
    db.prepare('UPDATE products SET order_count = ? WHERE id = ?').run(count, pid);
  }

  // Reviews
  const deliveredOrders = db.prepare("SELECT id FROM orders WHERE status = 'delivered'").all();
  const deliveredItems = db.prepare('SELECT oi.id, oi.product_id FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status = ?').all('delivered');

  const reviewComments = {
    5: ['Absolutely stunning print quality! Highly recommended.', 'Perfect finish and fast delivery. Will order again.', 'Exceeded my expectations. The colours are vibrant!'],
    4: ['Great quality for the price. Very satisfied.', 'Good print quality. Delivery was on time.', 'Nice product. Would recommend to others.'],
    3: ['Decent quality but could be better.', 'Okay product for the price point.']
  };

  for (let i = 0; i < Math.min(12, deliveredItems.length); i++) {
    const item = deliveredItems[i];
    const rating = [5, 5, 4, 5, 4, 3, 5, 4, 5, 4, 5, 5][i];
    const comments = reviewComments[rating] || ['Great product!'];
    const comment = comments[i % comments.length];
    const userId = custIds[i % custIds.length];
    insertReview.run(item.product_id, userId, item.id, rating, comment);

    // Update product review stats
    const stats = db.prepare('SELECT avg_rating, total_reviews FROM products WHERE id = ?').get(item.product_id);
    const newTotal = stats.total_reviews + 1;
    const newAvg = ((stats.avg_rating * stats.total_reviews) + rating) / newTotal;
    db.prepare('UPDATE products SET avg_rating = ?, total_reviews = ? WHERE id = ?').run(Math.round(newAvg * 10) / 10, newTotal, item.product_id);
  }

  console.log('Database seeded successfully!');
  console.log('Admin: admin@printshop.com / admin123');
  console.log('Customer: customer1@printshop.com / cust123');
}

seed();
