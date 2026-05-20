ALTER TABLE "forms" ADD COLUMN "email_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "email_confirmations" boolean DEFAULT true NOT NULL;