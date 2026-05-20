import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryLogs } from "@/db/schema";
import { desc, eq, ilike, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10"));
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "all";
    const status = searchParams.get("status") ?? "all";

    const offset = (page - 1) * limit;
    const conditions = [];

    if (search) {
      conditions.push(
        sql`(${ilike(products.name, `%${search}%`)} OR ${ilike(products.sku, `%${search}%`)})`,
      );
    }
    if (category !== "all") {
      conditions.push(
        eq(
          products.category,
          category as (typeof products.category)["enumValues"][number],
        ),
      );
    }
    if (status !== "all") {
      conditions.push(
        eq(
          products.status,
          status as (typeof products.status)["enumValues"][number],
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);
    const totalItems = countResult?.count ?? 0;

    const data = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const actionsFeed = await db
      .select()
      .from(inventoryLogs)
      .orderBy(desc(inventoryLogs.createdAt))
      .limit(7);

    return NextResponse.json({
      items: data,
      recentLogs: actionsFeed,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch data profiles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, description, sku, price, category, imageUrl, imagePublicId } =
      body;

    const qty = Number(body.quantity ?? 0);
    const threshold = Number(body.lowStockThreshold ?? 10);

    const product = await db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(products)
        .values({
          name: name,
          sku: sku,
          description: description || null,
          price: price ? String(price) : "0.00",
          quantity: qty,
          category: category || "other",
          lowStockThreshold: threshold,
          status: computeStatus(qty, threshold),
          imageUrl: imageUrl || null,
          imagePublicId: imagePublicId || null,
        })
        .returning();

      await tx.insert(inventoryLogs).values({
        productId: newProduct.id,
        productName: newProduct.name,
        type: "create",
        quantityChanged: qty,
        notes: `Registered item code [${newProduct.sku}] with initial stock allotment of ${qty}.`,
      });

      return newProduct;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("Database Insertion Failure Error Context:", err);
    return NextResponse.json(
      { error: "Failed to build records" },
      { status: 500 },
    );
  }
}

function computeStatus(
  qty: number,
  threshold: number,
): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty <= 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}
