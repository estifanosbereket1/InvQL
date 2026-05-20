import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cloudinary } from "@/lib/cloudinary";

type Params = { params: { id: string } };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, params.id));
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const [updated] = await db
      .update(products)
      .set({
        ...body,
        status: computeStatus(body.quantity),
        updatedAt: new Date(),
      })
      .where(eq(products.id, params.id))
      .returning();
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, params.id));

    if (product?.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await db.delete(products).where(eq(products.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

function computeStatus(qty: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty <= 0) return "out_of_stock";
  if (qty <= 10) return "low_stock";
  return "in_stock";
}
