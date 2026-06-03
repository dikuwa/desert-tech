"use client";

import { useState } from "react";
import { UserCog, Shield, ShieldOff, Pencil, Check, X, Plus } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

export default function StaffPage() {
  const staff = useDashboardStore((s) => s.staff);
  const addStaff = useDashboardStore((s) => s.addStaff);
  const toggleStaffActive = useDashboardStore((s) => s.toggleStaffActive);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Staff" as "Staff" | "Admin", permissions: [] as string[] });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{staff.filter(s => s.isActive).length} active staff members</p>
      </div>

      <div className="grid gap-4">
        {staff.map(member => (
          <div key={member.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary font-bold text-lg">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
                    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                      member.role === "Admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-info-soft text-info border-info/20")}>
                      {member.role}
                    </span>
                    <span className={cn("h-2 w-2 rounded-full", member.isActive ? "bg-success" : "bg-gray-300")} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{member.email}</p>
                  {member.lastActive && (
                    <p className="text-xs text-muted-foreground mt-1">Last active: {new Date(member.lastActive).toLocaleDateString()}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {member.permissions.map(p => (
                      <span key={p} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.role !== "Admin" && (
                  <button onClick={() => toggleStaffActive(member.id)}
                    className={cn("rounded-lg p-2 transition-colors", member.isActive ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5" : "text-success hover:bg-success-soft")}>
                    {member.isActive ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </button>
                )}
                <button className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              Created: {new Date(member.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">New Staff Member</h3>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as "Admin" | "Staff" }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none">
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Create</button>
            <button onClick={() => { setShowAdd(false); setForm({ name: "", email: "", role: "Staff", permissions: [] }); }} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
        <UserCog className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Want to add another staff member?</p>
        <p className="text-xs text-muted-foreground mt-1">New staff members will receive an email invitation.</p>
        <button onClick={() => setShowAdd(true)} className="mt-4 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Invite Staff Member
        </button>
      </div>
    </div>
  );
}
