"use client";

import { Toaster } from "sonner";

export function StorefrontToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "text-sm font-medium",
        style: {
          background: "var(--color-card)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
        },
        classNames: {
          success:
            "!bg-[#E8F7EE] !text-[#15803D] !border-[#15803D]/30",
          error:
            "!bg-[#FFF3E8] !text-[#f68923] !border-[#f68923]/30",
        },
      }}
    />
  );
}
