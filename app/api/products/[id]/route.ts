import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cloudinary } from "@/lib/cloudinary";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!existing)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });

    const targetQty =
      body.quantity !== undefined ? Number(body.quantity) : existing.quantity;
    const targetThreshold =
      body.lowStockThreshold !== undefined
        ? Number(body.lowStockThreshold)
        : existing.lowStockThreshold;
    const stockDelta = targetQty - existing.quantity;

    const updated = await db.transaction(async (tx) => {
      const [res] = await tx
        .update(products)
        .set({
          ...body,
          quantity: targetQty,
          lowStockThreshold: targetThreshold,
          status: qtyStatus(targetQty, targetThreshold),
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      let logNote = "Product properties updated.";
      let operationType: "update" | "stock_adjustment" = "update";

      if (stockDelta !== 0) {
        operationType = "stock_adjustment";
        logNote = `Stock volume altered from ${existing.quantity} to ${targetQty} (Delta: ${stockDelta > 0 ? "+" : ""}${stockDelta}).`;
      }

      await tx.insert(inventoryLogs).values({
        productId: res.id,
        productName: res.name,
        type: operationType,
        quantityChanged: stockDelta,
        notes: logNote,
      });

      return res;
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    const code = err?.cause?.code ?? err?.code;
    const constraint = err?.cause?.constraint ?? err?.constraint;

    if (code === "23505" && constraint === "products_sku_unique") {
      return NextResponse.json(
        {
          error:
            "A product with this SKU already exists. Please use a unique SKU.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to apply delta updates" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.imagePublicId) {
      await cloudinary.uploader
        .destroy(existing.imagePublicId)
        .catch(() => null);
    }

    await db.transaction(async (tx) => {
      await tx.insert(inventoryLogs).values({
        productId: null, // item is removed
        productName: existing.name,
        type: "delete",
        quantityChanged: -existing.quantity,
        notes: `Permanently expunged item [${existing.sku}] from operational records.`,
      });
      await tx.delete(products).where(eq(products.id, id));
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed deletion runtime" },
      { status: 500 },
    );
  }
}

function qtyStatus(
  qty: number,
  threshold: number,
): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty <= 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}
