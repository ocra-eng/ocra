CREATE TYPE "public"."member_role" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('active', 'expired', 'pending');--> statement-breakpoint
CREATE TYPE "public"."membership_type" AS ENUM('athlete', 'organisation');--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supabase_user_id" uuid,
	"email" text NOT NULL,
	"billing_email" text,
	"display_name" text NOT NULL,
	"profile_name" text,
	"photo_url" text,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"member_number" text NOT NULL,
	"type" "membership_type" DEFAULT 'athlete' NOT NULL,
	"status" "membership_status" NOT NULL,
	"stripe_subscription_id" text,
	"current_period_end" timestamp with time zone,
	"confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "members_supabase_user_idx" ON "members" USING btree ("supabase_user_id");--> statement-breakpoint
CREATE INDEX "members_billing_email_idx" ON "members" USING btree ("billing_email");--> statement-breakpoint
CREATE INDEX "members_stripe_customer_idx" ON "members" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_number_idx" ON "memberships" USING btree ("member_number");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_subscription_idx" ON "memberships" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "memberships_member_idx" ON "memberships" USING btree ("member_id");