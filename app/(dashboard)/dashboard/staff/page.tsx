"use client";

import { useState } from "react";
import {
  UserCog,
  Shield,
  ShieldOff,
  Pencil,
  Check,
  X,
  Plus,
  MessageCircle,
  Mail,
  Copy,
  Send,
  Settings2,
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const STORE_EMAIL = process.env.NEXT_PUBLIC_STORE_EMAIL || "sales@desertechnam.com";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";

export default function StaffPage() {
  const staff = useDashboardStore((s) => s.staff);
  const addStaff = useDashboardStore((s) => s.addStaff);
  const updateStaff = useDashboardStore((s) => s.updateStaff);
  const updateStaffRole = useDashboardStore((s) => s.updateStaffRole);
  const toggleStaffActive = useDashboardStore((s) => s.toggleStaffActive);
  const addNotification = useDashboardStore((s) => s.addNotification);
  const settings = useDashboardStore((s) => s.settings);

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [inviteModal, setInviteModal] = useState<string | null>(null); // staff ID or "new"
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "Staff" as "Staff" | "Admin", permissions: [] as string[] });

  // For inline edit
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "Staff" as "Staff" | "Admin" });

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    addStaff({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      permissions: form.permissions,
      isActive: true,
      lastActive: undefined,
    });
    setForm({ name: "", email: "", role: "Staff", permissions: [] });
    setShowAdd(false);
  };

  const startEdit = (member: typeof staff[0]) => {
    setEditId(member.id);
    setEditForm({ name: member.name, email: member.email, role: member.role as "Staff" | "Admin" });
  };

  const handleEditSave = (id: string) => {
    if (!editForm.name.trim()) return;
    updateStaff(id, {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
    });
    updateStaffRole(id, editForm.role);
    setEditId(null);
  };

  const generateInviteToken = () => {
    return `invite-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  };

  const handleInviteWhatsApp = (member: typeof staff[0]) => {
    if (!member.email) return;
    const token = generateInviteToken();
    const inviteLink = `${window.location.origin}/invite/${token}`;
    const message = encodeURIComponent(
      `You've been invited to join the Desert Technology Consultant team! Click here to set up your account: ${inviteLink}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    // Store the invite
    useDashboardStore.getState().addInvite({
      token,
      email: member.email,
      name: member.name,
      role: member.role,
      createdAt: new Date().toISOString(),
    });
    setInviteModal(null);
  };

  const handleInviteEmail = (member: typeof staff[0]) => {
    if (!member.email) return;
    const token = generateInviteToken();
    const inviteLink = `${window.location.origin}/invite/${token}`;
    const subject = encodeURIComponent("You're invited to join Desert Technology");
    const body = encodeURIComponent(
      `Hi ${member.name},\n\nYou've been invited to join the Desert Technology Consultant team.\n\nClick the link below to set up your account and create your password:\n${inviteLink}\n\nWelcome aboard!`,
    );
    window.open(`mailto:${member.email}?subject=${subject}&body=${body}`, "_blank");
    // Store the invite
    useDashboardStore.getState().addInvite({
      token,
      email: member.email,
      name: member.name,
      role: member.role,
      createdAt: new Date().toISOString(),
    });
    setInviteModal(null);
  };

  const handleCopyInviteLink = (member: typeof staff[0]) => {
    const token = generateInviteToken();
    const inviteLink = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteLink);
    useDashboardStore.getState().addInvite({
      token,
      email: member.email,
      name: member.name,
      role: member.role,
      createdAt: new Date().toISOString(),
    });
    setInviteModal(null);
  };

  const handleRegeneratePassword = (member: typeof staff[0]) => {
    const newPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4).toUpperCase();
    updateStaff(member.id, { password: newPassword });
    addNotification({
      type: "followup",
      title: "Password Reset",
      message: `Password regenerated for ${member.name}`,
    });
    // Show the password temporarily
    alert(`New password for ${member.name}: ${newPassword}\n\nPlease share this securely with the staff member.`);
  };

  const allActions = ["orders:view", "orders:update", "products:view", "products:update", "customers:view", "customers:update", "followups:manage", "payments:view", "settings:view"];

  const togglePermission = (memberId: string, perm: string) => {
    const member = staff.find((s) => s.id === memberId);
    if (!member) return;
    const newPerms = member.permissions.includes(perm)
      ? member.permissions.filter((p) => p !== perm)
      : [...member.permissions, perm];
    updateStaff(memberId, { permissions: newPerms });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{staff.filter(s => s.isActive).length} active staff members</p>
      </div>

      <div className="grid gap-4">
        {staff.map((member) => (
          <div key={member.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary font-bold text-lg">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>

                {editId === member.id ? (
                  <div className="space-y-2">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-9 w-56 rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none"
                      placeholder="Full name"
                    />
                    <input
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      className="h-9 w-56 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="Email"
                    />
                    <Select value={editForm.role} onValueChange={v => setEditForm((f) => ({ ...f, role: v as "Staff" | "Admin" }))}>
                      <SelectTrigger className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border shadow-lg z-[80]">
                        <SelectItem value="Staff" className="text-sm cursor-pointer focus:bg-accent">Staff</SelectItem>
                        <SelectItem value="Admin" className="text-sm cursor-pointer focus:bg-accent">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditSave(member.id)}
                        className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                          member.role === "Admin"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-info-soft text-info border-info/20",
                        )}
                      >
                        {member.role}
                      </span>
                      <span className={cn("h-2 w-2 rounded-full", member.isActive ? "bg-success" : "bg-gray-300")} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{member.email}</p>
                    {member.lastActive && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last active: {new Date(member.lastActive).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.permissions.map((p) => (
                        <span
                          key={p}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Invite button - only for non-admin or always */}
                <button
                  onClick={() => setInviteModal(member.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                  title="Invite this person"
                >
                  <Send className="h-4 w-4" />
                </button>
                {member.role !== "Admin" && (
                  <button
                    onClick={() => setDeactivateConfirm(member.id)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      member.isActive
                        ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        : "text-success hover:bg-success-soft",
                    )}
                  >
                    {member.isActive ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </button>
                )}
                <button
                  onClick={() => startEdit(member)}
                  className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Permission toggles (only show when not editing inline) */}
            {editId !== member.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Permissions
                  </p>
                  <button
                    onClick={() => updateStaff(member.id, { permissions: member.permissions.length > 0 ? [] : allActions })}
                    className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {member.permissions.length > 0 ? "Clear all" : "Grant all"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => togglePermission(member.id, action)}
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
                        member.permissions.includes(action)
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {editId !== member.id && (
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Created: {new Date(member.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => {
                    const newRole = member.role === "Staff" ? "Admin" : "Staff";
                    updateStaffRole(member.id, newRole);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors",
                    member.role === "Admin"
                      ? "bg-warning-soft text-warning hover:bg-warning/20"
                      : "bg-info-soft text-info hover:bg-info/20",
                  )}
                >
                  Change to {member.role === "Admin" ? "Staff" : "Admin"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">New Staff Member</h3>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Full name"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email address"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
          />
          <Select value={form.role} onValueChange={v => setForm((f) => ({ ...f, role: v as "Admin" | "Staff" }))}>
            <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border shadow-lg z-[80]">
              <SelectItem value="Staff" className="text-sm cursor-pointer focus:bg-accent">Staff</SelectItem>
              <SelectItem value="Admin" className="text-sm cursor-pointer focus:bg-accent">Admin</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Check className="h-3 w-3" /> Create
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setForm({ name: "", email: "", role: "Staff", permissions: [] });
              }}
              className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Invite {staff.find((s) => s.id === inviteModal)?.name}
              </h3>
              <button
                onClick={() => setInviteModal(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Send an invite link so they can set up their own account and password.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const member = staff.find((s) => s.id === inviteModal);
                  if (member) handleInviteWhatsApp(member);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-whatsapp/30 hover:bg-whatsapp-soft hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-whatsapp-soft text-whatsapp">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Send via WhatsApp</p>
                  <p className="text-xs text-muted-foreground">
                    Opens WhatsApp with invite link
                  </p>
                </div>
              </button>
              <button
                onClick={() => {
                  const member = staff.find((s) => s.id === inviteModal);
                  if (member) handleInviteEmail(member);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-accent hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Send via Email</p>
                  <p className="text-xs text-muted-foreground">
                    Opens email client with invite template
                  </p>
                </div>
              </button>
              <button
                onClick={() => {
                  const member = staff.find((s) => s.id === inviteModal);
                  if (member) handleCopyInviteLink(member);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-border/70 hover:bg-muted hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Copy Invite Link</p>
                  <p className="text-xs text-muted-foreground">
                    Share the invite link manually
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={deactivateConfirm !== null}
        onOpenChange={() => setDeactivateConfirm(null)}
        title={deactivateConfirm ? `${staff.find(s => s.id === deactivateConfirm)?.isActive ? "Deactivate" : "Activate"} staff member?` : ""}
        description={
          deactivateConfirm
            ? staff.find(s => s.id === deactivateConfirm)?.isActive
              ? "This staff member will be deactivated and will no longer be able to access the dashboard."
              : "This staff member will be reactivated and regain access to the dashboard."
            : ""
        }
        confirm={{
          label: deactivateConfirm && staff.find(s => s.id === deactivateConfirm)?.isActive ? "Deactivate" : "Activate",
          onClick: () => {
            if (deactivateConfirm) toggleStaffActive(deactivateConfirm);
            setDeactivateConfirm(null);
          },
          variant: deactivateConfirm && staff.find(s => s.id === deactivateConfirm)?.isActive ? "warning" : "default",
        }}
      />

      {/* Add staff button */}
      <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
        <UserCog className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Want to add another staff member?</p>
        <p className="text-xs text-muted-foreground mt-1">
          New staff members will receive an invitation to set up their own password.
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="mt-4 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Invite Staff Member
        </button>
      </div>
    </div>
  );
}
