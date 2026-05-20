"use client";

import Image from "next/image";
import { Product } from "@/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  in_stock: "default",
  low_stock: "secondary",
  out_of_stock: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

interface InventoryTableProps {
  products: Product[];
  isLoading?: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function InventoryTable({
  products,
  isLoading,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 border border-border rounded-lg p-1">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-full h-[60px] rounded-md" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No products yet</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Add your first product to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="hidden md:table-cell">SKU</TableHead>
            <TableHead className="hidden lg:table-cell">Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell>
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      unoptimized
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm leading-tight">
                    {product.name}
                  </p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  {product.sku}
                </code>
              </TableCell>
              <TableCell className="hidden lg:table-cell capitalize text-sm text-muted-foreground">
                {product.category.replace("_", " ")}
              </TableCell>
              <TableCell className="text-right font-medium text-sm">
                ${Number(product.price).toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-sm">
                {product.quantity}
              </TableCell>
              <TableCell>
                <Badge
                  variant={STATUS_VARIANTS[product.status] ?? "outline"}
                  className="text-xs whitespace-nowrap"
                >
                  {STATUS_LABELS[product.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
