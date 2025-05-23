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
  Snackbar,
  Divider
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const UserApprovals = () => {
  const { user } = useAuth();
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch both approved and pending users
  const fetchUsers = async () => {
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        supabase.from('users').select('*').eq('is_approved', true),
        supabase.from('users').select('*').eq('is_approved', false)
      ]);
      if (approvedRes.error) throw approvedRes.error;
      if (pendingRes.error) throw pendingRes.error;
      setApprovedUsers(approvedRes.data || []);
      setPendingUsers(pendingRes.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('無法載入用戶列表');
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      await fetchUsers();
    } catch (err) {
      console.error('Error approving user:', err);
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
      await fetchUsers();
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError('拒絕用戶時發生錯誤');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (userId) => {
    const ok = window.confirm('確定要刪除此已審核用戶嗎？此操作不可復原。');
    if (!ok) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      if (error) throw error;

      setSuccess('已成功刪除用戶');
      setOpenSnackbar(true);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('刪除用戶時發生錯誤');
      setOpenSnackbar(true);
    }
  };

  if (!user?.roles.includes('admin')) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          您沒有權限訪問此頁面
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'background.paper',
          padding: 4,
          borderRadius: 3,
          mb: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            用戶審核管理
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {/* Approved users section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            已審核用戶
          </Typography>
          <Box sx={{ maxHeight: 350, overflow: 'auto', background: 'transparent', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, mb: 2, background: 'background.paper' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>姓名</TableCell>
                    <TableCell>電子郵件</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvedUsers.map(u => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(u.id)}
                        >
                          刪除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {approvedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        目前沒有已審核的用戶
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* Pending users section */}
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            待審核用戶
          </Typography>
          <Box sx={{ maxHeight: 350, overflow: 'auto', background: 'transparent', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, background: 'background.paper' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>姓名</TableCell>
                    <TableCell>電子郵件</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUsers.map(u => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          onClick={() => handleApprove(u.id)}
                          sx={{ mr: 1 }}
                        >
                          通過
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleReject(u.id)}
                        >
                          拒絕
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        目前沒有待審核的用戶
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>

      {/* Feedback Snackbar */}
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
