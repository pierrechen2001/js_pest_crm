import React from 'react';
import { Box } from '@mui/material';
import { APP_VERSION } from '../config/appVersion';

const VersionBadge = () => (
  <Box
    component="span"
    aria-label={`系統版本 ${APP_VERSION}`}
    sx={{
      position: 'fixed',
      right: { xs: 8, sm: 12 },
      bottom: { xs: 6, sm: 8 },
      zIndex: 1400,
      px: 0.8,
      py: 0.25,
      borderRadius: 1,
      bgcolor: 'rgba(255, 255, 255, 0.78)',
      color: 'text.secondary',
      fontSize: '0.68rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'none',
      userSelect: 'none',
    }}
  >
    版本 {APP_VERSION}
  </Box>
);

export default VersionBadge;
