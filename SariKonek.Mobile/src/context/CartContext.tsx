import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextValue {
  storeId: string | null; // derived from the items; null when the cart is empty
  items: CartItem[];
  total: number;
  add: (product: Product) => void;
  setQty: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((product: Product) => {
    if (product.stockQuantity <= 0) return;
    setItems((prev) => {
      // Adding from a different store starts a fresh cart
      const base = prev.length > 0 && prev[0].product.storeId !== product.storeId ? [] : prev;
      const existing = base.find((i) => i.product.id === product.id);
      if (existing) {
        return base.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stockQuantity) }
            : i
        );
      }
      return [...base, { product, quantity: 1 }];
    });
  }, []);

  const setQty = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(quantity, i.product.stockQuantity) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const storeId = items.length > 0 ? items[0].product.storeId : null;
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ storeId, items, total, add, setQty, remove, clear }),
    [storeId, items, total, add, setQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}