CREATE TABLE "partner_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"percent" integer NOT NULL,
	"shop_url" text NOT NULL,
	"code" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "partner_offers_key_idx" ON "partner_offers" USING btree ("key");--> statement-breakpoint
-- Same two locks as 0001: the codes in this table are the member benefit and
-- must not be reachable through the Supabase Data API with the anon key.
ALTER TABLE "partner_offers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON "partner_offers" FROM anon, authenticated;
