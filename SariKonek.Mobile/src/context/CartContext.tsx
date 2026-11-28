
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { CartItem, Product } from '../types';

interface CartContextValue {
  storeId: string | null;
  items: CartItem[];
  total: number;
  itemCount: number;
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
      // Adding from a different store starts a fresh cart.
      const base =
        prev.length > 0 && prev[0].product.storeId !== product.storeId
          ? []
          : prev;

      const existing = base.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return base.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stockQuantity
                ),
              }
            : item
        );
      }

      return [...base, { product, quantity: 1 }];
    });
  }, []);

  const setQty = useCallback(
    (productId: string, quantity: number) => {
      setItems((prev) =>
        prev
          .map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: Math.min(
                    Math.max(0, quantity),
                    item.product.stockQuantity
                  ),
                }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const remove = useCallback((productId: string) => {
    setItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const storeId =
    items.length > 0 ? items[0].product.storeId : null;

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  // Total quantity of products, not the number of distinct products.
  const itemCount = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      storeId,
      items,
      total,
      itemCount,
      add,
      setQty,
      remove,
      clear,
    }),
    [storeId, items, total, itemCount, add, setQty, remove, clear]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }

  return ctx;
}
