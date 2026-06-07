"use client";

import { useState } from "react";
import { Check, Loader2, Mail, UserPlus, SwitchCamera } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/lib/enums";
import { Permissions, type Permission, DEFAULT_ROLE_PERMISSIONS } from "@/lib/permissions";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: UserRole;
  onSuccess?: () => void;
}

// ============== PERMISSION GROUP DEFINITIONS ==============

interface PermissionGroup {
  label: string;
  permissions: { key: Permission; label: string }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Orders",
    permissions: [
      { key: Permissions.ORDERS_VIEW, label: "View" },
      { key: Permissions.ORDERS_CREATE, label: "Create" },
      { key: Permissions.ORDERS_UPDATE, label: "Update" },
      { key: Permissions.ORDERS_CANCEL, label: "Cancel" },
      { key: Permissions.ORDERS_DELETE, label: "Delete" },
    ],
  },
  {
    label: "Products & Inventory",
    permissions: [
      { key: Permissions.PRODUCTS_VIEW, label: "View" },
      { key: Permissions.PRODUCTS_CREATE, label: "Create" },
      { key: Permissions.PRODUCTS_UPDATE, label: "Update" },
      { key: Permissions.PRODUCTS_DELETE, label: "Delete" },
      { key: Permissions.PRODUCTS_MANAGE_STOCK, label: "Manage Stock" },
    ],
  },
  {
    label: "Categories & Brands",
    permissions: [
      { key: Permissions.CATEGORIES_VIEW, label: "View Categories" },
      { key: Permissions.CATEGORIES_CREATE, label: "Create Categories" },
      { key: Permissions.CATEGORIES_UPDATE, label: "Update Categories" },
      { key: Permissions.CATEGORIES_DELETE, label: "Delete Categories" },
      { key: Permissions.BRANDS_VIEW, label: "View Brands" },
      { key: Permissions.BRANDS_CREATE, label: "Create Brands" },
      { key: Permissions.BRANDS_UPDATE, label: "Update Brands" },
      { key: Permissions.BRANDS_DELETE, label: "Delete Brands" },
    ],
  },
  {
    label: "Promotions",
    permissions: [
      { key: Permissions.PROMOTIONS_VIEW, label: "View" },
      { key: Permissions.PROMOTIONS_CREATE, label: "Create" },
      { key: Permissions.PROMOTIONS_UPDATE, label: "Update" },
      { key: Permissions.PROMOTIONS_DELETE, label: "Delete" },
    ],
  },
  {
    label: "Customers",
    permissions: [
      { key: Permissions.CUSTOMERS_VIEW, label: "View" },
      { key: Permissions.CUSTOMERS_UPDATE, label: "Update" },
      { key: Permissions.CUSTOMERS_EXPORT, label: "Export" },
    ],
  },
  {
    label: "Follow-ups",
    permissions: [
      { key: Permissions.FOLLOWUPS_VIEW, label: "View" },
      { key: Permissions.FOLLOWUPS_CREATE, label: "Create" },
      { key: Permissions.FOLLOWUPS_UPDATE, label: "Update" },
      { key: Permissions.FOLLOWUPS_DELETE, label: "Delete" },
    ],
  },
  {
    label: "Receipts",
    permissions: [
      { key: Permissions.DOCUMENTS_VIEW, label: "View" },
      { key: Permissions.DOCUMENTS_CREATE, label: "Create" },
      { key: Permissions.DOCUMENTS_UPDATE, label: "Update" },
      { key: Permissions.DOCUMENTS_SEND, label: "Send" },
      { key: Permissions.DOCUMENTS_DELETE, label: "Delete" },
    ],
  },
  {
    label: "Quotations",
    permissions: [
      { key: Permissions.DOCUMENTS_VIEW, label: "View" },
      { key: Permissions.DOCUMENTS_CREATE, label: "Create" },
      { key: Permissions.DOCUMENTS_UPDATE, label: "Update" },
      { key: Permissions.DOCUMENTS_SEND, label: "Send" },
      { key: Permissions.DOCUMENTS_DELETE, label: "Delete" },
    ],
  },
  {
    label: "Notifications",
    permissions: [
      { key: Permissions.NOTIFICATIONS_VIEW, label: "View" },
      { key: Permissions.NOTIFICATIONS_MANAGE, label: "Manage" },
    ],
  },
  {
    label: "Stock Notification Requests",
    permissions: [
      { key: Permissions.STOCK_REQUESTS_VIEW, label: "View" },
      { key: Permissions.STOCK_REQUESTS_UPDATE, label: "Update" },
      { key: Permissions.STOCK_REQUESTS_DELETE, label: "Delete" },
      { key: Permissions.STOCK_REQUESTS_EXPORT, label: "Export" },
    ],
  },
  {
    label: "Payments",
    permissions: [
      { key: Permissions.PAYMENTS_VIEW, label: "View" },
      { key: Permissions.PAYMENTS_CREATE, label: "Record" },
      { key: Permissions.PAYMENTS_UPDATE, label: "Edit" },
      { key: Permissions.PAYMENTS_REFUND, label: "Refund" },
      { key: Permissions.PAYMENTS_EXPORT, label: "Export" },
    ],
  },
  {
    label: "Users",
    permissions: [
      { key: Permissions.USERS_VIEW, label: "View" },
      { key: Permissions.USERS_INVITE, label: "Invite" },
      { key: Permissions.USERS_CREATE, label: "Create Directly" },
      { key: Permissions.USERS_EDIT, label: "Edit Profiles" },
      { key: Permissions.USERS_ASSIGN_ROLES, label: "Assign Roles" },
      { key: Permissions.USERS_MANAGE_PERMISSIONS, label: "Manage Permissions" },
      { key: Permissions.USERS_SUSPEND, label: "Suspend" },
      { key: Permissions.USERS_DISABLE, label: "Disable" },
      { key: Permissions.USERS_DELETE, label: "Delete" },
    ],
  },
  {
    label: "Audit Log",
    permissions: [
      { key: Permissions.AUDIT_LOGS_VIEW, label: "View" },
      { key: Permissions.AUDIT_LOGS_EXPORT, label: "Export" },
    ],
  },
  {
    label: "Settings",
    permissions: [
      { key: Permissions.SETTINGS_VIEW, label: "View" },
      { key: Permissions.SETTINGS_UPDATE, label: "Update" },
    ],
  },
  {
    label: "Dashboard",
    permissions: [
      { key: Permissions.DASHBOARD_VIEW, label: "View Operational Stats" },
      { key: Permissions.DASHBOARD_VIEW_FINANCIAL_SUMMARY, label: "View Financial Summary" },
    ],
  },
];

