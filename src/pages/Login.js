import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  TextField,
  Snackbar,
  Alert,
  Link,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const { login, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const { email, password, confirmPassword } = formData;
      
      if (!email || !password) {
        throw new Error("請填入所有必填欄位");
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("密碼與確認密碼不符");
        }
        await signUp(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      setError(error.message);
      setOpenSnackbar(true);
    }
  };

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
            client_id: "334720277647-7fn06j5okaepfisp3qq2qhlahkiev8uo.apps.googleusercontent.com",
            scope: "profile email https://www.googleapis.com/auth/calendar.readonly"
          });
        }
      } catch (err) {
        console.log("Login: Creating new auth instance");
        authInstance = await window.gapi.auth2.init({
          client_id: "334720277647-7fn06j5okaepfisp3qq2qhlahkiev8uo.apps.googleusercontent.com",
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
      // const profile = googleUser.getBasicProfile();
      const id_token = googleUser.getAuthResponse().id_token;
      
      console.log("Login: Using Supabase to sign in with ID token");
      
      // Sign in with Supabase
      const { data,error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      });
      
      if (supabaseError) throw supabaseError;
      
      console.log("Login: Supabase authentication successful");
      
      // Store user info and redirect
      localStorage.setItem("loginMethod", "google");
      localStorage.setItem("userRoles", JSON.stringify(["user"]));
      
      // Navigate to protected route
      navigate("/customers");
      
    } catch (error) {
      console.error("Login: Error during Google login:", error);
      setError(error.message || "Google 登入失敗");
      setOpenSnackbar(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
              {isSignUp ? "註冊帳號" : "登入系統"}
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="電子郵件"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="密碼"
                type="password"
                id="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
              />
              
              {isSignUp && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="確認密碼"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  variant="outlined"
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {isSignUp ? "註冊" : "登入"}
              </Button>

              <Divider sx={{ my: 2 }}>或</Divider>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ mb: 2 }}
              >
                使用 Google 帳號{isSignUp ? "註冊" : "登入"}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "已有帳號？登入" : "沒有帳號？註冊"}
                </Link>
              </Box>
            </Box>
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