"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes, type ReactNode } from "react";

export interface DesertCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  labelClassName?: string;
  wrapperClassName?: string;
}

/**
 * DesertTech styled checkbox component
 * 
 * - Unchecked: light background, subtle border
 * - Checked: orange background, white check
 * - Focused: visible orange-tinted focus ring
 * - Disabled: muted appearance
 */
export const DesertCheckbox = forwardRef<HTMLInputElement, DesertCheckboxProps>(
  ({ className, label, labelClassName, wrapperClassName, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-60",
          wrapperClassName
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className={cn(
              "peer sr-only",
              className
            )}
            {...props}
          />
          {/* Custom checkbox visual */}
          <div
            className={cn(
              "h-4 w-4 rounded border transition-all duration-150",
              "border-border bg-background",
              "peer-checked:border-primary peer-checked:bg-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-1",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "hover:border-primary/50",
              "flex items-center justify-center"
            )}
          >
            {/* Filled check mark — strokes with round caps create a blob at the vertex on small icons,
                so we use a solid-filled path that stays crisp at any size */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={cn(
                "h-3.5 w-3.5 text-primary-foreground transition-transform duration-150",
                "scale-0 peer-checked:scale-100"
              )}
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        </div>
        {label && (
          <span
            className={cn(
              "text-xs text-foreground",
              disabled && "text-muted-foreground",
              labelClassName
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

DesertCheckbox.displayName = "DesertCheckbox";

export default DesertCheckbox;
