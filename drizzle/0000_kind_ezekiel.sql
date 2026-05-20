CREATE TYPE "public"."category" AS ENUM('electronics', 'clothing', 'food', 'furniture', 'tools', 'other');--> statement-breakpoint
CREATE TYPE "public"."log_type" AS ENUM('create', 'update', 'delete', 'stock_adjustment');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('in_stock', 'low_stock', 'out_of_stock');--> statement-breakpoint
CREATE TABLE "inventory_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"product_name" varchar(255) NOT NULL,
	"type" "log_type" NOT NULL,
	"quantity_changed" integer DEFAULT 0 NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sku" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"category" "category" DEFAULT 'other' NOT NULL,
	"status" "status" DEFAULT 'in_stock' NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"image_url" text,
	"image_public_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;