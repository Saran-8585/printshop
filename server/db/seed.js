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

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedPick(arr, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

async function clearCollections() {
  const collections = [
    Review, OrderStatusHistory, OrderItem, Order,
    FinishUpcharge, PricingRule, Coupon, Address, Product, User, Counter,
  ];
  for (const Model of collections) {
    await Model.deleteMany({});
  }
}

const adminData = [
  { name: 'Admin User', email: 'admin@printshop.com', role: 'admin' },
  { name: 'Super Admin', email: 'superadmin@printshop.com', role: 'admin' },
];

const customerNames = [
  'Priya Sharma', 'Rahul Verma', 'Ananya Patel', 'Vikram Singh', 'Sneha Reddy',
  'Arjun Nair', 'Kavita Joshi', 'Rohan Desai', 'Neha Gupta', 'Amit Kumar',
  'Pooja Mehta', 'Sanjay Rao', 'Divya Menon', 'Akash Malhotra', 'Isha Kapoor',
  'Rajesh Iyer', 'Meera Choudhury', 'Varun Saxena', 'Anjali Aggarwal', 'Deepak Mishra',
  'Nandini Krishnan', 'Karan Bajaj', 'Shreya Pandey', 'Harsh Tiwari', 'Lakshmi Narayan',
  'Gaurav Bhatia', 'Ritika Sen', 'Aditya Prasad', 'Swati Ghosh', 'Manish Jain',
  'Tanya Arora', 'Siddharth Chatterjee', 'Bhavna Thakur', 'Vivek Rawat', 'Aishwarya Kulkarni',
  'Pranav Shetty', 'Deepika Naidu', 'Nikhil Gandhi', 'Kritika Saxena', 'Suresh Babu',
  'Anushka Bose', 'Mahesh Nayar', 'Rupal Shah', 'Vijay Srinivasan', 'Kiran Deshmukh',
  'Ravi Teja', 'Jyoti Walia', 'Imran Khan', 'Sunita Das', 'Sandeep Pillai',
];

const customerCities = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Thiruvananthapuram', state: 'Kerala' },
  { city: 'Guwahati', state: 'Assam' },
  { city: 'Bhubaneswar', state: 'Odisha' },
  { city: 'Vadodara', state: 'Gujarat' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Nashik', state: 'Maharashtra' },
];

const streets = [
  '123 MG Road', '456 Park Street', '789 Brigade Road', '321 FC Road', '654 Anna Salai',
  '87 LBS Marg', '234 Linking Road', '567 Commercial Street', '890 Residency Road', '432 Mount Road',
  '765 Sector 18', '98 Kharghar', '210 Viman Nagar', '543 Hitech City', '876 Salt Lake',
  '109 SG Highway', '321 MI Road', '654 Gomti Nagar', '987 Ring Road', '543 VIP Road',
  '12 Lake View', '78 Church Street', '345 MG Road', '678 Koramangala', '901 Jubilee Hills',
];

const productDefs = [
  {
    name: 'Premium Matte Poster', category: 'posters',
    desc: 'High-quality matte finish posters printed on premium paper. Perfect for wall art, photography prints, and promotional displays. The matte finish reduces glare and gives a professional, elegant look.',
    price: 25, turnaround: '3-5 business days',
    sizes: ['A4', 'A3', 'A2', 'A1'], finishes: ['Matte', 'Glossy', 'Satin'],
  },
  {
    name: 'Glossy Photo Poster', category: 'posters',
    desc: 'Vibrant glossy photo posters with brilliant colour reproduction. Ideal for portraits, event posters, and marketing materials where colours need to pop. UV resistant coating protects against fading.',
    price: 28, turnaround: '3-5 business days',
    sizes: ['A4', 'A3', 'A2', 'A1'], finishes: ['Matte', 'Glossy', 'Satin'],
  },
  {
    name: 'Satin Finish Art Print', category: 'posters',
    desc: 'Professional satin finish art prints with a subtle sheen between matte and glossy. Museum-quality archival paper. Recommended for fine art reproductions, gallery prints, and premium photography.',
    price: 30, turnaround: '3-5 business days',
    sizes: ['A4', 'A3', 'A2', 'A1'], finishes: ['Matte', 'Glossy', 'Satin'],
  },
  {
    name: 'Canvas Gallery Wrap', category: 'posters',
    desc: 'Stunning canvas gallery wraps stretched over a solid wooden frame. Museum-quality archival canvas with fade-resistant inks. Available in multiple depths. Ready to hang with hardware included.',
    price: 55, turnaround: '5-7 business days',
    sizes: ['8×10"', '16×20"', '24×36"'], finishes: ['Matte Canvas', 'Glossy Canvas', 'Satin Canvas'],
  },
  {
    name: 'Framed Art Print', category: 'posters',
    desc: 'Beautiful framed art prints with your choice of frame style. Includes a white mat board border and protective acrylic glazing. Ready to hang out of the box. Premium quality construction.',
    price: 75, turnaround: '5-7 business days',
    sizes: ['8×10"', '11×14"', '16×20"', '18×24"'], finishes: ['Black Frame', 'White Frame', 'Wood Frame'],
  },
  {
    name: 'Panoramic Banner', category: 'posters',
    desc: 'Wide-format panoramic banners perfect for events, exhibitions, and conferences. High-resolution printing on durable matte material. Features hemmed edges and grommets for easy hanging.',
    price: 40, turnaround: '4-6 business days',
    sizes: ['2×4ft', '3×6ft', '4×8ft'], finishes: ['Matte', 'Glossy'],
  },
  {
    name: 'Mini Poster Set (4-Pack)', category: 'posters',
    desc: 'Set of four mini posters in A5 size, perfect for collages, gallery walls, and small displays. Mix and match your favourite designs. Great value pack for event promotions and creative projects.',
    price: 20, turnaround: '3-5 business days',
    sizes: ['A5'], finishes: ['Matte', 'Glossy', 'Satin'],
  },
  {
    name: 'Metallic Print Poster', category: 'posters',
    desc: 'Premium metallic paper prints with a stunning pearlescent sheen and exceptional depth. Colours appear to glow with a unique luminescence. Ideal for high-end photography and fine art reproductions.',
    price: 35, turnaround: '4-6 business days',
    sizes: ['A4', 'A3', 'A2'], finishes: ['Metallic Pearl', 'Metallic Silver', 'Metallic Gold'],
  },
  {
    name: 'Foam Board Mounted Poster', category: 'posters',
    desc: 'Rigid foam board mounted posters with a professional, polished finish. Lightweight yet sturdy construction. Perfect for presentations, trade show displays, signage, and wall mounting.',
    price: 45, turnaround: '4-6 business days',
    sizes: ['A4', 'A3', 'A2', 'A1'], finishes: ['Matte', 'Glossy', 'Satin'],
  },
  {
    name: 'Large Format Vinyl Banner', category: 'posters',
    desc: 'Heavy-duty vinyl banners for outdoor and indoor use. Weather-resistant with reinforced grommets. High-impact printing with UV-resistant inks. Perfect for events, promotions, and roadside signage.',
    price: 60, turnaround: '5-7 business days',
    sizes: ['3×5ft', '4×6ft', '6×10ft'], finishes: ['Matte Vinyl', 'Glossy Vinyl'],
  },
  {
    name: 'Custom Die-Cut Stickers', category: 'stickers',
    desc: 'Custom shaped die-cut stickers made from high-quality vinyl. Available in various finishes including holographic and transparent. Perfect for branding, packaging, and personal projects.',
    price: 12, turnaround: '5-7 business days',
    sizes: ['5×5cm', '7×7cm', '10×10cm'], finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic'],
  },
  {
    name: 'Glossy Square Stickers', category: 'stickers',
    desc: 'Bold glossy square stickers with vibrant print quality. Ideal for product labels, branding stickers, and promotional giveaways. Durable vinyl with strong adhesive backing.',
    price: 8, turnaround: '5-7 business days',
    sizes: ['5×5cm', '7×7cm', '10×10cm'], finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic'],
  },
  {
    name: 'Holographic Circle Stickers', category: 'stickers',
    desc: 'Eye-catching holographic circle stickers that shine and shimmer in light. Great for special editions, event stickers, and premium packaging. Each sticker has a unique rainbow effect.',
    price: 10, turnaround: '5-7 business days',
    sizes: ['3cm dia', '5cm dia', '8cm dia'], finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic'],
  },
  {
    name: 'Removable Wall Decal', category: 'stickers',
    desc: 'Large-format removable wall decals that won\'t damage paint when removed. Perfect for home decor, nursery rooms, retail window displays, and temporary event signage. Easy to apply and reposition.',
    price: 18, turnaround: '5-7 business days',
    sizes: ['30×30cm', '50×50cm', '100×70cm'], finishes: ['Matte Laminate', 'Gloss Laminate'],
  },
  {
    name: 'Kiss-Cut Sticker Sheet', category: 'stickers',
    desc: 'Sheets of multiple kiss-cut stickers on a backing liner. Easy to peel and apply individually. Great for sticker packs, sheets of logos, and multi-design sets. Custom layouts available.',
    price: 15, turnaround: '5-7 business days',
    sizes: ['A6', 'A5', 'A4'], finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent'],
  },
  {
    name: 'Waterproof Vinyl Pack', category: 'stickers',
    desc: 'Weather-resistant waterproof vinyl stickers that withstand rain, sun, and scratches. Perfect for laptops, water bottles, outdoor gear, car bumpers, and marine use. Extreme durability guaranteed.',
    price: 20, turnaround: '5-7 business days',
    sizes: ['5×5cm', '7×7cm', '10×10cm'], finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent'],
  },
  {
    name: 'Round Logo Stickers', category: 'stickers',
    desc: 'Classic round logo stickers in various sizes. Ideal for branding, product seals, event giveaways, and promotional merchandise. Easy to apply on any smooth surface.',
    price: 7, turnaround: '5-7 business days',
    sizes: ['2.5cm dia', '5cm dia', '7.5cm dia'], finishes: ['Matte Laminate', 'Gloss Laminate', 'Holographic'],
  },
  {
    name: 'Clear Transparent Stickers', category: 'stickers',
    desc: 'See-through transparent stickers that blend seamlessly with any surface for a no-label look. Perfect for glass windows, product packaging, and premium branding where the background should show through.',
    price: 14, turnaround: '5-7 business days',
    sizes: ['5×5cm', '7×7cm', '10×10cm'], finishes: ['Transparent', 'Matte Laminate', 'Gloss Laminate'],
  },
  {
    name: 'Glow-in-the-Dark Stickers', category: 'stickers',
    desc: 'Fun glow-in-the-dark stickers that charge under ambient or UV light and glow for hours. Great for kids rooms, party favours, novelty items, and emergency signage.',
    price: 16, turnaround: '5-7 business days',
    sizes: ['3×3cm', '5×5cm', '7×7cm'], finishes: ['Matte Laminate', 'Gloss Laminate'],
  },
  {
    name: 'Curved Bottle Stickers', category: 'stickers',
    desc: 'Specially designed curved stickers that conform perfectly to bottle, flask, cup, and cylindrical surfaces. Wraparound designs available. Ideal for beverage branding and promotional drinkware.',
    price: 22, turnaround: '5-7 business days',
    sizes: ['5×15cm', '7×20cm', '10×25cm'], finishes: ['Matte Laminate', 'Gloss Laminate', 'Transparent'],
  },
  {
    name: 'Premium Business Cards', category: 'visiting-cards',
    desc: 'Professional premium business cards on heavy 350gsm stock. Choose from multiple finishes including Soft Touch and Spot UV. Stand out with our premium quality card stock and precise cutting.',
    price: 3, turnaround: '4-6 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'], finishes: ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
  },
  {
    name: 'Luxury Spot UV Cards', category: 'visiting-cards',
    desc: 'Make an impression with Spot UV coated business cards. The glossy UV coating highlights selected areas creating a striking contrast against the matte background. 400gsm premium stock.',
    price: 4, turnaround: '4-6 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'], finishes: ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
  },
  {
    name: 'Foil Print Visiting Cards', category: 'visiting-cards',
    desc: 'Luxurious foil printed business cards available in Gold or Silver. The metallic foil creates a premium raised effect that catches light beautifully. Choose from gold or silver foil on premium card stock.',
    price: 5, turnaround: '5-7 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'], finishes: ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
  },
  {
    name: 'Eco Kraft Business Cards', category: 'visiting-cards',
    desc: 'Environmentally friendly business cards printed on recycled brown kraft paper. Natural, rustic texture with an earthy feel. Biodegradable and plastic-free. Perfect for eco-conscious brands.',
    price: 3.5, turnaround: '4-6 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)'], finishes: ['Matte', 'Glossy'],
  },
  {
    name: 'Transparent PVC Cards', category: 'visiting-cards',
    desc: 'Premium clear plastic business cards with a sleek, modern look. Durable and waterproof. Printed with white ink for high visibility on the transparent surface. Unique and memorable.',
    price: 6, turnaround: '5-7 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)'], finishes: ['Glossy', 'Matte'],
  },
  {
    name: 'Embossed Premium Cards', category: 'visiting-cards',
    desc: 'Luxury embossed business cards with raised textured designs. Premium 400gsm stock with deep embossing for a memorable tactile experience. Choose from multiple embossing patterns.',
    price: 7, turnaround: '5-7 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)'], finishes: ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
  },
  {
    name: 'Rounded Corner Business Cards', category: 'visiting-cards',
    desc: 'Elegant rounded corner business cards on premium 350gsm stock. The soft rounded edges give a sophisticated, modern feel. Available in multiple colours and finish options.',
    price: 3.8, turnaround: '4-6 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'], finishes: ['Matte', 'Glossy', 'Soft Touch'],
  },
  {
    name: 'Metal Business Cards', category: 'visiting-cards',
    desc: 'Premium stainless steel business cards that are virtually indestructible. Laser engraved with your details for a permanent mark. Ultra-premium, ultra-memorable. Includes a protective pouch.',
    price: 25, turnaround: '7-10 business days',
    sizes: ['Standard (85×50mm)', 'Mini (70×40mm)'], finishes: ['Brushed Steel', 'Mirror Finish', 'Matte Black'],
  },
  {
    name: 'Wooden Business Cards', category: 'visiting-cards',
    desc: 'Unique wooden business cards laser engraved from sustainable veneer. Each card has a natural wood grain pattern, making every set one-of-a-kind. Eco-friendly, memorable, and conversation-starting.',
    price: 20, turnaround: '7-10 business days',
    sizes: ['Standard (85×50mm)', 'Square (55×55mm)'], finishes: ['Walnut', 'Cherry', 'Maple', 'Bamboo'],
  },
  {
    name: 'Double-Sided Matte Cards', category: 'visiting-cards',
    desc: 'Versatile double-sided matte business cards with full-bleed printing on both sides. Maximise your information with separate front and back designs. Premium 350gsm stock with a smooth matte feel.',
    price: 4.5, turnaround: '4-6 business days',
    sizes: ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'], finishes: ['Matte', 'Glossy', 'Soft Touch'],
  },
];

