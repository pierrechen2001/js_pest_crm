import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField,
  Snackbar,
  Alert,
  Link
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // 處理登入
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("請填入帳號和密碼");
      setOpenSnackbar(true);
      return;
    }

    // 這裡只是簡單模擬，實際應用需連接到後端驗證
    if (email === "admin@example.com") {
      // 管理員帳號
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "系統管理員");
      localStorage.setItem("userRoles", JSON.stringify(["admin"]));
      
      // 呼叫父元件的登入回調
      if (onLogin) onLogin();
      
      navigate("/customers");
    } else if (email === "user@example.com") {
      // 一般使用者
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "一般使用者");
      localStorage.setItem("userRoles", JSON.stringify(["user"]));
      
      // 呼叫父元件的登入回調
      if (onLogin) onLogin();
      
      navigate("/customers");
    } else {
      // 登入失敗
      setError("無效的帳號或密碼");
      setOpenSnackbar(true);
    }
  };

  // 處理忘記密碼
  const handleForgotPassword = () => {
    // 在實際應用中，這裡應該導向密碼重設頁面
    alert("密碼重設功能尚未實作");
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}
        >
          庫存管理系統
        </Typography>
        
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
            登入系統
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="電子郵件"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密碼"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Link 
                component="button" 
                variant="body2" 
                onClick={handleForgotPassword}
                underline="hover"
              >
                忘記密碼？
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1 }}
            >
              登入
            </Button>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            管理員帳號：admin@example.com（任意密碼）
          </Typography>
          <Typography variant="body2" color="text.secondary">
            一般使用者：user@example.com（任意密碼）
          </Typography>
        </Box>
      </Box>
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;