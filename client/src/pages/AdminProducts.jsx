import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Plus, Edit2, X, Power, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const catOptions = [
  { value: 'posters', label: 'Posters', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'stickers', label: 'Stickers', color: 'bg-rose-100 text-rose-700' },
  { value: 'visiting-cards', label: 'Visiting Cards', color: 'bg-amber-100 text-amber-700' },
];

const allSizes = {
  posters: ['A4', 'A3', 'A2', 'A1'],
  stickers: ['5×5cm', '7×7cm', '10×10cm'],
  'visiting-cards': ['Standard (90×54mm)', 'Square (55×55mm)', 'Mini (85×28mm)'],
};

const allFinishes = {
  posters: ['Matte', 'Glossy', 'Satin'],
  stickers: ['Matte Laminate', 'Gloss Laminate', 'Transparent', 'Holographic'],
  'visiting-cards': ['Matte', 'Glossy', 'Soft Touch', 'Spot UV', 'Foil'],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'posters', description: '', base_price: '', turnaround_time: '3-5 business days',
    available_sizes: [], available_finishes: [], status: 'active'
  });

  const fetchProducts = () => {
    api.get('/products?status=all').then(({ data }) => setProducts(data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', category: 'posters', description: '', base_price: '', turnaround_time: '3-5 business days', available_sizes: [], available_finishes: [], status: 'active' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, description: p.description || '',
      base_price: p.base_price?.toString() || '', turnaround_time: p.turnaround_time || '3-5 business days',
      available_sizes: Array.isArray(p.available_sizes) ? p.available_sizes : JSON.parse(p.available_sizes || '[]'),
      available_finishes: Array.isArray(p.available_finishes) ? p.available_finishes : JSON.parse(p.available_finishes || '[]'),
      status: p.status
    });
    setShowModal(true);
  };

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      available_sizes: prev.available_sizes.includes(size)
        ? prev.available_sizes.filter(s => s !== size)
        : [...prev.available_sizes, size]
    }));
  };

  const toggleFinish = (finish) => {
    setForm(prev => ({
      ...prev,
      available_finishes: prev.available_finishes.includes(finish)
        ? prev.available_finishes.filter(f => f !== finish)
        : [...prev.available_finishes, finish]
    }));
  };

  const save = async () => {
    if (!form.name || !form.base_price) { toast.error('Name and base price required'); return; }
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, { ...form, base_price: Number(form.base_price) });
        toast.success('Product updated');
      } else {
        await api.post('/products', { ...form, base_price: Number(form.base_price) });
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error('Failed to save'); }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/products/${id}/status`);
      fetchProducts();
      toast.success('Status toggled');
    } catch { toast.error('Failed'); }
  };

  const openPricing = async () => {
    try {
      const { data } = await api.get('/pricing');
      setPricingData(data);
      setShowPricing(true);
    } catch { toast.error('Failed to load pricing'); }
  };

  const savePricing = async () => {
    try {
      await api.put('/pricing', pricingData);
      toast.success('Pricing updated');
      setShowPricing(false);
    } catch { toast.error('Failed'); }
  };

  const catLabel = (category) => catOptions.find(c => c.value === category)?.label || category;
  const catColor = (category) => catOptions.find(c => c.value === category)?.color || 'bg-gray-100';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button onClick={openPricing} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Pricing Rules</button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Base Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Variants</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Orders</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Rating</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${catColor(p.category)}`}>{catLabel(p.category)}</span></td>
                    <td className="px-4 py-3">₹{p.base_price}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const sizes = typeof p.available_sizes === 'string' ? JSON.parse(p.available_sizes) : (p.available_sizes || []);
                        const finishes = typeof p.available_finishes === 'string' ? JSON.parse(p.available_finishes) : (p.available_finishes || []);
                        return `${sizes.length} sizes, ${finishes.length} finishes`;
                      })()}
                    </td>
                    <td className="px-4 py-3">{p.order_count}</td>
                    <td className="px-4 py-3">{p.avg_rating?.toFixed(1)} ({p.total_reviews})</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-accent hover:text-accent-hover"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => toggleStatus(p.id)} className={`${p.status === 'active' ? 'text-gray-400' : 'text-green-500'} hover:opacity-70`}>
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => { setForm({...form, category: e.target.value, available_sizes: [], available_finishes: [] }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none">
                  {catOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                <input type="number" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turnaround Time</label>
                <input type="text" value={form.turnaround_time} onChange={e => setForm({...form, turnaround_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {(allSizes[form.category] || []).map(s => (
                    <button key={s} onClick={() => toggleSize(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.available_sizes.includes(s) ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Finishes</label>
                <div className="flex flex-wrap gap-2">
                  {(allFinishes[form.category] || []).map(f => (
                    <button key={f} onClick={() => toggleFinish(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.available_finishes.includes(f) ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={save} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">{editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Rules Modal */}
      {showPricing && pricingData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPricing(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Pricing Rules</h2>
              <button onClick={() => setShowPricing(false)}><X className="w-5 h-5" /></button>
            </div>

            <h3 className="font-semibold mb-3">Bulk Discount Tiers</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-left px-3 py-2">Min Qty</th>
                    <th className="text-left px-3 py-2">Max Qty</th>
                    <th className="text-left px-3 py-2">Discount %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pricingData.rules.map(rule => (
                    <tr key={rule.id}>
                      <td className="px-3 py-2">{rule.product_name}</td>
                      <td className="px-3 py-2">{rule.min_qty}</td>
                      <td className="px-3 py-2">{rule.max_qty}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={rule.discount_percent}
                          onChange={e => setPricingData(prev => ({
                            ...prev,
                            rules: prev.rules.map(r => r.id === rule.id ? { ...r, discount_percent: Number(e.target.value) } : r)
                          }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold mb-3">Finish Upcharges</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-left px-3 py-2">Finish</th>
                    <th className="text-left px-3 py-2">Upcharge (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pricingData.upcharges.map(u => (
                    <tr key={u.id}>
                      <td className="px-3 py-2">{u.product_name}</td>
                      <td className="px-3 py-2">{u.finish_name}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={u.upcharge_amount}
                          onChange={e => setPricingData(prev => ({
                            ...prev,
                            upcharges: prev.upcharges.map(up => up.id === u.id ? { ...up, upcharge_amount: Number(e.target.value) } : up)
                          }))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowPricing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Close</button>
              <button onClick={savePricing} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
