import { createClient } from "@supabase/supabase-js";

// Browser-safe Supabase client. Uses the PUBLISHABLE key and respects
// Row Level Security — safe to import from client components.
//
// Env vars are injected by Vite (VITE_ prefix) and available on both
// client and server. See src/lib/config.server.ts for the conventions.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
