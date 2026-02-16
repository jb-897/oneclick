CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"place" text NOT NULL,
	"total_spots" integer NOT NULL,
	"utilities" text[] NOT NULL,
	"description" text,
	"level" text,
	"tags" text[] NOT NULL,
	"registration_open" boolean DEFAULT true NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"year" text NOT NULL,
	"group" text NOT NULL,
	"university" text NOT NULL,
	"has_coding_experience" boolean NOT NULL,
	"status" text DEFAULT 'PENDING_CONFIRMATION' NOT NULL,
	"confirmation_token_hash" text,
	"confirmation_token_expires_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_session_email" UNIQUE("session_id","email")
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_session_id_event_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."event_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "registrations_confirmation_token_hash" ON "registrations" USING btree ("confirmation_token_hash");