import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Paper
} from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError("");
      console.log("Login: Starting Google login process");
  
      // Load gapi script if not already loaded
      if (!window.gapi) {
        console.log("Login: Loading gapi script");
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/platform.js';
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
        console.log("Login: gapi script loaded");
      }
  
      // Initialize gapi auth2
      if (!window.gapi.auth2) {
        console.log("Login: Initializing auth2");
        await new Promise((resolve, reject) => {
          window.gapi.load('auth2', {
            callback: resolve,
            onerror: reject,
            timeout: 10000,
            ontimeout: reject
          });
        });
      }
  
      // Get auth instance or create one
      let authInstance;
      try {
        authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance) {
          console.log("Login: Creating auth instance");
          authInstance = await window.gapi.auth2.init({
            client_id: "516194420420-7oatcqmd1kc9h37nk4m2pe08aqfmd180.apps.googleusercontent.com",
            scope: "profile email https://www.googleapis.com/auth/calendar.readonly"
          });
        }
      } catch (err) {
        console.log("Login: Creating new auth instance");
        authInstance = await window.gapi.auth2.init({
          client_id: "516194420420-7oatcqmd1kc9h37nk4m2pe08aqfmd180.apps.googleusercontent.com",
          scope: "profile email https://www.googleapis.com/auth/calendar.readonly"
        });
      }
  
      // Sign in
      console.log("Login: Starting sign in");
      const googleUser = await authInstance.signIn({
        prompt: 'select_account'
      });
  
      console.log("Login: Google sign-in successful");
  
      // Get user profile and ID token
      const profile = googleUser.getBasicProfile();
      const id_token = googleUser.getAuthResponse().id_token;
  
      console.log("Login: Using Supabase to sign in with ID token");
  
      // Sign in with Supabase
      const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      });
  
      if (supabaseError) throw supabaseError;
  
      // 🔥 Add or Update User in Supabase Database
      const email = profile.getEmail();
      const name = profile.getName();
      const google_id = profile.getId();
      const picture_url = profile.getImageUrl();
  
      // Check if the user already exists
      let existingUser = null;
      let fetchError = null;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, is_approved, role')
          .eq('email', email)
          .single();
        existingUser = data;
        fetchError = error;
      } catch (err) {
        // Handle the case where .single() returns no rows (error with code PGRST116)
        console.warn("User not found in database on login attempt:", err.message);
        // existingUser remains null, fetchError might contain details but we treat it as not found
      }
  
  
      if (!existingUser) {
        console.log("User not found in database, creating a new one...");
        // Add the new user to Supabase
        const isAdmin = email === "jongshingpest@gmail.com";
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            email: email,
            name: name,
            google_id: google_id,
            picture_url: picture_url,
            role: isAdmin ? 'admin' : 'user',
            is_approved: isAdmin ? true : false
          })
          .select()
          .single();

        if (insertError) throw insertError;
        console.log("User successfully added to the database");
        
        // Store user info and redirect
        localStorage.setItem("loginMethod", "google");
        localStorage.setItem("userRoles", JSON.stringify([isAdmin ? 'admin' : 'user']));
        if (isAdmin) {
          navigate("/");
        } else {
          navigate("/pending-approval");
        }
      } else {
        console.log("User already exists in the database");
        
        // Redirect logic for existing user
        if (existingUser.role === 'admin') {
          // Admin: always redirect to customers page
          localStorage.setItem("loginMethod", "google");
          localStorage.setItem("userRoles", JSON.stringify([existingUser.role]));
          localStorage.setItem("isApproved", JSON.stringify(existingUser.is_approved));
          navigate("/");
        } else if (!existingUser.is_approved) {
          // Not approved: redirect to pending
          localStorage.setItem("loginMethod", "google");
          localStorage.setItem("userRoles", JSON.stringify([existingUser.role]));
          localStorage.setItem("isApproved", JSON.stringify(existingUser.is_approved));
          navigate("/pending-approval");
        } else {
          // Approved user: redirect to customers
          localStorage.setItem("loginMethod", "google");
          localStorage.setItem("userRoles", JSON.stringify([existingUser.role]));
          localStorage.setItem("isApproved", JSON.stringify(existingUser.is_approved));
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login: Error during Google login:", error);
      setError(error.message || "Google 登入失敗");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 200,
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        zIndex: 1200,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 'sm',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 2,
        }}
      >
        <Box
          sx={{
            p: 4,
            
            textAlign: 'center',
            background: 'transparent',
          }}
        >
          <Typography 
            component="h1" 
            variant="h3" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              color: 'primary.main',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            中星客戶管理系統
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              mb: 1,
              fontWeight: 'medium',
            }}
          >
            歡迎使用
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              opacity: 0.8,
            }}
          >
            請使用 Google 帳號登入系統
          </Typography>
        </Box>

        <Card
          elevation={6}
          sx={{
            width: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ 
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              使用 Google 帳號登入
            </Button>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                opacity: 0.7,
                textAlign: 'center',
                mt: 2,
              }}
            >
              登入即表示您同意遵守系統使用規範
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;