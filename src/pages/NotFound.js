import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
    >
      <Typography variant="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="textSecondary" gutterBottom>
        找不到頁面
      </Typography>
      <Button 
        component={Link} 
        to="/customers" 
        variant="contained" 
        color="primary"
        sx={{ mt: 2 }}
      >
        返回首頁
      </Button>
    </Box>
  );
};

export default NotFound; 