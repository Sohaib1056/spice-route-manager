import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if user is logged in by checking localStorage
  const isAuthenticated = () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        return false;
      }
      
      // Verify it's valid JSON
      const parsed = JSON.parse(user);
      
      // Verify it has required fields
      if (!parsed.email || !parsed.role || !parsed.name) {
        // Invalid user data, clear it
        localStorage.removeItem("user");
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid JSON, clear it
      localStorage.removeItem("user");
      return false;
    }
  };

  // If not authenticated, redirect to login page
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children (protected content)
  return <>{children}</>;
}
