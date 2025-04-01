import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// This component protects routes by checking authentication
const ProtectedRoute = ({ 
  requiredRole = null, // Optional role requirement
  redirectPath = "/login" 
}) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  // In a real app, you would verify the token with your backend
  // and retrieve the user's roles from your authentication system
  
  // For this example, we'll use localStorage to simulate user roles
  const userRoles = localStorage.getItem("userRoles") ? 
    JSON.parse(localStorage.getItem("userRoles")) : 
    ["user"]; // Default role
  
  // If role is required, check if user has the required role
  const hasRequiredRole = requiredRole ? 
    userRoles.includes(requiredRole) : 
    true;
  
  // If user is not authenticated or doesn't have required role, redirect to login
  if (!isAuthenticated || !hasRequiredRole) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and has required role, render children routes
  return <Outlet />;
};

export default ProtectedRoute;