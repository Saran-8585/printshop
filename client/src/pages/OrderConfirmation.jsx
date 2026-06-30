import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/axios';
import { CheckCircle, Download, Truck, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const downloadInvoice = async () => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'arraybuffer' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order?.order_number || orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Order not found</div>;
  }

  const estimatedDelivery = new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-6">Thank you for your order, {order.customer_name}!</p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 text-left">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Order Number</span>
            <p className="font-semibold">{order.order_number}</p>
          </div>
          <div>
            <span className="text-gray-500">Status</span>
            <p className="font-semibold capitalize">{order.status}</p>
          </div>
          <div>
            <span className="text-gray-500">Payment</span>
            <p className="font-semibold">{order.payment_method}</p>
          </div>
          <div>
            <span className="text-gray-500">Total</span>
            <p className="font-semibold text-accent">₹{order.grand_total?.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <Truck className="w-4 h-4 text-accent" />
          Estimated delivery by {estimatedDelivery}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button onClick={downloadInvoice} className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover">
          <Download className="w-4 h-4" /> Download Invoice
        </button>
        <Link to="/account" className="flex items-center gap-2 border border-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50">
          <Truck className="w-4 h-4" /> Track Order
        </Link>
        <Link to="/products/posters" className="flex items-center gap-2 border border-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50">
          <FileText className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
