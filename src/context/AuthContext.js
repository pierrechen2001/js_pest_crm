import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { gapi } from "gapi-script";

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [googleAuth, setGoogleAuth] = useState(null);

  // Debug function
  const debugLog = (message, data = null) => {
    console.log(`[Auth Debug] ${message}`, data || '');
  };

  // Handle Google user data - defined first to avoid initialization issues
  const handleGoogleUser = useCallback(async (googleUser) => {
    try {
      const profile = googleUser.getBasicProfile();
      const googleToken = googleUser.getAuthResponse().id_token;
      
      debugLog('Processing Google user:', { email: profile.getEmail() });
      
      // Sign in with Supabase using Google token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleToken,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      debugLog('Successfully authenticated with Supabase');

      // Set user data
      setUser({
        id: data.user.id,
        email: profile.getEmail(),
        roles: ["user"],
        loginMethod: "google"
      });

      localStorage.setItem("loginMethod", "google");
      localStorage.setItem("userRoles", JSON.stringify(["user"]));
      
      // 移除自動導航到 /customers
      // navigate("/customers");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
      throw error;
    }
  }, [navigate]);

  // Google login function
  const googleLogin = useCallback(async (existingGoogleUser) => {
    try {
      console.log("AuthContext: Google login called", { 
        hasExistingUser: !!existingGoogleUser,
        googleAuthAvailable: !!googleAuth
      });
      
      let googleUser;
      
      if (existingGoogleUser) {
        // Use the provided Google user (from Login component)
        googleUser = existingGoogleUser;
        console.log("AuthContext: Using provided Google user");
      } else if (googleAuth) {
        // Get a new Google user from auth instance
        console.log("AuthContext: Getting new Google user from authInstance");
        googleUser = await googleAuth.signIn();
      } else {
        console.error("AuthContext: Google authentication not initialized");
        throw new Error("Google authentication not initialized. Please check your configuration.");
      }
      
      await handleGoogleUser(googleUser);
    } catch (error) {
      console.error("AuthContext: Error during Google login:", error);
      setError(error.message);
      throw error;
    }
  }, [googleAuth, handleGoogleUser]);

  // Initialize Google API client
  useEffect(() => {
    let isInitialized = false;

    const initGoogleAuth = async () => {
      if (isInitialized) return;
      
      try {
        debugLog('Initializing Google Auth...');
        
        // Check if Google API keys are configured
        if (!process.env.REACT_APP_GOOGLE_API_KEY || !process.env.REACT_APP_GOOGLE_CLIENT_ID) {
          debugLog('Google API keys not configured, skipping Google Auth initialization');
          return;
        }
        
        console.log("Google Auth: Starting initialization with:", {
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY?.substring(0, 5) + "...",
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID?.substring(0, 10) + "..."
        });
        
        await gapi.client.init({
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        });
        
        const authInstance = gapi.auth2.getAuthInstance();
        console.log("Google Auth: Auth instance created:", authInstance);
        setGoogleAuth(authInstance);
        
        debugLog('Google Auth initialized successfully');
        
        // If user is already signed in with Google, update the auth state
        if (authInstance.isSignedIn.get()) {
          debugLog('Found existing Google session');
          const googleUser = authInstance.currentUser.get();
          await handleGoogleUser(googleUser);
        }
        
        isInitialized = true;
      } catch (error) {
        console.error("Google Auth: Error initializing Google Auth:", error);
        debugLog('Google Auth initialization failed, but app will continue');
        // Don't set a global error for Google auth failures
        // This allows the app to work even if Google auth is not configured
      }
    };

    // Load the Google API client
    const loadGapiAndInitClient = () => {
      try {
        debugLog('Loading Google API client...');
        console.log("Google Auth: Loading GAPI script");
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onerror = (error) => {
          console.error("Google Auth: Failed to load script:", error);
          debugLog('Failed to load Google API script, but app will continue');
        };
        script.onload = () => {
          debugLog('Google API client loaded');
          console.log("Google Auth: GAPI script loaded, initializing client");
          window.gapi.load('client:auth2', () => {
            console.log("Google Auth: client:auth2 loaded, initializing auth");
            initGoogleAuth();
          });
        };
        document.body.appendChild(script);
      } catch (error) {
        debugLog('Error loading Google API script, but app will continue');
        console.error("Error loading Google API:", error);
      }
    };

    // Try to load Google API client, but don't block app initialization if it fails
    loadGapiAndInitClient();

    return () => {
      isInitialized = true; // Prevent re-initialization on unmount
    };
  }, [handleGoogleUser]);

  // Initialize auth state from localStorage or session
  useEffect(() => {
    let timeoutId;
    
    const initAuth = async () => {
      try {
        debugLog('Initializing auth...');
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          debugLog('Auth initialization timeout reached, forcing loading to false');
          setLoading(false);
          setError('Authentication timed out. Please refresh and try again.');
        }, 5000); // 5 second timeout
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Clear timeout since we got a response
        clearTimeout(timeoutId);
        
        if (sessionError) throw sessionError;
        debugLog('Current session:', session);

        if (session?.user) {
          debugLog('User found in session:', session.user);
          setUser({
            id: session.user.id,
            email: session.user.email,
            roles: JSON.parse(localStorage.getItem("userRoles") || '["user"]'),
            loginMethod: localStorage.getItem("loginMethod") || "email"
          });
        } else {
          debugLog('No user session found, redirecting to login');
          // For initialization, we don't navigate if no session to avoid potential loops
          // We'll just set user to null and let the component handle the redirect
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setError(`Auth error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog('Auth state changed:', { event, session });
      
      if (event === 'SIGNED_IN' && session?.user) {
        debugLog('User signed in:', session.user);
        setUser({
          id: session.user.id,
          email: session.user.email,
          roles: JSON.parse(localStorage.getItem("userRoles") || '["user"]'),
          loginMethod: localStorage.getItem("loginMethod") || "email"
        });
      } else if (event === 'SIGNED_OUT') {
        debugLog('User signed out');
        setUser(null);
        localStorage.removeItem("userRoles");
        localStorage.removeItem("loginMethod");
        navigate('/login');
      }
    });

    return () => {
      debugLog('Cleaning up auth listener');
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Email/Password login
  const login = async (email, password) => {
    try {
      debugLog('Attempting login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');

      debugLog('Login successful:', data.user);

      // Set user roles based on email
      const roles = (email === "admin@example.com" || email === "b12705058@g.ntu.edu.tw") ? ["admin"] : ["user"];
      
      setUser({
        id: data.user.id,
        email: data.user.email,
        roles: roles,
        loginMethod: "email"
      });

      localStorage.setItem("loginMethod", "email");
      localStorage.setItem("userRoles", JSON.stringify(roles));
      
      // 移除自動導航到 /customers
      // navigate("/customers");
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error.message);
      throw error;
    }
  };

  // Sign up with email/password
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signup');

      setUser({
        id: data.user.id,
        email: data.user.email,
        roles: ["user"],
        loginMethod: "email"
      });

      localStorage.setItem("loginMethod", "email");
      localStorage.setItem("userRoles", JSON.stringify(["user"]));
      
      // 移除自動導航到 /customers
      // navigate("/customers");
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Sign out from Google if user was signed in with Google
      if (googleAuth && googleAuth.isSignedIn.get()) {
        await googleAuth.signOut();
      }

      // Clear local storage
      localStorage.removeItem("userRoles");
      localStorage.removeItem("loginMethod");
      
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = (requiredRole) => {
    return user?.roles?.includes(requiredRole) || false;
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        signUp,
        logout,
        hasRole,
        isAuthenticated: !!user,
        loading,
        error,
        googleAuth
      }}
    >
      {loading ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
          {error && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              Error: {error}
            </div>
          )}
        </div>
      ) : error ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'red' 
        }}>
          Error: {error}
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;