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
  Divider
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
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, email, is_approved, role')
        .eq('email', email)
        .single();

      if (existingUser) {
        try {
          // Check if the user is the speciific admin email
          const role = (existingUser.email === "jongshingpest@gmail.com") ? "admin" : "user";
          if (existingUser.email === "jongshingpest@gmail.com"){
            console.log("is jonghsingpest")
          }else{
            console.log("is not pest")
          }
          // Update the user's role in the database
          const { error: updateError } = await supabase
            .from('users')
            .update({ role })
            .eq('email', existingUser.email);
      
          if (updateError) {
            console.error("Error updating user role:", updateError.message);
          } else {
            console.log(`User role updated to ${role} for ${existingUser.email}`);
          }
        } catch (err) {
          console.error("Failed to update role:", err.message);
        }
      } else {
        console.log("User not found.");
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
          navigate("/homepage");
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
          navigate("/customers");
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
          navigate("/customers");
        }
      }
    } catch (error) {
      console.error("Login: Error during Google login:", error);
      setError(error.message || "Google 登入失敗");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}
        >
          管理系統
        </Typography>
        <Card
          elevation={6}
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
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
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
              Google 登入
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ mb: 2 }}
            >
              使用 Google 帳號登入
            </Button>
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