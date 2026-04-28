// Auth hook with localStorage support
export type Role = "Admin" | "Manager" | "Staff";

export interface AuthUser {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  phone?: string;
  status?: string;
}

const getStoredUser = (): AuthUser | null => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return {
        id: parsed._id || parsed.id || "u1",
        _id: parsed._id,
        name: parsed.name || "User",
        email: parsed.email || "user@example.com",
        role: parsed.role || "Staff",
        initials: parsed.name
          ? parsed.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U",
        phone: parsed.phone,
        status: parsed.status,
      };
    }
  } catch (error) {
    console.error("Error reading user from localStorage:", error);
  }

  // Return null if no user is found
  return null;
};

export function useAuth() {
  const user = getStoredUser();
  const isRole = (...roles: Role[]) => user ? roles.includes(user.role) : false;
  return { user, isRole, isAdmin: user?.role === "Admin" };
}
