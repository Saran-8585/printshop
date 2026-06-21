import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { X, Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, itemCount, subtotal, couponDiscount, gst, grandTotal, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, subtotal });
      if (data.valid) {
        applyCoupon(data);
        toast.success(`Coupon applied! ${data.description}`);
        setCouponCode('');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon');
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={() => setDrawerOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <span className="font-semibold text-lg">Cart ({itemCount})</span>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm mb-6">Add some products to get started!</p>
              <Link
                to="/products/posters"
                onClick={() => setDrawerOpen(false)}
                className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium shrink-0">
                      {item.product_name?.substring(0, 8)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.product_name}</h4>
                      <p className="text-xs text-gray-500 truncate">
                        {item.configuration?.size}{item.configuration?.finish ? `, ${item.configuration.finish}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.unit_price?.toFixed(2)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 hover:bg-gray-200 rounded">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 hover:bg-gray-200 rounded">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">₹{item.line_total?.toFixed(2)}</span>
                          <button onClick={() => removeItem(item.id)} className="p-0.5 hover:bg-red-100 text-red-500 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4 space-y-3">
                {!cart.coupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">{cart.coupon.code}</span>
                      <span className="text-sm">(-₹{couponDiscount.toFixed(2)})</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-1 border-t">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full bg-accent text-white text-center py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
