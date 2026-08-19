CREATE TYPE "public"."provider" AS ENUM('google', 'kakao', 'naver');--> statement-breakpoint
CREATE TYPE "public"."mission_category" AS ENUM('nature', 'exploration', 'connection', 'solitude', 'movement', 'creation', 'sensation', 'declutter');--> statement-breakpoint
CREATE TYPE "public"."emotion_tag" AS ENUM('excitement', 'joy', 'pride', 'gratitude', 'curiosity', 'relief', 'freshness', 'indifference', 'awkwardness', 'regret');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nickname" varchar(30) NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "mission_category" NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_draws" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mission_id" integer NOT NULL,
	"drawn_date" date NOT NULL,
	"drawn_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_draw_id" uuid NOT NULL,
	"rating" smallint,
	"photo_path" text,
	"content" text,
	"emotion_tags" "emotion_tag"[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" BETWEEN 1 AND 5),
	CONSTRAINT "reviews_emotion_tags_max" CHECK (array_length("reviews"."emotion_tags", 1) IS NULL OR array_length("reviews"."emotion_tags", 1) <= 3),
	CONSTRAINT "reviews_min_one_input" CHECK ("reviews"."rating" IS NOT NULL OR "reviews"."photo_path" IS NOT NULL OR "reviews"."content" IS NOT NULL OR array_length("reviews"."emotion_tags", 1) > 0)
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"milestone" integer NOT NULL,
	"emotion_snapshot" jsonb,
	"narrative_summary" text,
	"category_tendency" jsonb,
	"emotion_trend" jsonb,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mission_draws" ADD CONSTRAINT "mission_draws_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_draws" ADD CONSTRAINT "mission_draws_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_mission_draw_id_mission_draws_id_fk" FOREIGN KEY ("mission_draw_id") REFERENCES "public"."mission_draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_provider" ON "users" USING btree ("provider","provider_id");--> statement-breakpoint
CREATE INDEX "idx_missions_category" ON "missions" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_mission_draws_day" ON "mission_draws" USING btree ("user_id","drawn_date");--> statement-breakpoint
CREATE INDEX "idx_mission_draws_user" ON "mission_draws" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_reviews_mission_draw" ON "reviews" USING btree ("mission_draw_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_insights_user_milestone" ON "insights" USING btree ("user_id","milestone");--> statement-breakpoint
CREATE INDEX "idx_insights_user_milestone_desc" ON "insights" USING btree ("user_id","milestone" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_refresh_tokens_hash" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens" USING btree ("user_id");