import type { Tool } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export function ToolCard({ tool }: { tool: Tool }) {
  const initial = tool.name.charAt(0);
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const isInCart = items.some((item) => item.slug === tool.slug);

  const handleAddToCart = () => {
    addToCart(tool, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl gradient-border p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
      {tool.badge && (
        <span className="absolute right-3 top-3 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {tool.badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white border border-border shadow-sm overflow-hidden">
          {tool.logo ? (
            <img
              src={tool.logo}
              alt={`${tool.name} logo`}
              loading="lazy"
              className="h-7 w-7 rounded-full object-contain"
            />
          ) : (
            <span className="font-display text-xl font-bold text-primary">{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{tool.category}</div>
          <div className="font-semibold truncate">{tool.name}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground line-clamp-2 min-h-10">{tool.tagline}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold text-gradient-gold">{tool.price}</div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleAddToCart}
            className={`h-9 w-9 rounded-lg border transition ${
              justAdded || isInCart
                ? "border-primary bg-primary/10 text-primary"
                : "border-border"
            }`}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
            View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
