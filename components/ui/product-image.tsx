"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackClassName?: string;
  showFallbackText?: boolean;
  fallbackIconSize?: number;
}

export function ProductImage({
  src,
  alt,
  className,
  containerClassName,
  fallbackClassName,
  showFallbackText = true,
  fallbackIconSize = 24,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);

  const hasImage = src && !imgError;

  return (
    <div className={cn("relative overflow-hidden w-full h-full", containerClassName)}>
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          className={cn("h-full w-full object-cover object-center", className)}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground/60 p-2",
            fallbackClassName
          )}
        >
          <ImageOff style={{ width: fallbackIconSize, height: fallbackIconSize }} />
          {showFallbackText && (
            <span className="text-[11px] font-medium text-center line-clamp-2 px-1">{alt}</span>
          )}
        </div>
      )}
    </div>
  );
}
