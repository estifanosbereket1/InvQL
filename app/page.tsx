"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Product, InventoryLog } from "@/db/schema";
import { ProductFormValues } from "@/lib/validations";
import { InventoryTable } from "@/components/inventory-table";
import { ProductForm } from "@/components/product-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { StatsBar } from "@/components/stats-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Plus,
  Search,
  Boxes,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sheet and Modal triggers
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<{
        items: Product[];
        recentLogs: InventoryLog[];
        meta: PaginationMeta;
      }>("/api/products", {
        params: {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch,
          category: categoryFilter,
          status: statusFilter,
        },
      });
      setProducts(data.items);
      setLogs(data.recentLogs || []);
      setPaginationMeta(data.meta);
    } catch {
      toast.error("Error", { description: "Failed to load products" });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, categoryFilter, statusFilter]);

  useEffect(() => {
    (async () => {
      await fetchProducts();
    })();
  }, [fetchProducts]);

  const handleCreate = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setSheetOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  const handleSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await axios.patch(`/api/products/${editingProduct.id}`, data);
        toast.success("Updated!", {
          description: `${data.name} has been updated.`,
        });
      } else {
        await axios.post("/api/products", data);
        toast.success("Added!", {
          description: `${data.name} has been added.`,
        });
      }
      setSheetOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error("Error", {
        description: error?.response?.data?.error ?? "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/products/${deleteTarget.id}`);
      toast.success("Deleted", {
        description: `${deleteTarget.name} has been removed.`,
      });
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error("Error", { description: "Failed to delete product" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto !pointer-events-auto">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-none">Stockr</h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Inventory Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs hidden sm:flex">
              {paginationMeta.totalItems} items total
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchProducts}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button size="sm" onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <StatsBar products={products} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="food">Food & Beverages</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InventoryTable
          products={products}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {products.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-4 px-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries per page</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-sm font-medium">
                Page {paginationMeta.currentPage} of {paginationMeta.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, paginationMeta.totalPages),
                    )
                  }
                  disabled={
                    currentPage === paginationMeta.totalPages || isLoading
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm mt-8">
            <div className="mb-4">
              <h2 className="text-sm font-semibold tracking-tight">
                System Audit Log
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time history of inventory operations
              </p>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="text-xs flex items-start gap-3 border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
                >
                  <span
                    className={`px-2 py-0.5 rounded-md font-medium text-[10px] tracking-wider uppercase shrink-0 min-w-[110px] text-center ${
                      log.type === "create"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : log.type === "delete"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : log.type === "stock_adjustment"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {log.type.replace("_", " ")}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-foreground mr-1.5">
                      {log.productName}
                    </span>
                    <span className="text-muted-foreground">{log.notes}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px] shrink-0 font-mono self-center">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal={false}>
        <SheetContent
          onInteractOutside={(e) => e.preventDefault()}
          className="w-full sm:max-w-[560px] p-0 flex flex-col h-full overflow-hidden"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
            <SheetTitle>
              {editingProduct ? "Edit product" : "Add new product"}
            </SheetTitle>
            <SheetDescription>
              {editingProduct
                ? "Update the product details below."
                : "Fill in the details to add a new product."}
            </SheetDescription>
          </SheetHeader>
          <ProductForm
            defaultValues={editingProduct ?? undefined}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <DeleteDialog
        open={!!deleteTarget}
        productName={deleteTarget?.name ?? ""}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
