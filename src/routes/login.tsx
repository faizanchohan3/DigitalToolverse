import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign in — Digital ToolVerse" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
        setNotice("Account created! You can now sign in. (Check your email if confirmation is on.)");
        setMode("signin");
      } else {
        await signIn(email, password);
        navigate({ to: redirect || "/courses-hub" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="gradient-border rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to access your courses."
              : "Sign up to enroll in courses and track your learning."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-primary">{notice}</p>}

            <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {mode === "signin" ? (
                <><LogIn className="mr-1.5 h-4 w-4" /> Sign in</>
              ) : (
                <><UserPlus className="mr-1.5 h-4 w-4" /> Create account</>
              )}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
