import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Orbit, Phone, User, LogOut, Shield } from "lucide-react";
import { nav, contact, brand } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/70">
      {/* Top contact bar */}
      <div className="hidden md:block border-b border-border/40 bg-background/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-9 items-center justify-between text-xs text-muted-foreground">
          <span>Premium AI tools at the best prices in Pakistan</span>
          <a href={`tel:${contact.phoneTel}`} className="inline-flex items-center gap-1.5 hover:text-primary transition">
            <Phone className="h-3.5 w-3.5" /> {contact.phone}
          </a>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
            <Orbit className="h-4 w-4" />
          </span>
          <span>
            {brand.nameLeft}<span className="text-gradient-gold"> {brand.nameRight}</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${contact.phoneTel}`}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary/60 hover:text-primary transition"
          >
            <Phone className="h-3.5 w-3.5" /> {contact.phone}
          </a>
          <CartSheet />
          {isAdmin && (
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" title="Admin">
              <Link to="/admin"><Shield className="h-4 w-4" /></Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" title="Sign out" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" title="Sign in">
              <Link to="/login"><User className="h-4 w-4" /></Link>
            </Button>
          )}
          <Button asChild className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/tools">Explore Tools</Link>
          </Button>
          <button
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3 grid gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={`tel:${contact.phoneTel}`}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground"
            >
              <Phone className="h-4 w-4 text-primary" /> {contact.phone}
            </a>
            <Button asChild className="mt-2 bg-primary text-primary-foreground">
              <Link to="/tools" onClick={() => setOpen(false)}>Explore Tools</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
