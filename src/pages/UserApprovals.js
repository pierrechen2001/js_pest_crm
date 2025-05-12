import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const UserApprovals = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError('無法載入待審核用戶');
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;

      setSuccess('用戶已成功審核通過');
      setOpenSnackbar(true);
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error('Error approving user:', error);
      setError('審核用戶時發生錯誤');
      setOpenSnackbar(true);
    }
  };

  const handleReject = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setSuccess('用戶已成功拒絕');
      setOpenSnackbar(true);
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('拒絕用戶時發生錯誤');
      setOpenSnackbar(true);
    }
  };

  if (!user || !user.roles.includes('admin')) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          您沒有權限訪問此頁面
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          用戶審核管理
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>姓名</TableCell>
                <TableCell>電子郵件</TableCell>
                <TableCell>註冊時間</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((pendingUser) => (
                <TableRow key={pendingUser.id}>
                  <TableCell>{pendingUser.name}</TableCell>
                  <TableCell>{pendingUser.email}</TableCell>
                  <TableCell>
                    {new Date(pendingUser.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApprove(pendingUser.id)}
                      sx={{ mr: 1 }}
                    >
                      通過
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(pendingUser.id)}
                    >
                      拒絕
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pendingUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    目前沒有待審核的用戶
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
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

export default UserApprovals; 