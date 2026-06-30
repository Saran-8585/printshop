import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { Package, User, Star, FileText, Eye, X, ChevronRight, MapPin, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  printing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-teal-100 text-teal-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusFlow = ['pending', 'confirmed', 'printing', 'shipped', 'delivered'];

function StatusTimeline({ currentStatus }) {
  const currentIdx = statusFlow.indexOf(currentStatus);
  const steps = ['Pending', 'Confirmed', 'Printing', 'Shipped', 'Delivered'];
  return (
    <div className="flex items-center gap-1 py-4">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              i <= currentIdx ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {i < currentIdx ? <Package className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-[10px] mt-1 text-gray-500">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-accent' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      api.get('/orders/my').then(({ data }) => setOrders(data));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel');
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'arraybuffer' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed'); }
  };

  const sidebarTabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'reviews', label: 'My Reviews', icon: Star },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="flex gap-8 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-56 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {sidebarTabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSelectedOrder(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors ${
                  tab === t.id ? 'bg-accent/5 text-accent border-l-2 border-accent' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Orders Tab */}
          {tab === 'orders' && !selectedOrder && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">My Orders ({orders.length})</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No orders yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Order</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Items</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Payment</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{order.items_count}</td>
                          <td className="px-4 py-3 font-medium">₹{order.grand_total?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-500">{order.payment_method}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => setSelectedOrder(order)} className="text-accent hover:text-accent-hover">
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.status === 'pending' && (
                                <button onClick={() => handleCancel(order.id)} className="text-red-500 hover:text-red-700">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Order Detail */}
          {tab === 'orders' && selectedOrder && (
            <div>
              <button onClick={() => setSelectedOrder(null)} className="text-accent text-sm mb-4 flex items-center gap-1 hover:underline">
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to orders
              </button>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-semibold text-lg">{selectedOrder.order_number}</h2>
                    <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => downloadInvoice(selectedOrder.id)} className="flex items-center gap-1 text-sm text-accent border border-accent px-3 py-1.5 rounded-lg hover:bg-accent/5">
                      <FileText className="w-3.5 h-3.5" /> Invoice
                    </button>
                    {selectedOrder.status === 'pending' && (
                      <button onClick={() => handleCancel(selectedOrder.id)} className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <StatusTimeline currentStatus={selectedOrder.status} />

                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Delivery Address</h4>
                    {typeof selectedOrder.delivery_address === 'object' ? (
                      <p className="text-gray-600">
                        {selectedOrder.delivery_address.line1}<br />
                        {selectedOrder.delivery_address.line2 && <>{selectedOrder.delivery_address.line2}<br /></>}
                        {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.pincode}
                      </p>
                    ) : <p className="text-gray-600">{selectedOrder.delivery_address}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Payment</h4>
                    <p className="text-gray-600">{selectedOrder.payment_method}</p>
                    <p className="text-gray-600 capitalize">Status: {selectedOrder.payment_status}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Items ({selectedOrder.items?.length || 0})</h4>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between">
                          <h5 className="font-medium text-sm">{item.product_name}</h5>
                          <span className="font-medium text-sm">₹{item.line_total?.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.configuration?.size}{item.configuration?.finish ? `, ${item.configuration.finish}` : ''}
                          {item.configuration?.weight ? `, ${item.configuration.weight}` : ''}
                          {item.configuration?.type ? `, ${item.configuration.type}` : ''}
                          {item.configuration?.waterproof ? ', Waterproof' : ''}
                          {item.configuration?.sides ? `, ${item.configuration.sides} sided` : ''}
                          {item.configuration?.corners ? `, ${item.configuration.corners} corners` : ''}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Qty: {item.quantity} × ₹{item.unit_price?.toFixed(2)}</span>
                          {item.design_file_path && <span>Design: {item.design_file_path}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="max-w-xs ml-auto space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{selectedOrder.subtotal?.toFixed(2)}</span></div>
                    {selectedOrder.coupon_discount > 0 && (
                      <div className="flex justify-between text-green-600"><span>Discount ({selectedOrder.coupon_code})</span><span>-₹{selectedOrder.coupon_discount?.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-gray-500">GST (18%)</span><span>₹{selectedOrder.gst_amount?.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span className="text-accent">₹{selectedOrder.grand_total?.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && (
            <ProfileSection />
          )}

          {/* Reviews Tab */}
          {tab === 'reviews' && (
            <ReviewsSection />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });

  const updateProfile = async () => {
    // This would need a PUT /api/auth/profile endpoint - using optimistic update
    toast.success('Profile updated (demo)');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={profile.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
          </div>
        </div>
        <button onClick={updateProfile} className="mt-4 bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover">Save Changes</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current</label>
            <input type="password" value={password.current} onChange={e => setPassword({...password, current: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New</label>
            <input type="password" value={password.newPass} onChange={e => setPassword({...password, newPass: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
            <input type="password" value={password.confirm} onChange={e => setPassword({...password, confirm: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
          </div>
        </div>
        <button className="mt-4 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200">Update Password</button>
      </div>
    </div>
  );
}

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [pending, setPending] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    api.get('/reviews/my').then(({ data }) => setReviews(data)).catch(() => {});
    api.get('/reviews/pending').then(({ data }) => setPending(data)).catch(() => {});
  }, []);

  const submit = async (productId, orderItemId) => {
    try {
      await api.post('/reviews', { product_id: productId, order_item_id: orderItemId, rating: formData.rating, comment: formData.comment });
      toast.success('Review submitted!');
      setShowForm(null);
      setFormData({ rating: 5, comment: '' });
      api.get('/reviews/my').then(({ data }) => setReviews(data));
      api.get('/reviews/pending').then(({ data }) => setPending(data));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Leave a Review ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Order: {item.order_number}</p>
                  </div>
                  <button
                    onClick={() => setShowForm(showForm === item.id ? null : item.id)}
                    className="text-sm text-accent font-medium hover:underline"
                  >
                    {showForm === item.id ? 'Cancel' : 'Write Review'}
                  </button>
                </div>
                {showForm === item.id && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} onClick={() => setFormData({...formData, rating: i})}>
                          <Star className={`w-5 h-5 ${i <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={formData.comment}
                      onChange={e => setFormData({...formData, comment: e.target.value})}
                      placeholder="Share your experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none resize-none"
                      rows={2}
                    />
                    <button onClick={() => submit(item.product_id, item.id)} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover">
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">My Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{r.product_name}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
