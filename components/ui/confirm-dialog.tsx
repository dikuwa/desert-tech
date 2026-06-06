"use client";

import { AlertTriangle, Trash2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConfirmAction {
  label: string;
  onClick: () => void;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirm: ConfirmAction;
  cancel?: ConfirmAction;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirm,
  cancel,
  icon,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {icon ?? (
              confirm.variant === "danger" ? (
                <Trash2 className="h-4 w-4 text-destructive/70" />
              ) : confirm.variant === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-warning" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              )
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={() => {
              cancel?.onClick?.();
              onOpenChange(false);
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {cancel?.label || "Cancel"}
          </button>
          <button
            onClick={() => {
              confirm.onClick();
              onOpenChange(false);
            }}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors",
              confirm.variant === "danger"
                ? "bg-destructive/85 hover:bg-destructive"
                : confirm.variant === "warning"
                  ? "bg-warning hover:bg-warning/90"
                  : "bg-primary hover:bg-primary/90",
            )}
          >
            {confirm.label}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
