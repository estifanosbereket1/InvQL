import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  const [result] = await db
    .select({ maxSku: sql<string>`max(sku)` })
    .from(products)
    .where(sql`sku ~ '^SKU-[0-9]+$'`);

  const last = result?.maxSku ? parseInt(result.maxSku.split("-")[1]) : 0;
  const next = String(last + 1).padStart(4, "0");

  return NextResponse.json({ sku: `SKU-${next}` });
}
