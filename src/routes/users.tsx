import { useState } from "react";
import { Plus, Pencil, Key, Trash2, Users as UsersIcon } from "lucide-react";
import { Pill } from "@/components/Pill";
import { formatDate, formatDateTime } from "@/lib/format";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export default function UsersPage() {
  const [list, setList] = useState<UserRecord[]>([]); // Empty state for production
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage system users and their access levels.</p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add New User
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Last Login</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-cream/40">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-brand/10 text-amber-brand font-semibold">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-walnut">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Pill tone="info">{u.role}</Pill>
                </td>
                <td className="px-4 py-4">
                  <Pill tone={u.status === "Active" ? "success" : "muted"}>{u.status}</Pill>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {formatDateTime(u.lastLogin)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded-md p-1.5 text-info hover:bg-info/10" aria-label="Reset Password"><Key className="h-4 w-4" /></button>
                    <button className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10" aria-label="Edit User"><Pencil className="h-4 w-4" /></button>
                    <button className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete User"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-walnut">No users found</p>
            <p className="text-sm text-muted-foreground">Add a new user to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
