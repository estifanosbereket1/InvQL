import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", [
  "electronics",
  "clothing",
  "food",
  "furniture",
  "tools",
  "other",
]);

export const statusEnum = pgEnum("status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }).unique().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  category: categoryEnum("category").notNull().default("other"),
  status: statusEnum("status").notNull().default("in_stock"),
  imageUrl: text("image_url"),
  imagePublicId: text("image_public_id"), // for Cloudinary deletion
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
