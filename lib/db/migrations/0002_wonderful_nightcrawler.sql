ALTER TABLE "posts" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_slug_unique" UNIQUE("slug");