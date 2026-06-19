import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('dsv_cart') || '[]'));

  function persist(next) {
    setItems(next);
    localStorage.setItem('dsv_cart', JSON.stringify(next));
  }

  function addItem(product, variant, quantity = 1) {
    const key = `${product.id}:${variant?.id || 'base'}`;
    const price = Number(variant?.salePrice || variant?.regularPrice || product.salePrice || product.regularPrice || 0);
    const image = product.images?.[0]?.url;
    const existing = items.find((item) => item.key === key);
    const next = existing
      ? items.map((item) => (item.key === key ? { ...item, quantity: item.quantity + quantity } : item))
      : [...items, { key, productId: product.id, variantId: variant?.id, name: product.name, slug: product.slug, variantName: variant?.name, price, image, quantity }];
    persist(next);
  }

  function updateQuantity(key, quantity) {
    persist(items.map((item) => (item.key === key ? { ...item, quantity } : item)).filter((item) => item.quantity > 0));
  }

  function removeItem(key) {
    persist(items.filter((item) => item.key !== key));
  }

  function clear() {
    persist([]);
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return <CartContext.Provider value={{ items, total, count, addItem, updateQuantity, removeItem, clear }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
