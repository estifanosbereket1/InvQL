CREATE TYPE "public"."category" AS ENUM('electronics', 'clothing', 'food', 'furniture', 'tools', 'other');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('in_stock', 'low_stock', 'out_of_stock');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sku" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"category" "category" DEFAULT 'other' NOT NULL,
	"status" "status" DEFAULT 'in_stock' NOT NULL,
	"image_url" text,
	"image_public_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
