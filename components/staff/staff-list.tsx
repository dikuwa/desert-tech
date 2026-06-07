"use client";

import { useState } from "react";
import { UserRole, UserStatus } from "@/lib/enums";
import { Permissions } from "@/lib/permissions";
import {
  MoreHorizontal,
  Mail,
  Shield,
  ShieldOff,
  UserX,
  Key,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[] | null;
  twoFactorEnabled: boolean;
  lastActiveAt: Date | null;
  createdAt: Date;
}

interface StaffListProps {
  staff: StaffMember[];
  currentUserRole: UserRole;
  onUpdate: () => void;
}

export function StaffList({ staff, currentUserRole, onUpdate }: StaffListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "activate" | "disable" | "revoke-sessions";
    member: StaffMember;
  } | null>(null);

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<UserStatus, string> = {
      [UserStatus.INVITED]: "bg-warning/10 text-warning border-warning/20",
      [UserStatus.ACTIVE]: "bg-success/10 text-success border-success/20",
      [UserStatus.SUSPENDED]: "bg-destructive/10 text-destructive border-destructive/20",
      [UserStatus.DISABLED]: "bg-muted text-muted-foreground border-border",
    };
    return variants[status] || variants[UserStatus.DISABLED];
  };

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, string> = {
      [UserRole.OWNER]: "bg-primary/10 text-primary border-primary/20",
      [UserRole.ADMIN]: "bg-info/10 text-info border-info/20",
      [UserRole.STAFF]: "bg-muted text-muted-foreground border-border",
    };
    return variants[role] || variants[UserRole.STAFF];
  };

  const handleStatusChange = async (id: string, newStatus: UserStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      onUpdate();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setLoadingId(null);
      setConfirmAction(null);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/staff/${id}/sessions`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke sessions");
      }

      alert("All sessions revoked successfully");
      onUpdate();
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
      alert(error instanceof Error ? error.message : "Failed to revoke sessions");
    } finally {
      setLoadingId(null);
      setConfirmAction(null);
    }
  };

  const canManage = (member: StaffMember) => {
    if (currentUserRole === UserRole.OWNER) return true;
    if (member.role === UserRole.OWNER) return false;
    if (currentUserRole === UserRole.ADMIN && member.role === UserRole.ADMIN) return false;
    return true;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary font-bold text-lg">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getRoleBadge(member.role)}
                    >
                      {member.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getStatusBadge(member.status)}
                    >
                      {member.status}
                    </Badge>
                    {member.twoFactorEnabled && (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/20"
                      >
                        2FA
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {member.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last active: {formatDate(member.lastActiveAt)} | Created:{" "}
                    {formatDate(member.createdAt)}
                  </p>
                  {member.permissions && member.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.permissions.slice(0, 5).map((p) => (
                        <span
                          key={p}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {p}
                        </span>
                      ))}
                      {member.permissions.length > 5 && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          +{member.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {canManage(member) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loadingId === member.id}>
                      {loadingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        navigator.clipboard.writeText(member.email)
                      }
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Copy Email
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {member.status === UserStatus.ACTIVE && (
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmAction({ type: "suspend", member })
                        }
                        className="text-warning"
                      >
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Suspend Account
                      </DropdownMenuItem>
                    )}

                    {member.status === UserStatus.SUSPENDED && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(member.id, UserStatus.ACTIVE)
                        }
                        className="text-success"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Activate Account
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({ type: "revoke-sessions", member })
                      }
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Revoke All Sessions
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({ type: "disable", member })
                      }
                      className="text-destructive"
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Disable Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "suspend" && "Suspend Account"}
              {confirmAction?.type === "activate" && "Activate Account"}
              {confirmAction?.type === "disable" && "Disable Account"}
              {confirmAction?.type === "revoke-sessions" && "Revoke All Sessions"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "suspend" &&
                `Are you sure you want to suspend ${confirmAction.member.name}'s account? They will be immediately logged out and unable to access the dashboard.`}
              {confirmAction?.type === "activate" &&
                `Are you sure you want to activate ${confirmAction.member.name}'s account?`}
              {confirmAction?.type === "disable" &&
                `Are you sure you want to disable ${confirmAction.member.name}'s account? This will permanently disable their access and cannot be undone.`}
              {confirmAction?.type === "revoke-sessions" &&
                `Are you sure you want to revoke all active sessions for ${confirmAction.member.name}? They will be logged out of all devices.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "revoke-sessions") {
                  handleRevokeSessions(confirmAction.member.id);
                } else {
                  handleStatusChange(
                    confirmAction.member.id,
                    confirmAction.type === "suspend"
                      ? UserStatus.SUSPENDED
                      : confirmAction.type === "activate"
                      ? UserStatus.ACTIVE
                      : UserStatus.DISABLED
                  );
                }
              }}
              className={
                confirmAction?.type === "disable"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