// Get the non-sensitive permission keys that should be template-loadable
function getRoleTemplatePermissions(role: UserRole): Permission[] {
  if (role === UserRole.OWNER) return Object.values(Permissions);
  return DEFAULT_ROLE_PERMISSIONS[role];
}

export function CreateUserDialog({
  open,
  onOpenChange,
  currentUserRole,
  onSuccess,
}: CreateUserDialogProps) {
  const [method, setMethod] = useState<"invite" | "create">("invite");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  // Create-specific fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setRole(UserRole.STAFF);
    setJobTitle("");
    setPhone("");
    setSelectedPermissions([]);
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
    setSuccessMessage("");
  };

  // Load role template when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Load the default permissions for this role as a starting template
    const template = getRoleTemplatePermissions(newRole);

    // Don't include sensitive permissions for non-OWNER roles in the template
    if (newRole !== UserRole.OWNER && currentUserRole !== UserRole.OWNER) {
      const sensitivePerms: Permission[] = [
        Permissions.USERS_VIEW,
        Permissions.USERS_INVITE,
        Permissions.USERS_CREATE,
        Permissions.USERS_EDIT,
        Permissions.USERS_ASSIGN_ROLES,
        Permissions.USERS_MANAGE_PERMISSIONS,
        Permissions.USERS_SUSPEND,
        Permissions.USERS_DISABLE,
        Permissions.USERS_DELETE,
        Permissions.PAYMENTS_VIEW,
        Permissions.PAYMENTS_CREATE,
        Permissions.PAYMENTS_UPDATE,
        Permissions.PAYMENTS_REFUND,
        Permissions.PAYMENTS_EXPORT,
        Permissions.DASHBOARD_VIEW_FINANCIAL_SUMMARY,
        Permissions.AUDIT_LOGS_EXPORT,
        Permissions.SETTINGS_UPDATE,
      ];
      setSelectedPermissions(template.filter((p) => !sensitivePerms.includes(p)));
    } else {
      setSelectedPermissions(template);
    }
  };

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  // Handle invite by email
  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.toLowerCase().trim(),
          role,
          permissions: selectedPermissions,
          jobTitle: jobTitle.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send invitation");

      setSuccess(true);
      setSuccessMessage(`Invitation sent to ${email}`);
      onSuccess?.();
      setTimeout(() => {
        reset();
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  // Handle direct account creation
  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.toLowerCase().trim(),
          password,
          role,
          permissions: selectedPermissions,
          jobTitle: jobTitle.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create user");

      setSuccess(true);
      setSuccessMessage(`User ${name} created successfully`);
      onSuccess?.();
      setTimeout(() => {
        reset();
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Choose how to add a new team member to the dashboard.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <Check className="mx-auto mb-3 h-8 w-8 text-success" />
            <p className="font-medium">{successMessage}</p>
          </div>
        ) : (
          <>
            {/* Method toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setMethod("invite")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  method === "invite"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-4 w-4" />
                Invite by Email
              </button>
              <button
                type="button"
                onClick={() => setMethod("create")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  method === "create"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form
              onSubmit={method === "invite" ? handleInvite : handleCreate}
              className="space-y-4"
            >
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="user-name">Full Name</Label>
                <Input
                  id="user-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-email">Email Address</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@company.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="user-job-title">Job Title (optional)</Label>
                  <Input
                    id="user-job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Sales Associate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-phone">Phone (optional)</Label>
                  <Input
                    id="user-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +264 81 123 4567"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={(r) => handleRoleChange(r as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    {currentUserRole === UserRole.OWNER && (
                      <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Role determines the default permission template. Permissions can be customized below.
                </p>
              </div>

              {/* Conditional password fields for Create method */}
              {method === "create" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Temporary Password</Label>
                    <Input
                      id="user-password"
                      type="password"
                      minLength={10}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 10 characters"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-confirm-password">Confirm Temporary Password</Label>
                    <Input
                      id="user-confirm-password"
                      type="password"
                      minLength={10}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter the password"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The user will be required to change this password on first login.
                    </p>
                  </div>
                </>
              )}

              {/* Permissions */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Permissions</Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedPermissions.length} selected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  Permissions are based on the selected role template. Toggle individual permissions below.
                </p>

                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {PERMISSION_GROUPS.map((group) => {
                    // Hide Users/Payments/Finance groups if current user isn't OWNER
                    const sensitiveGroups = ["Users", "Payments", "Audit Log"];
                    if (
                      currentUserRole !== UserRole.OWNER &&
                      sensitiveGroups.includes(group.label) &&
                      role !== UserRole.OWNER
                    ) {
                      const visiblePerms = group.permissions.filter((p) =>
                        DEFAULT_ROLE_PERMISSIONS[role]?.includes(p.key)
                      );
                      if (visiblePerms.length === 0) return null;
                      return (
                        <div key={group.label} className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">{group.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {visiblePerms.map((perm) => (
                              <button
                                key={perm.key}
                                type="button"
                                disabled
                                className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground cursor-not-allowed"
                              >
                                {perm.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={group.label} className="rounded-lg border border-border bg-muted/20 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.permissions.map((perm) => {
                            const isSelected = selectedPermissions.includes(perm.key);
                            return (
                              <button
                                key={perm.key}
                                type="button"
                                onClick={() => togglePermission(perm.key)}
                                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                                }`}
                              >
                                {isSelected && <Check className="inline h-3 w-3 mr-0.5" />}
                                {perm.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {method === "invite" ? "Send Invitation" : "Create Account"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
