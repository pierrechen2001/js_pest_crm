import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button, LinearProgress } from '@mui/material';

const LoadingScreen = ({ error = null, onRetry = null }) => {
  const [loadingTime, setLoadingTime] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    // Show retry button after 8 seconds
    const retryTimer = setTimeout(() => {
      setShowRetryButton(true);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(retryTimer);
    };
  }, []);

  const handleClearData = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          padding: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          載入時發生錯誤
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {onRetry && (
            <Button 
              variant="contained" 
              onClick={onRetry}
              color="primary"
            >
              重試
            </Button>
          )}
          <Button 
            variant="outlined" 
            onClick={handleClearData}
            color="secondary"
          >
            清除數據並重新載入
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: 3
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        正在載入 JS Pest CRM...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        載入時間: {loadingTime} 秒
      </Typography>
      
      {loadingTime > 5 && (
        <Box sx={{ width: '100%', maxWidth: 400, mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            正在初始化認證系統...
          </Typography>
        </Box>
      )}
      
      {showRetryButton && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            載入時間較長，可能是網路問題或瀏覽器快取問題
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              size="small"
            >
              重新載入頁面
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleClearData}
              size="small"
              color="secondary"
            >
              清除快取
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LoadingScreen;