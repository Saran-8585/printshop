import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { Package, ChevronRight, FileText, X, Eye, ShoppingBag } from 'lucide-react';
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
  if (currentIdx < 0) return null;
  return (
    <div className="flex items-center gap-1 py-4">
      {statusFlow.map((s, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              i <= currentIdx ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {i < currentIdx ? <Package className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-[10px] mt-1 text-gray-500 capitalize">{s}</span>
          </div>
          {i < statusFlow.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-accent' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      api.get('/orders/my').then(({ data }) => setOrders(data));
      if (selectedOrder === orderId) {
        setOrderDetail(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
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
      toast.success('Invoice downloaded');
    } catch { toast.error('Failed to download invoice'); }
  };

  const openDetail = async (order) => {
    setSelectedOrder(order.id || order._id);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/orders/${order.id || order._id}`);
      setOrderDetail(data);
    } catch {
      toast.error('Failed to load order details');
      setOrderDetail(order);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (selectedOrder) {
    if (detailLoading) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} className="text-accent text-sm mb-4 flex items-center gap-1 hover:underline">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to orders
          </button>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        </div>
      );
    }

    const order = orderDetail || orders.find(o => (o.id || o._id) === selectedOrder);

    if (!order) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} className="text-accent text-sm mb-4 flex items-center gap-1 hover:underline">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to orders
          </button>
          <p className="text-center text-gray-500 py-20">Order not found.</p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} className="text-accent text-sm mb-4 flex items-center gap-1 hover:underline">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to orders
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <div>
              <h2 className="font-semibold text-lg">{order.order_number}</h2>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadInvoice(order.id || order._id)} className="flex items-center gap-1 text-sm text-accent border border-accent px-3 py-1.5 rounded-lg hover:bg-accent/5">
                <FileText className="w-3.5 h-3.5" /> Invoice
              </button>
              {order.status === 'pending' && (
                <button onClick={() => handleCancel(order.id || order._id)} className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          <StatusTimeline currentStatus={order.status} />

          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${statusColors[order.status] || 'bg-gray-100'}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-gray-400" /> Delivery Address
              </h4>
              <p className="text-gray-600">
                {order.customer_name}<br />
                {typeof order.delivery_address === 'object' ? (
                  <>
                    {order.delivery_address.line1}<br />
                    {order.delivery_address.line2 && <>{order.delivery_address.line2}<br /></>}
                    {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
                  </>
                ) : <>{order.delivery_address}</>}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Payment</h4>
              <p className="text-gray-600">{order.payment_method}</p>
              <p className="text-gray-600 capitalize">Status: {order.payment_status}</p>
              {order.coupon_code && (
                <p className="text-green-600 text-xs mt-1">Coupon: {order.coupon_code}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Items ({(order.items || order.orderItems || []).length})</h4>
            <div className="space-y-3">
              {(order.items || order.orderItems || []).map((item, idx) => (
                <div key={item.id || item._id || idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <h5 className="font-medium text-sm">{item.product_name}</h5>
                    <span className="font-medium text-sm">₹{item.line_total?.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.configuration?.size}
                    {item.configuration?.finish ? `, ${item.configuration.finish}` : ''}
                    {item.configuration?.weight ? `, ${item.configuration.weight}` : ''}
                    {item.configuration?.type ? `, ${item.configuration.type}` : ''}
                    {item.configuration?.waterproof ? ', Waterproof' : ''}
                    {item.configuration?.sides ? `, ${item.configuration.sides === 'Double' ? 'Double' : 'Single'} sided` : ''}
                    {item.configuration?.corners ? `, ${item.configuration.corners} corners` : ''}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Qty: {item.quantity} × ₹{item.unit_price?.toFixed(2)}</span>
                    {item.design_file_path && <span className="text-accent">Design uploaded</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="max-w-xs ml-auto space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.coupon_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({order.coupon_code})</span>
                  <span>-₹{order.coupon_discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">GST (18%)</span>
                <span>₹{order.gst_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-1">
                <span>Total</span>
                <span className="text-accent">₹{order.grand_total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link to="/products/posters" className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline">
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </p>
            <Link to="/products/posters" className="text-accent font-medium text-sm hover:underline">
              Start Shopping
            </Link>
          </div>
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
                {filteredOrders.map(order => (
                  <tr key={order.id || order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{order.order_number}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">{order.items_count || order.items?.length || '-'}</td>
                    <td className="px-4 py-3 font-medium">₹{order.grand_total?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500">{order.payment_method}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetail(order)}
                          className="text-accent hover:text-accent-hover p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadInvoice(order.id || order._id)}
                          className="text-gray-400 hover:text-accent p-1"
                          title="Download Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(order.id || order._id)}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Cancel Order"
                          >
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
    </div>
  );
}
