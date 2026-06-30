import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { Star, Shield, Clock, Truck, BadgePercent, Palette, ArrowRight, ChevronRight } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Premium Quality', desc: 'Museum-grade papers and vibrant inks for stunning results' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Most orders printed and shipped within 3-5 business days' },
  { icon: BadgePercent, title: 'Bulk Discounts', desc: 'Save up to 25% on larger quantities across all products' },
  { icon: Palette, title: 'Free Proofing', desc: 'Get a digital proof before we start printing your order' },
];

const testimonials = [
  { name: 'Priya Sharma', rating: 5, comment: 'The print quality is outstanding! My posters look like gallery prints. Highly recommend PrintShop for any print needs.', initials: 'PS' },
  { name: 'Rahul Verma', rating: 5, comment: 'Ordered business cards for my startup. The Spot UV finish is absolutely premium. Fast delivery too!', initials: 'RV' },
  { name: 'Ananya Patel', rating: 4, comment: 'Great quality stickers at reasonable prices. The holographic finish is stunning. Will definitely order again.', initials: 'AP' },
];

const categoryCards = [
  { name: 'Posters', slug: 'posters', from: '₹25', color: 'bg-indigo-600', gradient: 'from-indigo-500 to-indigo-700', desc: 'Matte, Glossy & Satin finishes' },
  { name: 'Stickers', slug: 'stickers', from: '₹8', color: 'bg-rose-600', gradient: 'from-rose-500 to-rose-700', desc: 'Die-cut, Square, Circle & more' },
  { name: 'Visiting Cards', slug: 'visiting-cards', from: '₹2', color: 'bg-amber-600', gradient: 'from-amber-500 to-amber-700', desc: 'Premium finishes: Foil, Spot UV, Soft Touch' },
];

function StarRating({ rating, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sizeClass} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function Home() {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    api.get('/products?sort=popular&limit=6').then(({ data }) => setBestSellers(data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Premium Print<br />
              <span className="text-accent">Made Personal</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
              Custom posters, stickers, and visiting cards printed to your exact specifications.
              Upload your design, choose your finish, and we deliver.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products/posters" className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2">
                Shop Posters <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products/stickers" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-semibold text-lg transition-colors border border-white/20 inline-flex items-center gap-2">
                Shop Stickers <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">Why Choose Us</h2>
            <p className="text-gray-500 mt-2">Quality printing with a personal touch</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">Our Products</h2>
            <p className="text-gray-500 mt-2">Choose from three premium product categories</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categoryCards.map((cat, i) => (
              <Link
                key={cat.slug}
                to={`/products/${cat.slug}`}
                className={`group relative bg-gradient-to-br ${cat.gradient} rounded-2xl p-8 text-white overflow-hidden min-h-[280px] flex flex-col justify-end hover:scale-[1.02] transition-transform`}
              >
                <div className="absolute top-4 right-4 text-white/20 text-8xl font-bold leading-none">0{i + 1}</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                  <p className="text-white/80 text-sm mb-4">{cat.desc}</p>
                  <p className="text-3xl font-bold mb-4">From {cat.from}</p>
                  <span className="inline-flex items-center gap-1 bg-white/20 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-white/30 transition-colors">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 bg-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-primary">Best Sellers</h2>
                <p className="text-gray-500 mt-1">Most popular products this month</p>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {bestSellers.slice(0, 6).map(product => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="bg-white rounded-xl border border-gray-100 p-5 min-w-[200px] snap-start hover:shadow-md transition-shadow shrink-0"
                >
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 text-sm text-gray-400 font-medium">
                    {product.name.substring(0, 20)}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <StarRating rating={Math.round(product.avg_rating)} />
                    <span className="text-xs text-gray-500 ml-1">({product.total_reviews})</span>
                  </div>
                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description.substring(0, 80)}{product.description.length > 80 ? '...' : ''}</p>
                  )}
                  <p className="text-accent font-bold mt-1">From ₹{product.base_price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">What Our Customers Say</h2>
            <p className="text-gray-500 mt-2">Trusted by thousands across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-semibold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{t.name}</h4>
                    <StarRating rating={t.rating} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
