import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required").max(100),
  price: z.coerce.number().positive("Price must be positive"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  category: z.enum([
    "electronics",
    "clothing",
    "food",
    "furniture",
    "tools",
    "other",
  ]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePublicId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
