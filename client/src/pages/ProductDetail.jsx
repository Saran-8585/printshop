import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, Upload, Check, ChevronDown, Plus, Minus, FileText, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const categoryMeta = {
  'posters': { name: 'Posters', color: 'bg-indigo-600', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50', accent: '#4f46e5' },
  'stickers': { name: 'Stickers', color: 'bg-rose-600', textColor: 'text-rose-600', bgColor: 'bg-rose-50', accent: '#e11d48' },
  'visiting-cards': { name: 'Visiting Cards', color: 'bg-amber-600', textColor: 'text-amber-600', bgColor: 'bg-amber-50', accent: '#d97706' },
};

const posterSizes = [
  { label: 'A4', dims: '210×297mm', mult: 1 },
  { label: 'A3', dims: '297×420mm', mult: 1.4 },
  { label: 'A2', dims: '420×594mm', mult: 2.2 },
  { label: 'A1', dims: '594×841mm', mult: 3.4 },
];

const stickerSizes = [
  { label: '5×5cm', dims: '5×5 cm' },
  { label: '7×7cm', dims: '7×7 cm' },
  { label: '10×10cm', dims: '10×10 cm' },
];

const vcSizes = [
  { label: 'Standard (90×54mm)', dims: '90×54 mm' },
  { label: 'Square (55×55mm)', dims: '55×55 mm' },
  { label: 'Mini (85×28mm)', dims: '85×28 mm' },
];

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function OptionTile({ selected, onClick, label, sublabel, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
        selected
          ? 'border-accent bg-accent/5 text-accent'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div>{label}</div>
      {sublabel && <div className="text-xs text-gray-400 font-normal mt-0.5">{sublabel}</div>}
    </button>
  );
}

function Stars({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [config, setConfig] = useState({});
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [designFile, setDesignFile] = useState(null);
  const [designNotes, setDesignNotes] = useState('');
  const [noDesign, setNoDesign] = useState(false);
  const [uploading, setUploading] = useState(false);
  const debounceRef = useRef(null);
  const quantityOptions = [1, 5, 10, 25, 50, 100];

  useEffect(() => {
    if (!id || id === 'undefined') { setLoading(false); return; }
    setLoading(true);
    api.get(`/products/${id}`).then(({ data }) => {
      setProduct(data);
      // Set default config
      const sizes = JSON.parse(data.available_sizes || '[]');
      const finishes = JSON.parse(data.available_finishes || '[]');
      const def = {};
      if (data.category === 'posters') {
        def.size = sizes[0] || 'A4';
        def.finish = finishes[0] || 'Matte';
        def.weight = '170gsm';
        def.quantity = 1;
      } else if (data.category === 'stickers') {
        def.type = 'Die-Cut';
        def.size = sizes[0] || '5×5cm';
        def.finish = finishes[0] || 'Matte Laminate';
        def.waterproof = false;
        def.quantity = 10;
      } else {
        def.size = sizes[0] || 'Standard (90×54mm)';
        def.finish = finishes[0] || 'Matte';
        def.thickness = '350gsm';
        def.corners = 'Square';
        def.sides = 'Single';
        def.quantity = 50;
      }
      setConfig(def);
    }).catch(() => {}).finally(() => setLoading(false));

    api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data)).catch(() => {});
  }, [id]);

  const fetchPricing = useCallback((cfg) => {
    if (!cfg || !cfg.size || !cfg.finish) return;
    setPricingLoading(true);
    const params = new URLSearchParams({
      size: cfg.size,
      finish: cfg.finish,
      quantity: cfg.quantity || 1
    });
    if (cfg.weight) params.append('weight', cfg.weight);
    if (cfg.type) params.append('type', cfg.type);
    if (cfg.waterproof) params.append('waterproof', 'true');
    if (cfg.sides) params.append('sides', cfg.sides);
    if (cfg.corners) params.append('corners', cfg.corners);
    if (cfg.thickness) params.append('thickness', cfg.thickness);

    api.get(`/pricing/${id}?${params.toString()}`)
      .then(({ data }) => setPricing(data))
      .catch(() => setPricing(null))
      .finally(() => setPricingLoading(false));
  }, [id]);

  useEffect(() => {
    if (product && config.size && config.finish) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchPricing(config), 400);
    }
  }, [config, product, fetchPricing]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('design', file);
    try {
      const { data } = await api.post('/upload/design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDesignFile(data);
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
    setUploading(false);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!pricing) return;
    addItem({
      product_id: product._id,
      product_name: product.name,
      category: product.category,
      configuration: config,
      design_file_path: designFile?.file_path || '',
      design_notes: designNotes,
      no_design_flag: noDesign,
      quantity: config.quantity,
      unit_price: pricing.unit_price,
      discount_applied: pricing.discount_amount / config.quantity,
      line_total: pricing.subtotal
    });
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Product not found</div>;
  }

  const meta = categoryMeta[product.category] || { name: product.category, color: 'bg-gray-600', textColor: 'text-gray-600', bgColor: 'bg-gray-50' };

  const discountPercent = pricing?.discount_percent || 0;
  const sizes = product.available_sizes || [];
  const finishes = product.available_finishes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link to={`/products/${product.category}`} className="hover:text-accent">{meta.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Preview */}
        <div>
          <div className={`rounded-2xl aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200`}>
            <div className="text-center p-8">
              <div className={`inline-block ${meta.bgColor} text-white text-xs px-3 py-1 rounded-full mb-3`}>
                {meta.name}
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm">{config.size}{config.finish ? ` • ${config.finish}` : ''}</p>
              <p className="text-gray-400 text-xs mt-4">Preview representation</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-4">
            <Stars rating={Math.round(product.avg_rating)} />
            <span className="font-semibold">{product.avg_rating?.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({product.total_reviews} reviews)</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">{product.order_count} orders</span>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <div className="flex gap-0 overflow-x-auto">
              <TabButton active={activeTab === 'description'} onClick={() => setActiveTab('description')}>Description</TabButton>
              <TabButton active={activeTab === 'specs'} onClick={() => setActiveTab('specs')}>Specifications</TabButton>
              <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</TabButton>
              <TabButton active={activeTab === 'howto'} onClick={() => setActiveTab('howto')}>How to Order</TabButton>
            </div>
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" /> Turnaround: {product.turnaround_time}
                </div>
              </div>
            )}
            {activeTab === 'specs' && (
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b"><td className="py-2 text-gray-500 font-medium">Category</td><td className="py-2 text-gray-900">{meta.name}</td></tr>
                  <tr className="border-b"><td className="py-2 text-gray-500 font-medium">Available Sizes</td><td className="py-2 text-gray-900">{sizes.join(', ')}</td></tr>
                  <tr className="border-b"><td className="py-2 text-gray-500 font-medium">Available Finishes</td><td className="py-2 text-gray-900">{finishes.join(', ')}</td></tr>
                  <tr className="border-b"><td className="py-2 text-gray-500 font-medium">Base Price</td><td className="py-2 text-gray-900">From ₹{product.base_price}/unit</td></tr>
                  <tr className="border-b"><td className="py-2 text-gray-500 font-medium">Turnaround</td><td className="py-2 text-gray-900">{product.turnaround_time}</td></tr>
                  <tr><td className="py-2 text-gray-500 font-medium">Bulk Discount</td><td className="py-2 text-gray-900">Up to 25% off</td></tr>
                </tbody>
              </table>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map(r => (
                    <div key={r._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-xs font-semibold text-accent">
                            {r.user_name?.[0] || 'U'}
                          </div>
                          <span className="font-medium text-sm">{r.user_name}</span>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'howto' && (
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Choose Your Product', desc: 'Select from our range of posters, stickers, and visiting cards' },
                  { step: '2', title: 'Configure & Upload', desc: 'Choose size, finish, quantity and upload your design or tell us you need one' },
                  { step: '3', title: 'We Print & Proof', desc: 'We\'ll review your design and send a digital proof for approval' },
                  { step: '4', title: 'Delivery', desc: 'Once approved, we print and ship your order right to your doorstep' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold shrink-0">{item.step}</div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Configurator */}
        <div>
          <div className="space-y-6">
            <div>
              <div className={`inline-block ${meta.bgColor} text-white text-xs px-3 py-1 rounded-full mb-2`}>{meta.name}</div>
              <h1 className="text-2xl font-bold text-primary">{product.name}</h1>
            </div>

            {/* Poster config */}
            {product.category === 'posters' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">1. Select Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    {posterSizes.map(s => (
                      <OptionTile key={s.label} selected={config.size === s.label} onClick={() => updateConfig('size', s.label)} label={s.label} sublabel={s.dims} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">2. Paper Finish</label>
                  <div className="grid grid-cols-3 gap-2">
                    {finishes.map(f => (
                      <OptionTile key={f} selected={config.finish === f} onClick={() => updateConfig('finish', f)} label={f} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">3. Paper Weight</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['130gsm', '170gsm', '250gsm'].map(w => (
                      <OptionTile key={w} selected={config.weight === w} onClick={() => updateConfig('weight', w)} label={w} sublabel={w === '250gsm' ? 'Premium' : w === '170gsm' ? 'Standard' : 'Economy'} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">4. Quantity</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quantityOptions.map(q => (
                      <OptionTile key={q} selected={config.quantity === q} onClick={() => updateConfig('quantity', q)} label={q.toString()} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sticker config */}
            {product.category === 'stickers' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">1. Sticker Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Die-Cut', 'Square', 'Circle', 'Sheet'].map(t => (
                      <OptionTile key={t} selected={config.type === t} onClick={() => updateConfig('type', t)} label={t} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">2. Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {stickerSizes.map(s => (
                      <OptionTile key={s.label} selected={config.size === s.label} onClick={() => updateConfig('size', s.label)} label={s.label} sublabel={s.dims} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">3. Finish</label>
                  <div className="grid grid-cols-2 gap-2">
                    {finishes.map(f => (
                      <OptionTile key={f} selected={config.finish === f} onClick={() => updateConfig('finish', f)} label={f} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">4. Waterproof</label>
                  <div className="flex gap-2">
                    <OptionTile selected={!config.waterproof} onClick={() => updateConfig('waterproof', false)} label="No" sublabel="Standard" />
                    <OptionTile selected={config.waterproof} onClick={() => updateConfig('waterproof', true)} label="Yes" sublabel="+10% extra" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">5. Quantity</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[10, 25, 50, 100, 250, 500].map(q => (
                      <OptionTile key={q} selected={config.quantity === q} onClick={() => updateConfig('quantity', q)} label={q.toString()} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Visiting Card config */}
            {product.category === 'visiting-cards' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">1. Size</label>
                  <div className="grid grid-cols-1 gap-2">
                    {vcSizes.map(s => (
                      <OptionTile key={s.label} selected={config.size === s.label} onClick={() => updateConfig('size', s.label)} label={s.label} sublabel={s.dims} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">2. Finish</label>
                  <div className="grid grid-cols-2 gap-2">
                    {finishes.map(f => (
                      <OptionTile key={f} selected={config.finish === f} onClick={() => updateConfig('finish', f)} label={f} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">3. Thickness</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['300gsm', '350gsm', '400gsm'].map(t => (
                      <OptionTile key={t} selected={config.thickness === t} onClick={() => updateConfig('thickness', t)} label={t} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">4. Corners</label>
                  <div className="flex gap-2">
                    <OptionTile selected={config.corners === 'Square'} onClick={() => updateConfig('corners', 'Square')} label="Square" sublabel="Standard" />
                    <OptionTile selected={config.corners === 'Rounded'} onClick={() => updateConfig('corners', 'Rounded')} label="Rounded" sublabel="+₹150" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">5. Sides</label>
                  <div className="flex gap-2">
                    <OptionTile selected={config.sides === 'Single'} onClick={() => updateConfig('sides', 'Single')} label="Single Sided" />
                    <OptionTile selected={config.sides === 'Double'} onClick={() => updateConfig('sides', 'Double')} label="Double Sided" sublabel="+₹200" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">6. Quantity</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[50, 100, 250, 500, 1000].map(q => (
                      <OptionTile key={q} selected={config.quantity === q} onClick={() => updateConfig('quantity', q)} label={q.toString()} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Design Upload */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Upload Your Design</h3>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-accent transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  {designFile ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{designFile.original_name}</p>
                      <p className="text-xs text-gray-500">{(designFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{uploading ? 'Uploading...' : 'Click to upload design file'}</p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG, AI, EPS (max 20MB)</p>
                    </div>
                  )}
                </div>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai,.eps,.svg,.psd" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
              <textarea
                value={designNotes}
                onChange={e => setDesignNotes(e.target.value)}
                placeholder="Design notes (e.g. bleed area, colour instructions, text to include)..."
                className="w-full mt-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none resize-none"
                rows={2}
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={noDesign} onChange={e => setNoDesign(e.target.checked)} className="rounded accent-accent" />
                <span className="text-sm text-gray-600">Don't have a design? We'll contact you</span>
              </label>
            </div>

            {/* Price Summary - Sticky */}
            <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              {discountPercent > 0 && (
                <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  You save {discountPercent}%
                </div>
              )}

              <div className="space-y-2 text-sm">
                {pricing && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Unit Price</span>
                      <span>₹{pricing.unit_price?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Quantity</span>
                      <span>x {config.quantity}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Bulk Discount ({discountPercent}%)</span>
                        <span>-₹{pricing.discount_amount?.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.upcharges?.length > 0 && pricing.upcharges.map((u, i) => (
                      <div key={i} className="flex justify-between text-gray-500 text-xs">
                        <span>{u.name}</span>
                        <span>+₹{u.amount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-accent">₹{pricing ? pricing.subtotal?.toFixed(2) : '—'}</span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {product.turnaround_time}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!pricing || pricingLoading}
                className="w-full mt-4 bg-accent text-white py-2.5 rounded-lg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pricingLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>Add to Cart — ₹{pricing ? pricing.subtotal?.toFixed(2) : '...'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
