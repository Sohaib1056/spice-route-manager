import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Key, Trash2 } from "lucide-react";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { users as seed, type UserRecord } from "@/data/mockData";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/users")({ component: UsersPage });

function UsersPage() {
  const [list, setList] = useState<UserRecord[]>(seed);
  const [modal, setModal] = useState<{ open: boolean; editing?: UserRecord }>({ open: false });

  const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage staff accounts and permissions.</p>
        <button onClick={() => setModal({ open: true })} className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"><Plus className="h-4 w-4" /> Add User</button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th><th className="text-left p-3">Last Login</th><th className="text-left p-3">Created</th>
              <th className="text-right p-3">Actions</th>
            </tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-cream/40">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-walnut text-cream text-xs font-semibold">{initials(u.name)}</div>
                      <span className="font-medium text-walnut">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3"><Pill tone={u.role === "Admin" ? "walnut" : u.role === "Manager" ? "amber" : "pistachio"}>{u.role}</Pill></td>
                  <td className="p-3">
                    <button onClick={() => { setList((l) => l.map((x) => x.id === u.id ? { ...x, active: !x.active } : x)); }} className={`relative inline-flex h-5 w-9 items-center rounded-full ${u.active ? "bg-success" : "bg-muted"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${u.active ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDateTime(u.lastLogin)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(u.created)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setModal({ open: true, editing: u })} className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => toast.success("Password reset email sent")} className="rounded-md p-1.5 text-info hover:bg-info/10"><Key className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm("Delete user?")) { setList((l) => l.filter((x) => x.id !== u.id)); toast.success("User deleted"); } }} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        open={modal.open}
        editing={modal.editing}
        onClose={() => setModal({ open: false })}
        onSave={(u) => {
          if (modal.editing) {
            setList((l) => l.map((x) => x.id === modal.editing!.id ? { ...x, ...u } : x));
            toast.success("User updated");
          } else {
            setList((l) => [{
              id: `u${Date.now()}`, lastLogin: new Date().toISOString(), created: new Date().toISOString().slice(0, 10),
              initials: u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(), ...u,
            } as UserRecord, ...l]);
            toast.success("User added");
          }
          setModal({ open: false });
        }}
      />
    </div>
  );
}

interface UForm { name: string; email: string; password?: string; role: "Admin" | "Manager" | "Staff"; active: boolean; }
function UserModal({ open, editing, onClose, onSave }: { open: boolean; editing?: UserRecord; onClose: () => void; onSave: (v: UForm) => void }) {
  const { register, handleSubmit, reset } = useForm<UForm>({
    values: editing
      ? { name: editing.name, email: editing.email, role: editing.role, active: editing.active }
      : { name: "", email: "", password: "", role: "Staff", active: true },
  });
  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title={editing ? "Edit User" : "Add User"} size="md"
      footer={<>
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted">Cancel</button>
        <button onClick={handleSubmit(onSave)} className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">Save</button>
      </>}>
      <div className="space-y-3">
        <div><label className="lbl">Full Name</label><input {...register("name", { required: true })} className="input" /></div>
        <div><label className="lbl">Email</label><input type="email" {...register("email", { required: true })} className="input" /></div>
        {!editing && <div><label className="lbl">Password</label><input type="password" {...register("password")} className="input" /></div>}
        <div><label className="lbl">Role</label><select {...register("role")} className="input"><option>Admin</option><option>Manager</option><option>Staff</option></select></div>
        <label className="flex items-center gap-2"><input type="checkbox" {...register("active")} className="h-4 w-4 accent-[var(--color-amber-brand)]" /><span className="text-sm font-medium text-walnut">Active</span></label>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:8px;padding:8px 12px;font-size:14px}.lbl{display:block;margin-bottom:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted-foreground)}`}</style>
    </Modal>
  );
}
