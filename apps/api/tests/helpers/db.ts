import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import type { Database } from "../../src/db/index.js"
import * as schema from "../../src/db/schema.js"

/**
 * A real Postgres engine in-process (WASM), so tests exercise actual SQL,
 * constraints and transactions with no service to run in CI.
 */
export const createTestDb = async (): Promise<Database> => {
  const client = new PGlite()
  const db = drizzle(client, { schema })

  await client.exec(`
    create type member_role as enum ('member', 'admin');
    create type membership_type as enum ('athlete', 'organisation');
    create type membership_status as enum ('active', 'expired', 'pending');

    create table members (
      id uuid primary key default gen_random_uuid(),
      supabase_user_id uuid,
      email text not null,
      billing_email text,
      display_name text not null,
      profile_name text,
      photo_url text,
      role member_role not null default 'member',
      stripe_customer_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create unique index members_email_idx on members (email);
    create unique index members_supabase_user_idx on members (supabase_user_id);
    create index members_billing_email_idx on members (billing_email);
    create index members_stripe_customer_idx on members (stripe_customer_id);

    create table memberships (
      id uuid primary key default gen_random_uuid(),
      member_id uuid not null references members (id) on delete cascade,
      member_number text not null,
      verification_token uuid not null default gen_random_uuid(),
      type membership_type not null default 'athlete',
      status membership_status not null,
      stripe_subscription_id text,
      current_period_end timestamptz,
      confirmed boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create unique index memberships_number_idx on memberships (member_number);
    create unique index memberships_token_idx on memberships (verification_token);
    create unique index memberships_subscription_idx
      on memberships (stripe_subscription_id);
    create index memberships_member_idx on memberships (member_id);

    create table processed_stripe_events (
      id text primary key,
      type text not null,
      processed_at timestamptz not null default now()
    );

    create table partner_offers (
      id uuid primary key default gen_random_uuid(),
      key text not null,
      name text not null,
      percent integer not null,
      shop_url text not null,
      code text,
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create unique index partner_offers_key_idx on partner_offers (key);
  `)

  return db as unknown as Database
}
