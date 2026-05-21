"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { productSchema, ProductFormValues } from "@/lib/validations";
import { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { Loader2 } from "lucide-react";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food & Beverages" },
  { value: "furniture", label: "Furniture" },
  { value: "tools", label: "Tools & Hardware" },
  { value: "other", label: "Other" },
];

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: ProductFormProps) {
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const generateSku = async () => {
    setIsGeneratingSku(true);
    try {
      const { data } = await axios.post("/api/sku/generate");
      setValue("sku", data.sku, { shouldValidate: true });
    } catch {
      toast.error("Failed to generate SKU");
    } finally {
      setIsGeneratingSku(false);
    }
  };
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      sku: defaultValues?.sku ?? "",
      price: defaultValues?.price ? Number(defaultValues.price) : 0,
      quantity: defaultValues?.quantity ?? 0,
      category: defaultValues?.category ?? "other",
      imageUrl: defaultValues?.imageUrl ?? "",
      imagePublicId: defaultValues?.imagePublicId ?? "",
      lowStockThreshold: defaultValues?.lowStockThreshold ?? 10,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        sku: defaultValues.sku ?? "",
        price: defaultValues.price ? Number(defaultValues.price) : 0,
        quantity: defaultValues.quantity ?? 0,
        category: defaultValues.category ?? "other",
        imageUrl: defaultValues.imageUrl ?? "",
        imagePublicId: defaultValues.imagePublicId ?? "",
        lowStockThreshold: defaultValues.lowStockThreshold ?? 10,
      });
    }
  }, [defaultValues, reset]);

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (!defaultValues?.id) {
      generateSku();
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col min-h-0 flex-1"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">
        <div className="space-y-2">
          <Label>Product Image</Label>
          <ImageUpload
            value={imageUrl || undefined}
            onChange={(url, publicId) => {
              setValue("imageUrl", url);
              setValue("imagePublicId", publicId);
            }}
            onRemove={() => {
              setValue("imageUrl", "");
              setValue("imagePublicId", "");
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="Wireless Headphones"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>

            <InputGroup>
              <InputGroupInput
                id="sku"
                placeholder="SKU-0001"
                className="font-mono text-sm"
                {...register("sku")}
              />
              <InputGroupAddon align="inline-end">
                <button
                  type="button"
                  onClick={generateSku}
                  disabled={isGeneratingSku}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  title="Auto-generate SKU"
                >
                  <Wand2
                    className={`w-3.5 h-3.5 ${isGeneratingSku ? "animate-pulse" : ""}`}
                  />
                </button>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Product details..."
            className="resize-none"
            rows={2}
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" {...register("quantity")} />
            {errors.quantity && (
              <p className="text-xs text-destructive">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="lowStockThreshold"
              className="text-muted-foreground whitespace-nowrap"
            >
              Low Limit
            </Label>
            <Input
              id="lowStockThreshold"
              type="number"
              {...register("lowStockThreshold")}
            />
            {errors.lowStockThreshold && (
              <p className="text-xs text-destructive">
                {errors.lowStockThreshold.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              defaultValue={defaultValues?.category ?? "other"}
              onValueChange={(val) => setValue("category", val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-4 flex gap-3 bg-muted/20">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-[2]" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {defaultValues?.id ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
