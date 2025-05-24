import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  if (!user) {
    return <CircularProgress />;
  }

  const handleSave = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);
      if (error) throw error;
      setSuccess('個人資訊已更新');
      setOpenSnackbar(true);
    } catch (err) {
      setError('更新失敗: ' + err.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch (err) {
      setError('登出失敗: ' + err.message);
      setOpenSnackbar(true);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          個人資料
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="電子郵件"
            value={user.email}
            fullWidth
            disabled
          />
          <TextField
            label="姓名/用戶名稱"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !name}
          >
            {loading ? '儲存中...' : '儲存變更'}
          </Button>
        </Box>
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            disabled={logoutLoading}
            size="large"
          >
            {logoutLoading ? '登出中...' : '登出'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile; 