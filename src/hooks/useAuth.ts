// Mock auth — single admin user. No real security.
export type Role = "admin" | "manager" | "staff";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
}

const MOCK_USER: AuthUser = {
  id: "u1",
  name: "Imran Khan",
  email: "admin@dryfruitpro.pk",
  role: "admin",
  initials: "IK",
};

export function useAuth() {
  const user = MOCK_USER;
  const isRole = (...roles: Role[]) => roles.includes(user.role);
  return { user, isRole, isAdmin: user.role === "admin" };
}
