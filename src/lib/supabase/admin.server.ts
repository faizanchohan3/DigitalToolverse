import process from "node:process";

import { createClient } from "@supabase/supabase-js";

// Server-only Supabase admin client. Uses the SECRET key, which BYPASSES
// Row Level Security and has full database access. The .server.ts suffix
// keeps this out of the client bundle — never import it from a component.
//
// Env binds at request time on some runtimes (e.g. Cloudflare Workers), so
// the client is created lazily inside a function rather than at module scope.

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Missing Supabase server env vars. Set VITE_SUPABASE_URL and " +
        "SUPABASE_SECRET_KEY in your .env file.",
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
