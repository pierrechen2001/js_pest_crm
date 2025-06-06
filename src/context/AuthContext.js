import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { gapi } from "gapi-script";
import { assignRolePermissions } from '../lib/permissionUtils';
import LoadingScreen from '../components/LoadingScreen';

// Create context
const AuthContext = createContext(null);

// authUtils.js (or at the top of AuthContext.js)

// 🔑 This lives *outside* your AuthProvider
export async function fetchFullUser(email) {
  const { data: u, error: uErr } = await supabase
    .from('users')
    .select('id, email, name, role, is_approved')
    .eq('email', email)
    .limit(1);

  if (uErr) {
    console.error("Error fetching full user data:", uErr);
    return null; // Return null on error
  }

  if (!u || u.length === 0) {
    console.warn("User not found in 'users' table:", email);
    return null; // Return null if user not found
  }

  // Assuming the first result is the correct user if limit(1) is used
  const user = u[0];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: [user.role],
    isApproved: user.is_approved,
  };
}

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
      const fulluser = await fetchFullUser(profile.getEmail());

      if (!fulluser) {
        throw new Error('User not found in database');
      }

    // 2) store the roles array and approval status you just got
      localStorage.setItem("userRoles", JSON.stringify(fulluser.roles));
      localStorage.setItem("isApproved", JSON.stringify(fulluser.isApproved));

    // 3) set React state
      setUser({
        ...fulluser,
        loginMethod: "google"
      });
      
      // // 導向到首頁
      // navigate("/");
    } catch (err) {
      console.error("Error signing in with Google:", err);
  
      // 1) stop showing the loading screen
      setLoading(false);
  
      // 2) clear out any partial user state
      setUser(null);
  
      // 3) redirect to the login page
      navigate('/login', { replace: true });
  
      // and importantly, DON'T re-throw
      return;
    }
  }, [navigate]);

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
        console.warn('Google Auth initialization failed:', error);
        debugLog('Google Auth initialization failed, but app will continue');
        
        // Don't set a global error for Google auth failures
        // This allows the app to work even if Google auth is not configured
        // Don't navigate to login here as it might interfere with normal auth flow
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
          // Clear potentially corrupted localStorage data
          localStorage.removeItem("userRoles");
          localStorage.removeItem("loginMethod");
          localStorage.removeItem("isApproved");
          navigate('/login'); // Explicitly navigate to login on timeout
        }, 10000); // 10 second timeout (increased from 5)
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Clear timeout since we got a response
        clearTimeout(timeoutId);
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          // If there's a session error, it likely means no valid session, redirect to login
          setUser(null);
          setError(`Auth error: ${sessionError.message}`);
          setLoading(false);
          navigate('/login');
          return;
        }

        debugLog('Current session:', session);

        if (session?.user) {
          debugLog('User found in session:', session.user);
          
          try {
            // Attempt to get roles and approval status from localStorage
            let userRoles, isApproved;
            
            try {
              userRoles = JSON.parse(localStorage.getItem("userRoles") || '["user"]');
              const isApprovedStr = localStorage.getItem("isApproved");
              isApproved = isApprovedStr ? JSON.parse(isApprovedStr) : undefined;
            } catch (parseError) {
              console.warn("Error parsing localStorage data, using defaults:", parseError);
              userRoles = ["user"];
              isApproved = undefined;
            }
            
            // Basic check: If essential data from localStorage is missing or invalid after finding a session user, redirect.
            // This might indicate a corrupted state or a user deleted from the 'users' table while the session was active.
            if (!userRoles || userRoles.length === 0 || isApproved === undefined) {
               console.warn("Essential user data missing from localStorage after session found. Fetching fresh data...");
               
               // Try to fetch fresh user data
               try {
                 const fullUser = await fetchFullUser(session.user.email);
                 if (fullUser) {
                   localStorage.setItem("userRoles", JSON.stringify(fullUser.roles));
                   localStorage.setItem("isApproved", JSON.stringify(fullUser.isApproved));
                   
                   setUser({
                     id: session.user.id,
                     email: session.user.email,
                     roles: fullUser.roles,
                     isApproved: fullUser.isApproved,
                     loginMethod: localStorage.getItem("loginMethod") || "email"
                   });
                   setLoading(false);
                   return;
                 }
               } catch (fetchError) {
                 console.error("Error fetching fresh user data:", fetchError);
               }
               
               // If we can't fetch fresh data, redirect to login
               setUser(null);
               setLoading(false);
               navigate('/login');
               return;
            }

            setUser({
              id: session.user.id,
              email: session.user.email,
              roles: userRoles,
              isApproved: isApproved,
              loginMethod: localStorage.getItem("loginMethod") || "email"
            });
          } catch (error) {
            console.error("Error processing user session:", error);
            setUser(null);
            setLoading(false);
            navigate('/login');
            return;
          }
        } else {
          debugLog('No user session found, redirecting to login');
          setUser(null);
          setLoading(false);
          navigate('/login'); // Explicitly navigate to login if no session
        }
        
        // Ensure loading is set to false in all cases
        setLoading(false);
        
        // Ensure loading is set to false in all cases
        setLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setError(`Auth error: ${error.message}`);
        setLoading(false);
        navigate('/login'); // Explicitly navigate to login on initialization error
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog('Auth state changed:', { event, session });
      
      if (event === 'SIGNED_IN' && session?.user) {
        debugLog('User signed in:', session.user);
        
        // Attempt to get roles and approval status from localStorage
        const userRoles = JSON.parse(localStorage.getItem("userRoles") || '["user"]');
        const isApprovedStr = localStorage.getItem("isApproved");
        const isApproved = isApprovedStr ? JSON.parse(isApprovedStr) : undefined;

        // Basic check: If essential data from localStorage is missing or invalid after sign-in, redirect.
        if (!userRoles || userRoles.length === 0 || isApproved === undefined) {
           console.warn("Essential user data missing from localStorage after SIGNED_IN event. Fetching fresh data...");
           
           // Try to fetch fresh user data
           try {
             const fullUser = await fetchFullUser(session.user.email);
             if (fullUser) {
               localStorage.setItem("userRoles", JSON.stringify(fullUser.roles));
               localStorage.setItem("isApproved", JSON.stringify(fullUser.isApproved));
               
               setUser({
                 id: session.user.id,
                 email: session.user.email,
                 name: session.user.name,
                 roles: fullUser.roles,
                 isApproved: fullUser.isApproved,
                 loginMethod: localStorage.getItem("loginMethod") || "email"
               });
               return;
             }
           } catch (fetchError) {
             console.error("Error fetching fresh user data:", fetchError);
           }
           
           // If we can't fetch fresh data, redirect to login
           setUser(null);
           navigate('/login');
           return;
        }

        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          roles: userRoles,
          isApproved: isApproved,
          loginMethod: localStorage.getItem("loginMethod") || "email"
        });
        // // 導向到首頁
        // navigate("/");
      } else if (event === 'SIGNED_OUT') {
        debugLog('User signed out');
        setUser(null);
        localStorage.removeItem("userRoles");
        localStorage.removeItem("loginMethod");
        localStorage.removeItem("isApproved");
        navigate('/login');
      } else if (session?.user && !session.user.email) {
         // Handle cases where a session user exists but email is missing (unexpected)
         console.warn("Session user found but email is missing. Redirecting to login.");
         setUser(null);
         navigate('/login');
      }
       // Add a fallback for any other unexpected state change where user is null but not explicitly signed out
      else if (!session?.user && event !== 'SIGNED_OUT' && !loading) {
         console.warn(`Auth state changed to null user with event ${event}. Redirecting to login.`);
         setUser(null);
         navigate('/login');
      }
    });

    return () => {
      debugLog('Cleaning up auth listener');
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [navigate]);

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
      localStorage.removeItem("isApproved");
      
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) || false;
  }, [user]);

  // Retry function for auth initialization
  const retryAuth = useCallback(() => {
    setLoading(true);
    setError(null);
    // Clear potentially corrupted data
    localStorage.removeItem("userRoles");
    localStorage.removeItem("loginMethod");
    localStorage.removeItem("isApproved");
    // Reload the page to restart auth process
    window.location.reload();
  }, []);

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        isAuthenticated: !!user,
        loading,
        error,
        googleAuth,
        retryAuth,
        hasRole
      }}
    >
      {loading || error ? (
        <LoadingScreen 
          error={error} 
          onRetry={retryAuth}
        />
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