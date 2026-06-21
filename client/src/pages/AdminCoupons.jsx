import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Plus, Edit2, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage', discount_value: '',
    min_order_amount: '', max_uses: '', expiry_date: '', is_active: true
  });

  const fetchCoupons = () => {
    api.get('/coupons').then(({ data }) => setCoupons(data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', expiry_date: '', is_active: true });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: c.discount_value?.toString() || '',
      min_order_amount: c.min_order_amount?.toString() || '', max_uses: c.max_uses?.toString() || '',
      expiry_date: c.expiry_date || '', is_active: !!c.is_active
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.code || !form.discount_value) { toast.error('Code and value required'); return; }
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount || 0),
        max_uses: Number(form.max_uses || 0)
      };
      if (editing) {
        await api.put(`/coupons/${editing.id}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No coupons yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Value</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Min Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Uses</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Max Uses</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Expires</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-xs">{c.code}</td>
                    <td className="px-4 py-3 capitalize">{c.discount_type}</td>
                    <td className="px-4 py-3">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                    <td className="px-4 py-3">₹{c.min_order_amount}</td>
                    <td className="px-4 py-3">{c.usage_count}</td>
                    <td className="px-4 py-3">{c.max_uses || '∞'}</td>
                    <td className="px-4 py-3 text-xs">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="text-accent"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteCoupon(c.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" placeholder="WELCOME20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" placeholder={form.discount_type === 'percentage' ? '10' : '100'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                <input type="number" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = unlimited)</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded accent-accent" />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={save} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">{editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
