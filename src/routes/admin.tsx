import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, Users, ShoppingBag, Settings, Sparkles, LogOut, GraduationCap, BadgeCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Digital ToolVerse" }, { name: "robots", content: "noindex" }] }),
  component: AdminShell,
});

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/courses", label: "Courses", icon: GraduationCap },
  { to: "/admin/enrollments", label: "Enrollments", icon: BadgeCheck },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-aurora text-sm text-muted-foreground">Loading…</div>;
  }
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-aurora px-4">
        <div className="gradient-border rounded-2xl p-8 text-center max-w-sm">
          <h1 className="font-display text-xl font-bold">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user ? "Your account doesn't have admin access." : "Please sign in with an admin account."}
          </p>
          <Link to="/login" search={{ redirect: "/admin" }} className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-aurora">
      <aside className="w-64 hidden md:flex flex-col border-r border-border/60 bg-background/80 backdrop-blur p-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold mb-6 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          DB Admin
        </Link>
        <nav className="grid gap-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <LogOut className="h-4 w-4" /> Exit admin
          </Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="h-14 border-b border-border/60 flex items-center px-6 bg-background/60 backdrop-blur">
          <div className="text-sm text-muted-foreground">Admin Panel</div>
        </header>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
