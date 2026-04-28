import { useState, useEffect } from "react";
import { Plus, Pencil, Key, Trash2, Users as UsersIcon, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pill } from "@/components/Pill";
import { Modal } from "@/components/Modal";
import { formatDateTime } from "@/lib/format";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  status: "Active" | "Inactive";
  lastLogin?: string;
  permissions: any;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Staff";
  status: "Active" | "Inactive";
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; user: UserRecord | null }>({
    open: false,
    user: null,
  });

  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm<UserFormData>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue } = useForm<UserFormData>();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword } = useForm<{ password: string; confirmPassword: string }>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      if (response.success && response.data) {
        setUsers(response.data as UserRecord[]);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data: UserFormData) => {
    const response = await api.createUser({
      ...data,
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("User created successfully");
      setShowAddModal(false);
      resetAdd();
      fetchUsers();
    } else {
      toast.error(response.message || "Failed to create user");
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    const response = await api.updateUser(selectedUser._id, {
      ...data,
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("User updated successfully");
      setShowEditModal(false);
      setSelectedUser(null);
      resetEdit();
      fetchUsers();
    } else {
      toast.error(response.message || "Failed to update user");
    }
  };

  const handleDeleteUser = (user: UserRecord) => {
    setConfirmState({ open: true, user });
  };

  const doDeleteUser = async (user: UserRecord) => {
    const response = await api.deleteUser(user._id, {
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("User deleted successfully");
      fetchUsers();
    } else {
      toast.error(response.message || "Failed to delete user");
    }
  };

  const handleResetPassword = async (data: { password: string; confirmPassword: string }) => {
    if (!selectedUser) return;

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const response = await api.updateUserPassword(selectedUser._id, data.password, {
      currentUserId: "admin-id",
      currentUserName: "Admin",
      currentUserRole: "Admin",
    });

    if (response.success) {
      toast.success("Password reset successfully");
      setShowPasswordModal(false);
      setSelectedUser(null);
      resetPassword();
    } else {
      toast.error(response.message || "Failed to reset password");
    }
  };

  const openEditModal = (user: UserRecord) => {
    setSelectedUser(user);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("role", user.role);
    setValue("status", user.status);
    setShowEditModal(true);
  };

  const openPasswordModal = (user: UserRecord) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage system users and their access levels.</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"
        >
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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12">
                  <div className="text-center">
                    <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-walnut">No users found</p>
                    <p className="text-sm text-muted-foreground">Add a new user to get started.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t border-border hover:bg-cream/40">
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
                    <Pill tone={u.role === "Admin" ? "warning" : u.role === "Manager" ? "info" : "muted"}>
                      {u.role}
                    </Pill>
                  </td>
                  <td className="px-4 py-4">
                    <Pill tone={u.status === "Active" ? "success" : "muted"}>{u.status}</Pill>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {u.lastLogin ? formatDateTime(u.lastLogin) : "Never"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openPasswordModal(u)}
                        className="rounded-md p-1.5 text-info hover:bg-info/10"
                        aria-label="Reset Password"
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(u)}
                        className="rounded-md p-1.5 text-amber-brand hover:bg-amber-brand/10"
                        aria-label="Edit User"
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                        aria-label="Delete User"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetAdd();
        }}
        title="Add New User"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setShowAddModal(false);
                resetAdd();
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAdd(handleAddUser)}
              className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"
            >
              Create User
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Name
            </label>
            <input
              {...registerAdd("name", { required: true })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Email
            </label>
            <input
              {...registerAdd("email", { required: true })}
              type="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Password
            </label>
            <input
              {...registerAdd("password", { required: true, minLength: 6 })}
              type="password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Minimum 6 characters"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Role
              </label>
              <select
                {...registerAdd("role", { required: true })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Status
              </label>
              <select
                {...registerAdd("status", { required: true })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                defaultValue="Active"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          resetEdit();
        }}
        title="Edit User"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedUser(null);
                resetEdit();
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitEdit(handleEditUser)}
              className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"
            >
              Update User
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Name
            </label>
            <input
              {...registerEdit("name", { required: true })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Email
            </label>
            <input
              {...registerEdit("email", { required: true })}
              type="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Role
              </label>
              <select
                {...registerEdit("role", { required: true })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Status
              </label>
              <select
                {...registerEdit("status", { required: true })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedUser(null);
          resetPassword();
        }}
        title="Reset Password"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setSelectedUser(null);
                resetPassword();
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-walnut hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitPassword(handleResetPassword)}
              className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-medium text-amber-brand-foreground hover:opacity-90"
            >
              Reset Password
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              New Password
            </label>
            <input
              {...registerPassword("password", { required: true, minLength: 6 })}
              type="password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Minimum 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Confirm Password
            </label>
            <input
              {...registerPassword("confirmPassword", { required: true, minLength: 6 })}
              type="password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Re-enter password"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmState.open}
        title="Delete User"
        message={`Are you sure you want to delete "${confirmState.user?.name}"? This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="danger"
        onConfirm={() => {
          const user = confirmState.user;
          setConfirmState({ open: false, user: null });
          if (user) doDeleteUser(user);
        }}
        onCancel={() => setConfirmState({ open: false, user: null })}
      />
    </div>
  );
}
