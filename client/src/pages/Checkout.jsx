import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { Check, ArrowLeft, ArrowRight, CreditCard, Wallet, Building2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = ['Delivery Details', 'Review Order', 'Payment'];

const paymentMethods = [
  { id: 'UPI', label: 'UPI', icon: Wallet },
  { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
  { id: 'Credit Card', label: 'Credit/Debit Card', icon: CreditCard },
  { id: 'COD', label: 'Cash on Delivery', icon: Truck },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, subtotal, couponDiscount, gst, grandTotal, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [placing, setPlacing] = useState(false);

  const update = (field) => (e) => setDetails({ ...details, [field]: e.target.value });

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        items: cart.items.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          category: i.category,
          configuration: i.configuration,
          design_file_path: i.design_file_path,
          design_notes: i.design_notes,
          no_design_flag: i.no_design_flag,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount_applied: i.discount_applied,
          line_total: i.line_total
        })),
        customer_name: details.name,
        customer_email: details.email,
        customer_phone: details.phone,
        delivery_address: {
          line1: details.line1,
          line2: details.line2,
          city: details.city,
          state: details.state,
          pincode: details.pincode
        },
        order_notes: details.notes,
        subtotal,
        coupon_code: cart.coupon?.code || '',
        coupon_discount: couponDiscount,
        payment_method: paymentMethod
      });
      clearCart();
      navigate(`/order-confirmation/${data.order_id}`);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    }
    setPlacing(false);
  };

  if (cart.items.length === 0 && step === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/products/posters" className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Delivery Details */}
      {step === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-5">Delivery Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={details.name} onChange={update('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={details.email} onChange={update('email')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={details.phone} onChange={update('phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input type="text" value={details.line1} onChange={update('line1')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <input type="text" value={details.line2} onChange={update('line2')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={details.city} onChange={update('city')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" value={details.state} onChange={update('state')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input type="text" value={details.pincode} onChange={update('pincode')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
              <textarea value={details.notes} onChange={update('notes')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none resize-none" rows={2} />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setStep(1)} className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover flex items-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Order Items</h2>
            <div className="space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 shrink-0">
                    {item.product_name?.substring(0, 6)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product_name}</h4>
                    <p className="text-xs text-gray-500">
                      {item.configuration?.size}{item.configuration?.finish ? `, ${item.configuration.finish}` : ''}
                      {item.configuration?.weight ? `, ${item.configuration.weight}` : ''}
                      {item.configuration?.type ? `, ${item.configuration.type}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.configuration?.waterproof ? 'Waterproof, ' : ''}
                      {item.configuration?.sides ? `${item.configuration.sides} sided, ` : ''}
                      {item.configuration?.corners ? `${item.configuration.corners} corners` : ''}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Qty: {item.quantity} × ₹{item.unit_price?.toFixed(2)}</span>
                      <span className="font-semibold text-sm">₹{item.line_total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Delivery Address</h2>
            <p className="text-sm text-gray-600">
              {details.name}<br />
              {details.line1}{details.line2 ? `, ${details.line2}` : ''}<br />
              {details.city}, {details.state} - {details.pincode}<br />
              {details.phone}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Price Breakdown</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({cart.coupon?.code})</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Grand Total</span>
                <span className="text-accent">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setStep(0)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(2)} className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover flex items-center gap-2">
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === m.id ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <m.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{m.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input type="text" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} placeholder="4242 4242 4242 4242" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input type="text" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input type="text" value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} placeholder="123" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Scan with any UPI app</p>
                <div className="flex items-center gap-2 justify-center">
                  <input type="text" placeholder="UPI ID (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none" />
                </div>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-700">
                Pay when your order is delivered. Cash or digital payment accepted at doorstep.
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Items</span><span>{cart.items.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{couponDiscount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-accent">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
            >
              {placing ? (
                <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Placing Order...</>
              ) : (
                <>Place Order — ₹{grandTotal.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
