"use client";

import { useCallback, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  publicId?: string;
  onChange: (url: string, publicId: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onUpload = useCallback(
    (result: any) => {
      onChange(result.info.secure_url, result.info.public_id);
      setIsLoading(false);
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border group">
          <Image
            src={value}
            alt="Product image"
            fill
            className="object-cover transition-all group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={onUpload}
          onQueuesStart={() => setIsLoading(true)}
          options={{
            maxFiles: 1,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxFileSize: 5000000, // 5MB
            folder: "inventory",
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isLoading}
              className={cn(
                "w-full aspect-video rounded-lg border-2 border-dashed border-border",
                "flex flex-col items-center justify-center gap-3",
                "text-muted-foreground hover:text-foreground hover:border-primary",
                "transition-all duration-200 cursor-pointer group",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <ImagePlus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isLoading ? "Uploading..." : "Click to upload image"}
                </p>
                <p className="text-xs mt-1">PNG, JPG, WebP up to 5MB</p>
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
