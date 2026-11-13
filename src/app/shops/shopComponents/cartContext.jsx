'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

const CartContext = createContext(null);
const blank = '[]';
const eventName = 'shopos-cart-updated';
function read(key) {
  try {
    return localStorage.getItem(key) || blank;
  } catch {
    return blank;
  }
}
function parse(raw) {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event(eventName));
  } catch {
    /* Cart storage is optional. */
  }
}
function subscribe(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(eventName, callback);
  };
}
export function CartProvider({ shopSlug, children }) {
  const key = `shopos_cart_${shopSlug}`;
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => blank,
  );
  const items = useMemo(
    () => parse(raw).map((line) => ({ ...line, key: line.key || `${line.id}:${line.variantId || ''}` })),
    [raw],
  );
  const addItem = useCallback(
    (product, qty = 1, variant) => {
      const current = parse(read(key));
      const variantId = variant?.id || '';
      const lineKey = `${product.id}:${variantId}`;
      const previous = current.find(
        (item) => (item.key || `${item.id}:${item.variantId || ''}`) === lineKey,
      );
      const stock = variant?.stock ?? product.stock;
      const max = product.backorder ? 100 : Math.min(100, stock ?? 100);
      if (max <= 0) return false;
      const line = {
        key: lineKey,
        id: product.id,
        variantId,
        variantName: variant?.name,
        name: product.name,
        price: variant?.price ?? product.price,
        imageUrl: variant?.imageUrl || product.imageUrl,
        qty: Math.min(max, (previous?.qty || 0) + qty),
        max,
      };
      write(key, [...current.filter((item) => item !== previous), line]);
      return true;
    },
    [key],
  );
  const updateQty = useCallback(
    (lineKey, qty) => {
      const count = Math.trunc(Number(qty));
      if (!Number.isFinite(count)) return;
      const current = parse(read(key));
      write(
        key,
        current.flatMap((line) =>
          (line.key || `${line.id}:${line.variantId || ''}`) === lineKey
            ? count <= 0
              ? []
              : [{ ...line, qty: Math.min(line.max || 100, count) }]
            : [line],
        ),
      );
    },
    [key],
  );
  const clear = useCallback(() => write(key, []), [key]);
  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      addItem,
      updateQty,
      removeItem: (lineKey) => updateQty(lineKey, 0),
      clear,
    }),
    [items, addItem, updateQty, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  return useContext(CartContext);
}
