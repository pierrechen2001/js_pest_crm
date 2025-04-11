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
  Avatar,
  Fade
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
      <Fade in={true} timeout={800}>
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={handleForgotPassword}
                    underline="hover"
                    sx={{ color: 'primary.main' }}
                  >
                    忘記密碼？
                  </Link>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    py: 1.2,
                    fontSize: '1rem',
                    fontWeight: 'medium',
                  }}
                >
                  登入
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              管理員帳號：admin@example.com（任意密碼）
            </Typography>
            <Typography variant="body2" color="text.secondary">
              一般使用者：user@example.com（任意密碼）
            </Typography>
          </Box>
        </Box>
      </Fade>
      
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