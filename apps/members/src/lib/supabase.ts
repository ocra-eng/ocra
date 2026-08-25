import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
// Supabase renamed the browser key: newer projects show a "publishable key"
// (sb_publishable_…), older ones an "anon" key. Either works here.
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !publishableKey) {
  throw new Error(
    "VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required — see .env.example"
  )
}

/**
 * Auth only. All data goes through our API, never Supabase's Data API —
 * the tables are locked down to match (see the RLS migration), so this key
 * being public costs us nothing.
 */
export const supabase = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    /**
     * PKCE, not implicit. The implicit flow returns the access AND refresh
     * token in the URL fragment, so they land in browser history, get
     * copied into bug reports, and leak through anything that reads the
     * URL. PKCE returns a single-use code instead and exchanges it for
     * tokens over POST. v1 shipped tokens in query strings; we are not
     * repeating that.
     */
    flowType: "pkce",
  },
})
