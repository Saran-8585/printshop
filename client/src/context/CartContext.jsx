import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

function loadCart() {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : { items: [], coupon: null };
  } catch { return { items: [], coupon: null }; }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((item) => {
    setCart(prev => {
      const existing = prev.items.findIndex(
        i => i.product_id === item.product_id && JSON.stringify(i.configuration) === JSON.stringify(item.configuration)
      );
      if (existing >= 0) {
        const items = [...prev.items];
        items[existing].quantity += item.quantity;
        items[existing].line_total = items[existing].unit_price * items[existing].quantity;
        return { ...prev, items };
      }
      return { ...prev, items: [...prev.items, { ...item, id: Date.now() }] };
    });
    setDrawerOpen(true);
  }, []);

  const updateQuantity = useCallback((itemId, qty) => {
    if (qty < 1) return;
    setCart(prev => {
      const items = prev.items.map(i =>
        i.id === itemId ? { ...i, quantity: qty, line_total: i.unit_price * qty } : i
      );
      return { ...prev, items };
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
  }, []);

  const applyCoupon = useCallback((coupon) => {
    setCart(prev => ({ ...prev, coupon }));
  }, []);

  const removeCoupon = useCallback(() => {
    setCart(prev => ({ ...prev, coupon: null }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], coupon: null });
  }, []);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce((sum, i) => sum + i.line_total, 0);
  const couponDiscount = cart.coupon ? cart.coupon.discount : 0;
  const afterCoupon = subtotal - couponDiscount;
  const gst = afterCoupon > 0 ? Math.round(afterCoupon * 0.18 * 100) / 100 : 0;
  const grandTotal = Math.round((afterCoupon + gst) * 100) / 100;

  return (
    <CartContext.Provider value={{
      cart, itemCount, subtotal, couponDiscount, gst, grandTotal,
      drawerOpen, setDrawerOpen,
      addItem, updateQuantity, removeItem, applyCoupon, removeCoupon, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
