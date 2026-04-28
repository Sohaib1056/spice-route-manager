import { useState, useEffect } from "react";
import { Save, Shield, Eye, EyeOff } from "lucide-react";
import { Pill } from "@/components/Pill";
import { api } from "@/services/api";
import toast from "react-hot-toast";

interface UserPermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: "Admin" | "Manager" | "Staff";
  permissions: {
    dashboard: boolean;
    inventory: boolean;
    stock: boolean;
    purchase: boolean;
    sales: boolean;
    supplier: boolean;
    finance: boolean;
    reports: boolean;
    users: boolean;
    settings: boolean;
  };
}

const availablePermissions = [
  { id: "dashboard", name: "Dashboard" },
  { id: "inventory", name: "Inventory" },
  { id: "stock", name: "Stock" },
  { id: "purchase", name: "Purchase" },
  { id: "sales", name: "Sales" },
  { id: "supplier", name: "Suppliers" },
  { id: "finance", name: "Finance" },
  { id: "reports", name: "Reports" },
  { id: "users", name: "Users" },
  { id: "settings", name: "Settings" },
];

export default function PermissionsPage() {
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.getAllPermissions();
      if (response.success && response.data) {
        setUserPermissions(response.data as UserPermission[]);
      } else {
        toast.error("Failed to load permissions");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("An error occurred while fetching permissions");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (userId: string, permissionKey: keyof UserPermission["permissions"]) => {
    setUserPermissions((prev) =>
      prev.map((user) =>
        user.userId === userId
          ? {
              ...user,
              permissions: {
                ...user.permissions,
                [permissionKey]: !user.permissions[permissionKey],
              },
            }
          : user
      )
    );
  };

  const savePermissions = async () => {
    setSaving(true);
    
    const updates = userPermissions.map((user) => ({
      userId: user.userId,
      permissions: user.permissions,
    }));

    const response = await api.bulkUpdatePermissions(updates, {
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("Permissions updated successfully!");
    } else {
      toast.error(response.message || "Failed to update permissions");
    }
    
    setSaving(false);
  };

  const getPermissionCount = (user: UserPermission) => {
    return Object.values(user.permissions).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage sidebar access permissions for users.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left sticky left-0 bg-cream/60 z-10">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                {availablePermissions.map((perm) => (
                  <th key={perm.id} className="px-3 py-3 text-center min-w-[100px]">
                    {perm.name}
                  </th>
                ))}
                <th className="px-4 py-3 text-center">Count</th>
              </tr>
            </thead>
            <tbody>
              {userPermissions.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-cream/40">
                  <td className="px-4 py-4 sticky left-0 bg-card hover:bg-cream/40 z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-brand/10 text-amber-brand font-semibold">
                        {user.userName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-walnut">{user.userName}</p>
                        <p className="text-xs text-muted-foreground">{user.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Pill tone={user.role === "Admin" ? "warning" : user.role === "Manager" ? "info" : "muted"}>
                      {user.role}
                    </Pill>
                  </td>
                  {availablePermissions.map((perm) => {
                    const hasPermission = user.permissions[perm.id as keyof typeof user.permissions];
                    return (
                      <td key={perm.id} className="px-3 py-4 text-center">
                        <button
                          onClick={() => togglePermission(user.userId, perm.id as keyof typeof user.permissions)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                            hasPermission
                              ? "bg-success/20 text-success hover:bg-success/30"
                              : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                          }`}
                          disabled={user.role === "Admin"}
                          title={user.role === "Admin" ? "Admin has all permissions" : "Toggle permission"}
                        >
                          {hasPermission ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-center">
                    <Pill tone="info" className="text-xs">
                      {getPermissionCount(user)}/{availablePermissions.length}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {userPermissions.length === 0 && (
          <div className="py-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-walnut">No user permissions configured</p>
          </div>
        )}
      </div>

      {userPermissions.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={savePermissions}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-pistachio px-6 py-2.5 text-sm font-medium text-pistachio-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
