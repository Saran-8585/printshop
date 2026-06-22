import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import PricingRule from '../models/PricingRule.js';
import FinishUpcharge from '../models/FinishUpcharge.js';
import Coupon from '../models/Coupon.js';
import Address from '../models/Address.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import OrderStatusHistory from '../models/OrderStatusHistory.js';
import Review from '../models/Review.js';
import Counter from '../models/Counter.js';

async function clearCollections() {
  const collections = [
    Review, OrderStatusHistory, OrderItem, Order,
    FinishUpcharge, PricingRule, Coupon, Address, Product, User, Counter
  ];
  for (const Model of collections) {
    await Model.deleteMany({});
  }
}

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/printshop';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await clearCollections();
  console.log('Seeding database...');

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const hashedCust = bcrypt.hashSync('cust123', 10);

  const admin = await User.create({ name: 'Admin User', email: 'admin@printshop.com', password: hashedPassword, phone: '9876543210', role: 'admin' });
  const custIds = [];
  for (let i = 1; i <= 5; i++) {
    const user = await User.create({ name: `Customer ${i}`, email: `customer${i}@printshop.com`, password: hashedCust, phone: `98765432${10 + i}`, role: 'customer' });
    custIds.push(user._id);
  }

  const poster1 = await Product.create({
    name: 'Premium Matte Poster', category: 'posters',
    description: 'High-quality matte finish posters printed on premium paper. Perfect for wall art, photography prints, and promotional displays. The matte finish reduces glare and gives a professional, elegant look.',
    base_price: 25, turnaround_time: '3-5 business days',
    available_sizes: ['A4', 'A3', 'A2', 'A1'],
    available_finishes: ['Matte', 'Glossy', 'Satin'],
    status: 'active', order_count: 85, avg_rating: 4.3, total_reviews: 4
  });

  const poster2 = await Product.create({
    name: 'Glossy Photo Poster', category: 'posters',
    description: 'Vibrant glossy photo posters with brilliant colour reproduction. Ideal for portraits, event posters, and marketing materials where colours need to pop. UV resistant coating protects against fading.',
    base_price: 28, turnaround_time: '3-5 business days',
    available_sizes: ['A4', 'A3', 'A2', 'A1'],
    available_finishes: ['Matte', 'Glossy', 'Satin'],
    status: 'active', order_count: 62, avg_rating: 4.5, total_reviews: 3
  });

  const poster3 = await Product.create({
    name: 'Satin Finish Art Print', category: 'posters',
    description: 'Professional satin finish art prints with a subtle sheen between matte and glossy. Museum-quality archival paper. Recommended for fine art reproductions, gallery prints, and premium photography.',
    base_price: 30, turnaround_time: '3-5 business days',
    available_sizes: ['A4', 'A3', 'A2', 'A1'],
    available_finishes: ['Matte', 'Glossy', 'Satin'],
    status: 'active', order_count: 48, avg_rating: 4.7, total_reviews: 3
  });

  const productPosters = [poster1._id, poster2._id, poster3._id];

  const sticker1 = await Product.create({
    name: 'Custom Die-Cut Stickers', category: 'stickers',
    description: 'Custom shaped die-cut stickers made from high-quality vinyl. Available in various finishes including holographic and transparent. Perfect for branding, packaging, and personal projects. Waterproof option available.',
    base_price: 12, turnaround_time: '5-7 business days',
    available_sizes: ['5×5cm', '7×7cm', '10×10cm'],
    available_finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic'],
    status: 'active', order_count: 120, avg_rating: 4.6, total_reviews: 5
  });

  const sticker2 = await Product.create({
    name: 'Glossy Square Stickers', category: 'stickers',
    description: 'Bold glossy square stickers with vibrant print quality. Ideal for product labels, branding stickers, and promotional giveaways. Durable vinyl with strong adhesive backing.',
    base_price: 8, turnaround_time: '5-7 business days',
    available_sizes: ['5×5cm', '7×7cm', '10×10cm'],
    available_finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic'],
    status: 'active', order_count: 95, avg_rating: 4.4, total_reviews: 3
  });

  const sticker3 = await Product.create({
    name: 'Holographic Circle Stickers', category: 'stickers',
    description: 'Eye-catching holographic circle stickers that shine and shimmer in light. Great for special editions, event stickers, and premium packaging. Each sticker has a unique rainbow effect.',
    base_price: 10, turnaround_time: '5-7 business days',
    available_sizes: ['5×5cm', '7×7cm', '10×10cm'],
    available_finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic'],
    status: 'active', order_count: 73, avg_rating: 4.8, total_reviews: 4
  });

  const productStickers = [sticker1._id, sticker2._id, sticker3._id];

  const vc1 = await Product.create({
    name: 'Premium Business Cards', category: 'visiting-cards',
    description: 'Professional premium business cards on heavy 350gsm stock. Choose from multiple finishes including Soft Touch and Spot UV. Stand out with our premium quality card stock and precise cutting.',
    base_price: 3, turnaround_time: '4-6 business days',
    available_sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'],
    available_finishes: ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
    status: 'active', order_count: 156, avg_rating: 4.5, total_reviews: 5
  });

  const vc2 = await Product.create({
    name: 'Luxury Spot UV Cards', category: 'visiting-cards',
    description: 'Make an impression with Spot UV coated business cards. The glossy UV coating highlights selected areas creating a striking contrast against the matte background. 400gsm premium stock.',
    base_price: 4, turnaround_time: '4-6 business days',
    available_sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'],
    available_finishes: ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
    status: 'active', order_count: 89, avg_rating: 4.6, total_reviews: 3
  });

  const vc3 = await Product.create({
    name: 'Foil Print Visiting Cards', category: 'visiting-cards',
    description: 'Luxurious foil printed business cards available in Gold or Silver. The metallic foil creates a premium raised effect that catches light beautifully. Choose from gold or silver foil on premium card stock.',
    base_price: 5, turnaround_time: '5-7 business days',
    available_sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'],
    available_finishes: ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
    status: 'active', order_count: 67, avg_rating: 4.9, total_reviews: 4
  });

  const productVC = [vc1._id, vc2._id, vc3._id];
  const allProducts = [...productPosters, ...productStickers, ...productVC];

  const pricingRulesData = [];
  for (const pid of allProducts) {
    pricingRulesData.push(
      { product: pid, min_qty: 1, max_qty: 4, discount_percent: 0 },
      { product: pid, min_qty: 5, max_qty: 9, discount_percent: 10 },
      { product: pid, min_qty: 10, max_qty: 24, discount_percent: 18 },
      { product: pid, min_qty: 25, max_qty: 999999, discount_percent: 25 }
    );
  }
  await PricingRule.insertMany(pricingRulesData);

  const upchargeData = [];
  for (const pid of productPosters) {
    upchargeData.push(
      { product: pid, finish_name: 'Matte', upcharge_amount: 0 },
      { product: pid, finish_name: 'Glossy', upcharge_amount: 0 },
      { product: pid, finish_name: 'Satin', upcharge_amount: 5 }
    );
  }
  for (const pid of productStickers) {
    upchargeData.push(
      { product: pid, finish_name: 'Matte Laminate', upcharge_amount: 0 },
      { product: pid, finish_name: 'Gloss Laminate', upcharge_amount: 0 },
      { product: pid, finish_name: 'Transparent', upcharge_amount: 5 },
      { product: pid, finish_name: 'Holographic', upcharge_amount: 8 }
    );
  }
  for (const pid of productVC) {
    upchargeData.push(
      { product: pid, finish_name: 'Matte', upcharge_amount: 0 },
      { product: pid, finish_name: 'Glossy', upcharge_amount: 0 },
      { product: pid, finish_name: 'Soft Touch', upcharge_amount: 500 },
      { product: pid, finish_name: 'Spot UV', upcharge_amount: 300 },
      { product: pid, finish_name: 'Foil', upcharge_amount: 800 }
    );
  }
  await FinishUpcharge.insertMany(upchargeData);

  await Coupon.insertMany([
    { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_amount: 500, max_uses: 100, usage_count: 15, expiry_date: new Date('2026-12-31'), is_active: true },
    { code: 'BULK20', discount_type: 'percentage', discount_value: 20, min_order_amount: 2000, max_uses: 50, usage_count: 8, expiry_date: new Date('2026-12-31'), is_active: true },
    { code: 'FLAT100', discount_type: 'flat', discount_value: 100, min_order_amount: 800, max_uses: 30, usage_count: 12, expiry_date: new Date('2026-12-31'), is_active: true },
  ]);

  const cities = [
    { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    { city: 'Delhi', state: 'Delhi', pincode: '110001' },
    { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  ];
  const streets = ['123 MG Road', '456 Park Street', '789 Brigade Road', '321 FC Road', '654 Anna Salai'];

  const addresses = [];
  for (let i = 0; i < custIds.length; i++) {
    addresses.push(await Address.create({
      user: custIds[i], label: 'Home', line1: streets[i], line2: 'Near Main Market',
      city: cities[i].city, state: cities[i].state, pincode: cities[i].pincode, is_default: true
    }));
  }

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

  const productNames = {
    [poster1._id.toString()]: 'Premium Matte Poster',
    [poster2._id.toString()]: 'Glossy Photo Poster',
    [poster3._id.toString()]: 'Satin Finish Art Print',
    [sticker1._id.toString()]: 'Custom Die-Cut Stickers',
    [sticker2._id.toString()]: 'Glossy Square Stickers',
    [sticker3._id.toString()]: 'Holographic Circle Stickers',
    [vc1._id.toString()]: 'Premium Business Cards',
    [vc2._id.toString()]: 'Luxury Spot UV Cards',
    [vc3._id.toString()]: 'Foil Print Visiting Cards'
  };

  const pidToDoc = {};
  for (const p of [poster1, poster2, poster3, sticker1, sticker2, sticker3, vc1, vc2, vc3]) {
    pidToDoc[p._id.toString()] = p;
  }

  const orderCounts = {};
  for (const pid of allProducts) orderCounts[pid.toString()] = 0;

  for (let i = 0; i < 25; i++) {
    const custIdx = i % custIds.length;
    const userId = custIds[custIdx];
    const createdAt = new Date(Date.now() - (25 - i) * 86400000 * (Math.random() * 0.5 + 0.5));
    const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(i + 1).padStart(3, '0');
    const orderNumber = `ORD-${dateStr}-${seq}`;

    const cats = ['posters', 'stickers', 'visiting-cards'];
    const cat = cats[i % 3];
    const catProdArr = catProducts[cat];
    const catConfig = configurations[cat];
    const items = [];
    let subtotal = 0;
    const numItems = (i % 3) + 1;

    const allOrderItems = [];

    for (let j = 0; j < numItems; j++) {
      const pid = catProdArr[(i + j) % catProdArr.length];
      const qty = [5, 10, 25, 50, 100][i % 5];
      const configIdx = j % catConfig.configs.length;
      const cfg = { ...catConfig.configs[configIdx], quantity: qty };

      const product = pidToDoc[pid.toString()];
      const basePrice = product.base_price;

      const rules = await PricingRule.find({ product: pid, min_qty: { $lte: qty }, max_qty: { $gte: qty } });
      let discountPercent = rules.length > 0 ? rules[0].discount_percent : 0;

      const upchargeRows = await FinishUpcharge.find({ product: pid, finish_name: cfg.finish });
      const upcharge = upchargeRows.length > 0 ? upchargeRows[0].upcharge_amount : 0;

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

      orderCounts[pid.toString()] = (orderCounts[pid.toString()] || 0) + qty;

      allOrderItems.push({
        pid,
        name: productNames[pid.toString()],
        category: cat,
        configuration: cfg,
        design_file_path: '',
        design_notes: '',
        no_design_flag: i % 3 === 0,
        quantity: qty,
        unit_price: Math.round(discountedPrice * 100) / 100,
        discount_applied: Math.round((effectiveUnitPrice - discountedPrice) * 100) / 100,
        line_total: lineTotal
      });
    }

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
    const deliveryAddress = {
      line1: streets[custIdx],
      line2: 'Near Main Market',
      city: cities[custIdx].city,
      state: cities[custIdx].state,
      pincode: cities[custIdx].pincode
    };

    const order = await Order.create({
      order_number: orderNumber,
      user: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      order_notes: i % 4 === 0 ? 'Please handle with care. Rush order.' : '',
      subtotal,
      coupon_code: couponCode,
      coupon_discount: couponDiscount,
      gst_amount: gstAmount,
      grand_total: grandTotal,
      payment_method: paymentMethod,
      payment_status: 'completed',
      status,
      internal_notes: '',
      created_at: createdAt,
      updated_at: createdAt,
    });

    const orderItemDocs = [];
    for (const item of allOrderItems) {
      const oi = await OrderItem.create({
        order: order._id,
        product: item.pid,
        product_name: item.name,
        category: item.category,
        configuration: item.configuration,
        design_file_path: item.design_file_path,
        design_notes: item.design_notes,
        no_design_flag: item.no_design_flag,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_applied: item.discount_applied,
        line_total: item.line_total,
      });
      orderItemDocs.push(oi);
    }

    const statusFlow = ['pending', 'confirmed', 'printing', 'shipped', 'delivered'];
    const statusIdx = statusFlow.indexOf(status);
    if (statusIdx >= 0) {
      await OrderStatusHistory.create({ order: order._id, status: 'pending', changed_by: 'system', notes: 'Order placed', created_at: createdAt });
      for (let s = 1; s <= statusIdx; s++) {
        const stDate = new Date(createdAt.getTime() + s * 86400000);
        await OrderStatusHistory.create({ order: order._id, status: statusFlow[s], changed_by: 'system', notes: `Status updated to ${statusFlow[s]}`, created_at: stDate });
      }
    } else if (status === 'cancelled') {
      await OrderStatusHistory.create({ order: order._id, status: 'pending', changed_by: 'system', notes: 'Order placed', created_at: createdAt });
      await OrderStatusHistory.create({ order: order._id, status: 'cancelled', changed_by: 'customer', notes: 'Cancelled by customer', created_at: new Date(createdAt.getTime() + 86400000) });
    }
  }

  for (const [pidStr, count] of Object.entries(orderCounts)) {
    await Product.findByIdAndUpdate(pidStr, { order_count: count });
  }

  const deliveredOrders = await Order.find({ status: 'delivered' }).select('_id');
  const deliveredItems = await OrderItem.find({ order: { $in: deliveredOrders.map(o => o._id) } }).populate('order');
  const deliveredItemIds = deliveredItems.filter(di => di.order?.status === 'delivered');

  const reviewComments = {
    5: ['Absolutely stunning print quality! Highly recommended.', 'Perfect finish and fast delivery. Will order again.', 'Exceeded my expectations. The colours are vibrant!'],
    4: ['Great quality for the price. Very satisfied.', 'Good print quality. Delivery was on time.', 'Nice product. Would recommend to others.'],
    3: ['Decent quality but could be better.', 'Okay product for the price point.']
  };

  for (let i = 0; i < Math.min(12, deliveredItemIds.length); i++) {
    const item = deliveredItemIds[i];
    const rating = [5, 5, 4, 5, 4, 3, 5, 4, 5, 4, 5, 5][i];
    const comments = reviewComments[rating] || ['Great product!'];
    const comment = comments[i % comments.length];
    const userId = custIds[i % custIds.length];
    await Review.create({ product: item.product, user: userId, order_item: item._id, rating, comment });

    const stats = await Review.aggregate([
      { $match: { product: item.product } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(item.product, {
        avg_rating: Math.round(stats[0].avg * 10) / 10,
        total_reviews: stats[0].count,
      });
    }
  }

  console.log('Database seeded successfully!');
  console.log('Admin: admin@printshop.com / admin123');
  console.log('Customer: customer1@printshop.com / cust123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
