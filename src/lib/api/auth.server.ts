import { getSupabaseAdmin } from "../supabase/admin.server";

// Server-only auth helpers for createServerFn handlers.
//
// The browser passes its Supabase access token (from the logged-in session)
// as part of the validated input. We verify it here with the SECRET admin
// client, then look up the profile to check admin rights. Never trust an
// `isAdmin`/`userId` sent from the client — always re-derive it from the token.

export type AuthedUser = { id: string; email: string | null; isAdmin: boolean };

export async function requireUser(accessToken: string | undefined): Promise<AuthedUser> {
  if (!accessToken) throw new Error("Not signed in.");
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Invalid or expired session.");

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    isAdmin: Boolean(profile?.is_admin),
  };
}

export async function requireAdmin(accessToken: string | undefined): Promise<AuthedUser> {
  const user = await requireUser(accessToken);
  if (!user.isAdmin) throw new Error("Admin access required.");
  return user;
}
