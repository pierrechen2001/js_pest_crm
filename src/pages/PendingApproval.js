import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const { user } = useAuth();

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
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            等待審核
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            親愛的 {user?.name || '用戶'}，
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            您的帳號正在等待管理員審核。審核通過後，您將可以完整使用系統功能。
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            請耐心等待，我們會盡快處理您的申請。
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PendingApproval; 