import { useEffect, useMemo, useState } from 'react';

export default function useCart() {
  const [items, setItems] = useState([]);

  const addItem = (menuItem) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === menuItem.id);
      if (existing) {
        return prev.map((x) => (x.id === menuItem.id ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateQuantity = (id, quantity) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  const clearCart = () => setItems([]);

  const subTotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  useEffect(() => {
    const saved = localStorage.getItem('johjayfoods-cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('johjayfoods-cart', JSON.stringify(items));
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subTotal,
    totalItems
  };
}