const couponDefs = [
  { code: 'WELCOME10', type: 'percentage', value: 10, min: 500, maxUses: 200, used: 42, expiry: '2026-12-31', active: true },
  { code: 'BULK20', type: 'percentage', value: 20, min: 2000, maxUses: 100, used: 18, expiry: '2026-12-31', active: true },
  { code: 'FLAT100', type: 'flat', value: 100, min: 800, maxUses: 80, used: 35, expiry: '2026-12-31', active: true },
  { code: 'NEWUSER15', type: 'percentage', value: 15, min: 300, maxUses: 150, used: 67, expiry: '2026-12-31', active: true },
  { code: 'SUMMER25', type: 'percentage', value: 25, min: 1500, maxUses: 50, used: 12, expiry: '2026-09-30', active: true },
  { code: 'FESTIVE15', type: 'percentage', value: 15, min: 1000, maxUses: 100, used: 28, expiry: '2026-12-31', active: true },
  { code: 'FREESHIP', type: 'flat', value: 50, min: 500, maxUses: 300, used: 145, expiry: '2026-12-31', active: true },
  { code: 'PRINTLOVE', type: 'percentage', value: 10, min: 0, maxUses: 500, used: 89, expiry: '2026-12-31', active: true },
  { code: 'DIWALI20', type: 'percentage', value: 20, min: 1200, maxUses: 60, used: 23, expiry: '2026-11-30', active: true },
  { code: 'FLAT200', type: 'flat', value: 200, min: 1500, maxUses: 40, used: 8, expiry: '2026-12-31', active: true },
  { code: 'FIRSTORDER', type: 'percentage', value: 20, min: 200, maxUses: 200, used: 55, expiry: '2026-12-31', active: true },
  { code: 'FLAT50', type: 'flat', value: 50, min: 300, maxUses: 500, used: 210, expiry: '2026-12-31', active: true },
  { code: 'NEWYEAR30', type: 'percentage', value: 30, min: 2000, maxUses: 30, used: 5, expiry: '2026-01-31', active: false },
  { code: 'CARDS100', type: 'flat', value: 100, min: 1000, maxUses: 50, used: 14, expiry: '2026-12-31', active: true },
  { code: 'STICKER20', type: 'percentage', value: 20, min: 800, maxUses: 100, used: 31, expiry: '2026-12-31', active: true },
];

