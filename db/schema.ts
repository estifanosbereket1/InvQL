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
import { relations } from "drizzle-orm";

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

export const logTypeEnum = pgEnum("log_type", [
  "create",
  "update",
  "delete",
  "stock_adjustment",
]);

// 1. Core Products Table
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }).unique().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  category: categoryEnum("category").notNull().default("other"),
  status: statusEnum("status").notNull().default("in_stock"),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10), // The custom alert baseline
  imageUrl: text("image_url"),
  imagePublicId: text("image_public_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Audit Activity Logs Table
export const inventoryLogs = pgTable("inventory_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  type: logTypeEnum("type").notNull(),
  quantityChanged: integer("quantity_changed").notNull().default(0),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Declarative Structural Relations
export const productsRelations = relations(products, ({ many }) => ({
  logs: many(inventoryLogs),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLogs.productId],
    references: [products.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type InventoryLog = typeof inventoryLogs.$inferSelect;
