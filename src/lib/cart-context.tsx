import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Tool } from "@/lib/site-data";
import {
  getCartFromCookie,
  saveCartToCookie,
  addToCart as addToCartUtil,
  removeFromCart as removeFromCartUtil,
  updateQuantity as updateQuantityUtil,
  getCartCount,
  getCartTotal,
  type CartItem,
} from "@/lib/cart-utils";

interface CartContextType {
  items: CartItem[];
  addToCart: (tool: Tool, quantity?: number) => void;
  removeFromCart: (toolSlug: string) => void;
  updateQuantity: (toolSlug: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  total: string;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cart = getCartFromCookie();
    setItems(cart);
    setIsLoading(false);
  }, []);

  const addToCart = (tool: Tool, quantity: number = 1) => {
    const updatedCart = addToCartUtil(tool, quantity);
    setItems(updatedCart);
  };

  const removeFromCart = (toolSlug: string) => {
    const updatedCart = removeFromCartUtil(toolSlug);
    setItems(updatedCart);
  };

  const updateQuantity = (toolSlug: string, quantity: number) => {
    const updatedCart = updateQuantityUtil(toolSlug, quantity);
    setItems(updatedCart);
  };

  const clearCart = () => {
    setItems([]);
    saveCartToCookie([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        count: getCartCount(items),
        total: getCartTotal(items),
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