const reviewComments = {
  5: [
    'Absolutely stunning print quality! Highly recommended.',
    'Perfect finish and fast delivery. Will order again.',
    'Exceeded my expectations. The colours are incredibly vibrant!',
    'Best print shop I have ever used. Amazing quality.',
    'The detail and clarity are outstanding. Very impressed.',
    'Perfect. Just perfect. Exactly what I wanted.',
    'Arrived on time and looks fantastic. Will be ordering more.',
    'The quality exceeded what I expected. Truly premium product.',
    'Amazing quality and super fast turnaround. Thank you!',
    'Love how these turned out. The finish is flawless.',
    'Excellent quality and great customer service. 5 stars!',
    'Better than I imagined. The print is sharp and colours are accurate.',
    'Superb quality! My clients were very impressed with the cards.',
    'Incredible value for money. Top notch quality throughout.',
    'Rapid delivery and exceptional print quality. Very happy!',
    'These are gorgeous! Exactly matched my design specs.',
    'The best business cards I have ever ordered. Perfect!',
    'Highly detailed print with perfect colour matching. Bravo!',
    'Wonderful product. The material quality is premium grade.',
    'I am blown away by the quality. Every detail is perfect.',
    'Perfect execution of my design. Could not ask for more.',
    'Stunning result! The metallic finish looks premium.',
    'Outstanding print quality with vibrant colour reproduction.',
    'The stickers are bright, durable, and look fantastic on my products.',
    'Delivery was earlier than expected and quality is top notch.',
    'These posters look incredible framed. Museum quality prints.',
    'My event banners came out perfect. Very durable material.',
    'The transparent stickers look amazing on our glass storefront.',
    'Very professional finish. Made our brand look premium.',
    'I have found my go-to print shop. Consistently excellent.',
  ],
  4: [
    'Great quality for the price. Very satisfied.',
    'Good print quality. Delivery was on time.',
    'Nice product. Would recommend to others.',
    'Very good quality. Minor colour difference from preview.',
    'Solid product. Does exactly what it should. Happy with the purchase.',
    'Good quality prints. Delivery took a little longer than expected.',
    'Really happy with how these turned out. Will order again.',
    'Clean print and good material. Satisfied customer here.',
    'Great value. The quality is good but not the absolute best.',
    'Nice finish and accurate cutting. Just what I needed.',
    'Good quality cards. The design came out well on the stock.',
    'Satisfied with the product. The packaging was also good.',
    'The stickers work perfectly on our product packaging.',
    'Decent quality prints. Would consider upgrading to premium next time.',
    'Happy with the result. Quick turnaround too.',
    'Good colours and sharp text. Professional looking.',
    'The material feels durable and the print is clean.',
    'Nice finish overall. Few minor imperfections but acceptable.',
    'Pleased with the outcome. Fast service and good communication.',
    'Good quality for bulk orders. Consistent across all pieces.',
  ],
  3: [
    'Decent quality but could be better.',
    'Okay product for the price point.',
    'Average quality. Does the job but nothing special.',
    'It is alright. The print quality is okay but not amazing.',
    'Mixed feelings. Some came out great, others had issues.',
    'Acceptable quality. Might try another finish next time.',
    'Not bad but expected better based on the price.',
    'The product is fine but delivery was delayed.',
    'Middle of the road. Works for what I need it for.',
    'Average experience. Customer service was helpful though.',
    'The colours were slightly off from my design file.',
    'Decent but the cutting could be more precise.',
    'Functional quality. Meets basic expectations.',
    'A few of the stickers had edge peeling issues.',
    'Print quality is acceptable but not premium grade.',
  ],
  2: [
    'Below expectations. Print quality is inconsistent.',
    'Not great. The colours came out much darker than designed.',
    'Disappointed with the quality. Expected much better.',
    'The cutting was not clean on several pieces.',
    'Would not recommend. The finish was not as described.',
    'Poor quality control. Some cards had visible scratches.',
    'Took too long and the result was average at best.',
    'Material feels cheap compared to other options available.',
    'Not worth the price. Looking for alternatives now.',
    'The design got cropped incorrectly on some units.',
  ],
  1: [
    'Terrible quality. Would not recommend at all.',
    'Complete waste of money. The product is unusable.',
    'Worst print job I have ever received. Avoid this shop.',
    'The colours are completely wrong. Looks nothing like my design.',
    'Arrived damaged and the customer service was unhelpful.',
    'Extremely disappointed. Poor print resolution and bad materials.',
    'Do not order from here. The product quality is unacceptable.',
    'Misleading description. The actual product is much lower quality.',
    'Had to throw away half the order due to defects.',
    'Absolutely horrible experience. The stickers do not stick at all.',
  ],
};

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/printshop';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await clearCollections();
  console.log('Cleared existing data');

  const hashedAdmin = bcrypt.hashSync('admin123', 10);
  const hashedCust = bcrypt.hashSync('cust123', 10);

  // ── Users ──
  const adminDocs = await User.insertMany(
    adminData.map(a => ({ ...a, password: hashedAdmin, phone: a.name === 'Admin User' ? '9876543210' : '9876543200' }))
  );
  console.log(`Created ${adminDocs.length} admins`);

  const custDocs = await User.insertMany(
    customerNames.map((name, i) => ({
      name,
      email: `customer${i + 1}@printshop.com`,
      password: hashedCust,
      phone: `98765${String(43210 + i).padStart(5, '0')}`,
      role: 'customer',
    }))
  );
  const allCustIds = custDocs.map(u => u._id);
  console.log(`Created ${custDocs.length} customers`);

  // ── Products ──
  const productDocs = [];
  for (const p of productDefs) {
    const doc = await Product.create({
      name: p.name, category: p.category, description: p.desc,
      base_price: p.price, turnaround_time: p.turnaround,
      available_sizes: p.sizes, available_finishes: p.finishes,
      status: 'active', order_count: 0, avg_rating: 0, total_reviews: 0,
    });
    productDocs.push(doc);
  }
  console.log(`Created ${productDocs.length} products`);

  const productById = {};
  for (const d of productDocs) productById[d._id.toString()] = d;

  const catProducts = {};
  for (const d of productDocs) {
    if (!catProducts[d.category]) catProducts[d.category] = [];
    catProducts[d.category].push(d._id);
  }

  // ── Pricing Rules ──
  const pricingData = [];
  for (const d of productDocs) {
    pricingData.push(
      { product: d._id, min_qty: 1, max_qty: 4, discount_percent: 0 },
      { product: d._id, min_qty: 5, max_qty: 9, discount_percent: 10 },
      { product: d._id, min_qty: 10, max_qty: 24, discount_percent: 18 },
      { product: d._id, min_qty: 25, max_qty: 49, discount_percent: 22 },
      { product: d._id, min_qty: 50, max_qty: 99, discount_percent: 28 },
      { product: d._id, min_qty: 100, max_qty: 999999, discount_percent: 35 },
    );
  }
  await PricingRule.insertMany(pricingData);
  console.log(`Created ${pricingData.length} pricing rules`);

  // ── Finish Upcharges ──
  const upchargeData = [];
  for (const d of productDocs) {
    const baseFinishes = d.available_finishes;
    for (const f of baseFinishes) {
      let amount = 0;
      if (f.includes('Canvas') || f.includes('Frame') || f.includes('Foam')) amount = 8;
      else if (f.includes('Metallic') || f.includes('Pearl')) amount = 6;
      else if (f.includes('Holographic')) amount = 8;
      else if (f.includes('Transparent')) amount = 5;
      else if (f.includes('Soft Touch')) amount = 500;
      else if (f.includes('Spot UV')) amount = 300;
      else if (f.includes('Foil')) amount = 800;
      else if (f.includes('Brushed') || f.includes('Mirror') || f.includes('Matte Black')) amount = 0;
      else if (f.includes('Walnut') || f.includes('Cherry') || f.includes('Maple') || f.includes('Bamboo')) amount = 0;
      upchargeData.push({ product: d._id, finish_name: f, upcharge_amount: amount });
    }
  }
  await FinishUpcharge.insertMany(upchargeData);
  console.log(`Created ${upchargeData.length} finish upcharges`);

  // ── Coupons ──
  const couponDocs = await Coupon.insertMany(
    couponDefs.map(c => ({
      code: c.code, discount_type: c.type, discount_value: c.value,
      min_order_amount: c.min, max_uses: c.maxUses, usage_count: c.used,
      expiry_date: new Date(c.expiry), is_active: c.active,
    }))
  );
  console.log(`Created ${couponDocs.length} coupons`);

  // ── Addresses ──
  const addressData = [];
  const pincodes = [
    '400001', '110001', '560001', '411001', '600001', '500001', '700001',
    '380001', '302001', '226001', '395001', '641001', '682001', '440001',
    '452001', '462001', '160001', '695001', '781001', '751001', '390001',
    '530001', '620001', '282001', '422001',
  ];
  for (let i = 0; i < allCustIds.length; i++) {
    const ci = i % customerCities.length;
    addressData.push({
      user: allCustIds[i], label: 'Home',
      line1: streets[i % streets.length], line2: 'Near Main Market',
      city: customerCities[ci].city, state: customerCities[ci].state,
      pincode: pincodes[ci], is_default: true,
    });
  }
  await Address.insertMany(addressData);
  console.log(`Created ${addressData.length} addresses`);

  // ── Orders ──
  const statuses = ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'];
  const statusWeights = [8, 10, 15, 12, 40, 15];
  const paymentMethods = ['UPI', 'Net Banking', 'Credit Card', 'Debit Card', 'COD'];
  const payWeights = [35, 20, 15, 10, 20];
  const couponCodes = couponDefs.map(c => c.code);

  // Pre-load pricing rules and upcharges into maps
  const allRules = await PricingRule.find({});
  const rulesByProduct = {};
  for (const r of allRules) {
    const pid = r.product.toString();
    if (!rulesByProduct[pid]) rulesByProduct[pid] = [];
    rulesByProduct[pid].push(r);
  }

  const allUpcharges = await FinishUpcharge.find({});
  const upchargesByProduct = {};
  for (const u of allUpcharges) {
    const pid = u.product.toString();
    if (!upchargesByProduct[pid]) upchargesByProduct[pid] = {};
    upchargesByProduct[pid][u.finish_name] = u.upcharge_amount;
  }

  const orderCounts = {};
  for (const d of productDocs) orderCounts[d._id.toString()] = 0;
  const reviewData = [];
  const deliveredOrderItemRefs = [];

  const now = new Date();
  const orderCount = 300;

  for (let i = 0; i < orderCount; i++) {
    let custIdx;
    if (i < 15) {
      custIdx = 0;
    } else {
      custIdx = i % allCustIds.length;
    }
    const userId = allCustIds[custIdx];

    const daysAgo = randInt(0, 179);
    const hoursAgo = randInt(0, 23);
    const minutesAgo = randInt(0, 59);
    const createdAt = new Date(now.getTime() - (daysAgo * 86400000 + hoursAgo * 3600000 + minutesAgo * 60000));

    const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(i + 1).padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${seq}`;

    const cat = weightedPick(['posters', 'stickers', 'visiting-cards'], [35, 35, 30]);
    const catProdArr = catProducts[cat];
    const numItems = weightedPick([1, 2, 3, 4, 5], [25, 30, 25, 12, 8]);

    const items = [];
    let subtotal = 0;
    const chosenPids = [];
    const itemRefs = [];

    for (let j = 0; j < numItems; j++) {
      const pid = catProdArr[randInt(0, catProdArr.length - 1)];
      chosenPids.push(pid);
      const product = productById[pid.toString()];
      const qtyOptions = [5, 10, 25, 50, 100, 200, 500];
      const qtyWeights = cat === 'visiting-cards' ? [10, 20, 30, 25, 10, 3, 2] : [20, 30, 25, 15, 7, 2, 1];
      const qty = weightedPick(qtyOptions, qtyWeights);

      const finish = pick(product.available_finishes);
      const size = pick(product.available_sizes);

      const cfg = { size, finish, quantity: qty };

      if (cat === 'posters') {
        const weights = ['130gsm', '170gsm', '200gsm', '250gsm'];
        cfg.weight = pick(weights);
      }
      if (cat === 'stickers') {
        cfg.waterproof = Math.random() < 0.3;
      }
      if (cat === 'visiting-cards') {
        cfg.sides = pick(['Single', 'Double']);
        cfg.corners = pick(['Square', 'Rounded']);
        cfg.thickness = pick(['300gsm', '350gsm', '400gsm']);
      }

      const basePrice = product.base_price;

      const rules = rulesByProduct[pid.toString()] || [];
      const rule = rules.find(r => qty >= r.min_qty && qty <= r.max_qty);
      const discountPercent = rule ? rule.discount_percent : 0;

      const productUpcharges = upchargesByProduct[pid.toString()] || {};
      const upcharge = productUpcharges[finish] || 0;

      let effectiveUnitPrice = basePrice + upcharge;

      if (cat === 'stickers' && cfg.waterproof) {
        effectiveUnitPrice *= 1.15;
      }
      if (cat === 'visiting-cards') {
        if (cfg.sides === 'Double') effectiveUnitPrice += 200 / qty;
        if (cfg.corners === 'Rounded') effectiveUnitPrice += 150 / qty;
      }

      const discountedPrice = effectiveUnitPrice * (1 - discountPercent / 100);
      const lineTotal = Math.round(discountedPrice * qty * 100) / 100;
      subtotal += lineTotal;

      orderCounts[pid.toString()] = (orderCounts[pid.toString()] || 0) + qty;

      const item = {
        pid, name: product.name, category: cat,
        configuration: cfg,
        design_file_path: '',
        design_notes: '',
        no_design_flag: Math.random() < 0.35,
        quantity: qty,
        unit_price: Math.round(discountedPrice * 100) / 100,
        discount_applied: Math.round((effectiveUnitPrice - discountedPrice) * 100) / 100,
        line_total: lineTotal,
      };
      items.push(item);
      itemRefs.push(item);
    }

    let couponCode = '';
    let couponDiscount = 0;
    let useCoupon = false;

    if (Math.random() < 0.25 && subtotal >= 300) {
      useCoupon = true;
    }

    if (useCoupon) {
      const validCoupons = couponDefs.filter(c => {
        if (!c.active) return false;
        const exp = new Date(c.expiry);
        if (exp < new Date()) return false;
        if (c.min > 0 && subtotal < c.min) return false;
        return true;
      });

      if (validCoupons.length > 0) {
        const coup = pick(validCoupons);
        couponCode = coup.code;
        if (coup.type === 'percentage') {
          couponDiscount = Math.round(subtotal * (coup.value / 100) * 100) / 100;
        } else {
          couponDiscount = Math.min(coup.value, subtotal);
        }
      }
    }

    const afterCoupon = subtotal - couponDiscount;
    const gstAmount = Math.round(afterCoupon * 0.18 * 100) / 100;
    const grandTotal = Math.round((afterCoupon + gstAmount) * 100) / 100;

    const status = weightedPick(statuses, statusWeights);
    const paymentMethod = weightedPick(paymentMethods, payWeights);
    const customerName = custDocs[custIdx].name;
    const customerEmail = custDocs[custIdx].email;
    const customerPhone = custDocs[custIdx].phone;

    const ci = custIdx % customerCities.length;
    const deliveryAddress = {
      line1: streets[custIdx % streets.length],
      line2: 'Near Main Market',
      city: customerCities[ci].city,
      state: customerCities[ci].state,
      pincode: pincodes[ci],
    };

    const order = await Order.create({
      order_number: orderNumber,
      user: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      order_notes: i % 5 === 0 ? 'Please handle with care.' : i % 11 === 0 ? 'Rush order needed.' : '',
      subtotal: Math.round(subtotal * 100) / 100,
      coupon_code: couponCode,
      coupon_discount: couponDiscount,
      gst_amount: gstAmount,
      grand_total: grandTotal,
      payment_method: paymentMethod,
      payment_status: status === 'cancelled' ? 'refunded' : 'completed',
      status,
      internal_notes: '',
      created_at: createdAt,
      updated_at: createdAt,
    });

    for (const item of items) {
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

      if (status === 'delivered') {
        deliveredOrderItemRefs.push({ orderItem: oi, product: item.pid, user: userId });
      }
    }

    const statusFlow = ['pending', 'confirmed', 'printing', 'shipped', 'delivered'];
    const statusIdx = statusFlow.indexOf(status);
    if (statusIdx >= 0) {
      await OrderStatusHistory.create({ order: order._id, status: 'pending', changed_by: 'system', notes: 'Order placed', created_at: createdAt });
      for (let s = 1; s <= statusIdx; s++) {
        const stDate = new Date(createdAt.getTime() + s * 86400000 + randInt(0, 6) * 3600000);
        await OrderStatusHistory.create({ order: order._id, status: statusFlow[s], changed_by: 'system', notes: `Status updated to ${statusFlow[s]}`, created_at: stDate });
      }
    } else if (status === 'cancelled') {
      await OrderStatusHistory.create({ order: order._id, status: 'pending', changed_by: 'system', notes: 'Order placed', created_at: createdAt });
      await OrderStatusHistory.create({ order: order._id, status: 'cancelled', changed_by: Math.random() < 0.5 ? 'customer' : 'admin', notes: Math.random() < 0.5 ? 'Cancelled by customer' : 'Cancelled due to payment issue', created_at: new Date(createdAt.getTime() + randInt(1, 48) * 3600000) });
    }

    if ((i + 1) % 50 === 0) console.log(`Created ${i + 1}/${orderCount} orders`);
  }
  console.log(`Created ${orderCount} orders`);

  // ── Reviews ──
  const reviewTarget = Math.min(150, deliveredOrderItemRefs.length);
  const shuffledRefs = deliveredOrderItemRefs.sort(() => Math.random() - 0.5);
  const selectedRefs = shuffledRefs.slice(0, reviewTarget);

  for (const ref of selectedRefs) {
    const rating = weightedPick([5, 4, 3, 2, 1], [55, 22, 12, 6, 5]);
    const comments = reviewComments[rating];
    const comment = pick(comments);
    await Review.create({
      product: ref.product,
      user: ref.user,
      order_item: ref.orderItem._id,
      rating,
      comment,
    });
    reviewData.push({ product: ref.product, rating });
  }
  console.log(`Created ${selectedRefs.length} reviews`);

  // ── Update Product Stats ──
  const reviewStats = {};
  for (const r of reviewData) {
    const pid = r.product.toString();
    if (!reviewStats[pid]) reviewStats[pid] = { total: 0, sum: 0 };
    reviewStats[pid].total += 1;
    reviewStats[pid].sum += r.rating;
  }

  for (const d of productDocs) {
    const pid = d._id.toString();
    const count = orderCounts[pid] || 0;
    const stats = reviewStats[pid];
    await Product.findByIdAndUpdate(d._id, {
      order_count: count,
      avg_rating: stats ? Math.round((stats.sum / stats.total) * 10) / 10 : 0,
      total_reviews: stats ? stats.total : 0,
    });
  }
  console.log('Updated product stats');

  // ── Summary ──
  console.log('\n═══════════════════════════════════════');
  console.log('  Database Seeded Successfully!');
  console.log('═══════════════════════════════════════');
  console.log(`  Admins:       ${adminDocs.length}`);
  console.log(`  Customers:    ${custDocs.length}`);
  console.log(`  Products:     ${productDocs.length}`);
  console.log(`  Coupons:      ${couponDocs.length}`);
  console.log(`  Addresses:    ${addressData.length}`);
  console.log(`  Orders:       ${orderCount}`);
  console.log(`  Reviews:      ${selectedRefs.length}`);
  console.log('═══════════════════════════════════════');
  console.log('  Admin:        admin@printshop.com / admin123');
  console.log('  Customer:     customer1@printshop.com / cust123');
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
