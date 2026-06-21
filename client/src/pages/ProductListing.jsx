import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/axios';
import { Star, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';

const categoryMeta = {
  'posters': { name: 'Posters', color: 'bg-indigo-600', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  'stickers': { name: 'Stickers', color: 'bg-rose-600', textColor: 'text-rose-600', bgColor: 'bg-rose-50' },
  'visiting-cards': { name: 'Visiting Cards', color: 'bg-amber-600', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
};

export default function ProductListing() {
  const { category } = useParams();
  const meta = categoryMeta[category] || { name: 'Products', color: 'bg-gray-600', textColor: 'text-gray-600', bgColor: 'bg-gray-50' };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products?category=${category}&sort=${sort}&status=active`)
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{meta.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className={`inline-block ${meta.bgColor} ${meta.textColor} text-xs font-semibold px-3 py-1 rounded-full mb-2`}>
            {meta.name}
          </div>
          <h1 className="text-3xl font-bold text-primary">{meta.name}</h1>
          <p className="text-gray-500 mt-1">{products.length} products available</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 md:hidden">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-accent outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <div className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6 sticky top-24">
            <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
            {/* Category tabs */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</p>
              {Object.entries(categoryMeta).map(([slug, m]) => (
                <Link
                  key={slug}
                  to={`/products/${slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    slug === category ? `${m.bgColor} ${m.textColor} font-medium` : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
                  <div className="h-36 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className={`inline-block ${meta.bgColor} text-white text-xs px-2 py-0.5 rounded-full mb-2`}>
                        {meta.name}
                      </div>
                      <p className="text-gray-400 text-sm font-medium">{product.name}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{product.avg_rating?.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({product.total_reviews})</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-accent transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-accent font-bold text-lg">From ₹{product.base_price}</span>
                      {product.order_count > 0 && (
                        <span className="text-xs text-gray-500">{product.order_count} orders</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
