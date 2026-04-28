import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const pathToPermission: Record<string, string> = {
  "/dashboard": "dashboard",
  "/inventory": "inventory",
  "/low-stock": "inventory",
  "/purchase": "purchase",
  "/sales": "sales",
  "/supplier": "supplier",
  "/finance": "finance",
  "/reports": "reports",
  "/users": "users",
  "/permissions": "users",
  "/notifications": "users",
  "/settings": "settings",
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const path = location.pathname;

  // Check if user is logged in by checking localStorage
  const getUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      if (!user.email || !user.role || !user.name) {
        localStorage.removeItem("user");
        return null;
      }
      return user;
    } catch (error) {
      localStorage.removeItem("user");
      return null;
    }
  };

  const user = getUser();

  // If not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions
  const permissionKey = pathToPermission[path];
  if (permissionKey && user.role !== "Admin") {
    const permissions = user.permissions || {};
    if (permissions[permissionKey] === false) {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has permission, render the children
  return <>{children}</>;
}
