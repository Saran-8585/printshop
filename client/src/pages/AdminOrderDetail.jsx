import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/axios';
import { ArrowLeft, Package, Download, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const statusFlow = ['pending', 'confirmed', 'printing', 'shipped', 'delivered'];
const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  printing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-teal-100 text-teal-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatusTimeline({ currentStatus, history }) {
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

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const fetchOrder = () => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data);
      setNewStatus(data.status);
      setInternalNotes(data.internal_notes || '');
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const updateStatus = async () => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus, internal_notes: internalNotes });
      toast.success('Order updated');
      fetchOrder();
    } catch (err) { toast.error('Failed'); }
  };

  const downloadInvoice = async () => {
    try {
      const res = await api.get(`/orders/${id}/invoice`, { responseType: 'arraybuffer' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order?.order_number || id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  if (!order) return <div className="text-center py-12 text-gray-500">Order not found</div>;

  return (
    <div>
      <Link to="/admin/orders" className="text-accent text-sm mb-4 flex items-center gap-1 hover:underline">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Orders
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold">{order.order_number}</h1>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadInvoice} className="flex items-center gap-1 text-sm text-accent border border-accent px-3 py-1.5 rounded-lg hover:bg-accent/5">
              <Download className="w-3.5 h-3.5" /> Invoice
            </button>
            <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[order.status]}`}>{order.status}</span>
          </div>
        </div>

        <StatusTimeline currentStatus={order.status} history={order.status_history} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <div key={item.id || idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{item.product_name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.configuration?.size}{item.configuration?.finish ? `, ${item.configuration.finish}` : ''}
                        {item.configuration?.weight ? `, ${item.configuration.weight}` : ''}
                        {item.configuration?.type ? `, ${item.configuration.type}` : ''}
                        {item.configuration?.waterproof ? ', Waterproof' : ''}
                        {item.configuration?.sides ? `, ${item.configuration.sides} sided` : ''}
                        {item.configuration?.corners ? `, ${item.configuration.corners} corners` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity} × ₹{item.unit_price?.toFixed(2)}</p>
                      {item.design_file_path && (
                        <a href={`/uploads/${item.design_file_path}`} target="_blank" className="text-xs text-accent hover:underline mt-1 inline-block">
                          Download Design File
                        </a>
                      )}
                      {item.no_design_flag ? <p className="text-xs text-amber-600 mt-1">No design provided — contact customer</p> : null}
                    </div>
                    <span className="font-medium">₹{item.line_total?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Status History</h3>
            <div className="space-y-2">
              {(order.status_history || []).map((h, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="capitalize font-medium">{h.status}</span>
                  <span className="text-gray-500 text-xs">by {h.changed_by}</span>
                  <span className="text-gray-400 text-xs">{new Date(h.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Update Status</h3>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none mb-4"
            >
              {['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button onClick={updateStatus} className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover">
              Save
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Internal Notes</h3>
            <textarea
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none resize-none"
              rows={4}
            />
            <button onClick={updateStatus} className="mt-2 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200">
              Save Notes
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Customer Info</h3>
            <p className="text-sm text-gray-600">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.customer_email}</p>
            <p className="text-sm text-gray-600">{order.customer_phone}</p>
            <h4 className="font-semibold text-sm mt-3 mb-1">Delivery Address</h4>
            {typeof order.delivery_address === 'object' ? (
              <p className="text-sm text-gray-600">
                {order.delivery_address.line1}<br />
                {order.delivery_address.line2 && <>{order.delivery_address.line2}<br /></>}
                {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
              </p>
            ) : (
              <p className="text-sm text-gray-600">{order.delivery_address}</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Price Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.subtotal?.toFixed(2)}</span></div>
              {order.coupon_discount > 0 && (
                <div className="flex justify-between text-green-600"><span>{order.coupon_code}</span><span>-₹{order.coupon_discount?.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">GST (18%)</span><span>₹{order.gst_amount?.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span className="text-accent">₹{order.grand_total?.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
