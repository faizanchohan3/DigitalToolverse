import type { Tool } from "@/lib/site-data";

export type CartItem = Tool & {
  quantity: number;
  addedAt: number;
};

const CART_COOKIE_NAME = "dtv_cart";
const CART_EXPIRY_DAYS = 30;

function setCookie(name: string, value: string, days: number = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getCartFromCookie(): CartItem[] {
  if (typeof window === "undefined") return [];
  const cartData = getCookie(CART_COOKIE_NAME);
  if (!cartData) return [];
  try {
    return JSON.parse(cartData);
  } catch {
    return [];
  }
}

export function saveCartToCookie(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(cart);
    setCookie(CART_COOKIE_NAME, serialized, CART_EXPIRY_DAYS);
  } catch (e) {
    console.error("Failed to save cart to cookie:", e);
  }
}

export function clearCart() {
  if (typeof window === "undefined") return;
  deleteCookie(CART_COOKIE_NAME);
}

export function addToCart(tool: Tool, quantity: number = 1): CartItem[] {
  const cart = getCartFromCookie();
  const existingItem = cart.find((item) => item.slug === tool.slug);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...tool,
      quantity,
      addedAt: Date.now(),
    });
  }

  saveCartToCookie(cart);
  return cart;
}

export function removeFromCart(toolSlug: string): CartItem[] {
  const cart = getCartFromCookie();
  const filtered = cart.filter((item) => item.slug !== toolSlug);
  saveCartToCookie(filtered);
  return filtered;
}

export function updateQuantity(toolSlug: string, quantity: number): CartItem[] {
  const cart = getCartFromCookie();
  const item = cart.find((item) => item.slug === toolSlug);
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
  saveCartToCookie(cart);
  return cart;
}

export function getCartTotal(cart: CartItem[]): string {
  const total = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/\D/g, "")) || 0;
    return sum + price * item.quantity;
  }, 0);
  return `PKR ${total.toLocaleString()}`;
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
