import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { contact } from "@/lib/site-data";

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const { items, count, total, updateQuantity, removeFromCart, clearCart } = useCart();

  const checkoutViaWhatsApp = () => {
    const lines = items.map(
      (item) => `• ${item.name} × ${item.quantity} — ${item.price}`
    );
    const message = [
      "Hi Digital ToolVerse! I'd like to order:",
      "",
      ...lines,
      "",
      `Total: ${total}`,
    ].join("\n");
    const url = `${contact.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex" aria-label="Open cart">
          <ShoppingCart className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> Your Cart
            {count > 0 && <span className="text-sm text-muted-foreground">({count})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-40" />
            <p className="text-sm">Your cart is empty.</p>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto py-4">
            {items.map((item) => (
              <div key={item.slug} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.category}</div>
                  <div className="mt-1 font-display text-sm font-bold text-gradient-gold">{item.price}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart(item.slug)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 sm:flex-col">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-lg font-bold text-gradient-gold">{total}</span>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={checkoutViaWhatsApp}
            >
              <MessageCircle className="mr-1.5 h-4 w-4" /> Checkout via WhatsApp
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearCart}>
              Clear cart
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
