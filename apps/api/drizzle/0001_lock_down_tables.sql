-- Close the Supabase Data API off from these tables.
--
-- Supabase publishes every table in `public` through PostgREST, reachable
-- with the anon key that ships in the frontend bundle. This app never uses
-- that path: the API connects directly as `postgres` and enforces access in
-- code. Without this migration the members table — emails included — would
-- be readable by anyone holding a public key.
--
-- Two independent locks, deliberately:
--   1. RLS enabled with no policies -> every row denied to anon/authenticated
--   2. Privileges revoked           -> the roles cannot reach the tables at all
--
-- Note: ENABLE (not FORCE). RLS deliberately does not apply to the table
-- owner, which is how the API keeps working with no policies defined. Adding
-- FORCE here would lock the API out of its own tables.

ALTER TABLE "members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "processed_stripe_events" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "members" FROM anon, authenticated;
REVOKE ALL ON "memberships" FROM anon, authenticated;
REVOKE ALL ON "processed_stripe_events" FROM anon, authenticated;
