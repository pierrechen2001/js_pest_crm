import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      
      if (isAuthenticated) {
        // In a real application, you'd verify the token with your backend
        // and retrieve the user data
        const userEmail = localStorage.getItem("userEmail");
        const loginMethod = localStorage.getItem("loginMethod") || "email";
        const userRoles = localStorage.getItem("userRoles") 
          ? JSON.parse(localStorage.getItem("userRoles")) 
          : ["user"];
          
        setUser({
          email: userEmail,
          roles: userRoles,
          loginMethod: loginMethod
        });
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", userData.email);
    
    if (userData.roles) {
      localStorage.setItem("userRoles", JSON.stringify(userData.roles));
    }
    
    if (userData.loginMethod) {
      localStorage.setItem("loginMethod", userData.loginMethod);
    }
    
    setUser(userData);
    navigate("/customers");
  };

  // Google login function
  const googleLogin = () => {
    // In a real implementation, this would handle Google OAuth
    // For now, we'll just simulate a successful Google login
    
    const userData = {
      email: "user@gmail.com",
      roles: ["user"],
      loginMethod: "google"
    };
    
    login(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRoles");
    localStorage.removeItem("loginMethod");
    setUser(null);
    navigate("/login");
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        logout,
        hasRole,
        isAuthenticated: !!user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;