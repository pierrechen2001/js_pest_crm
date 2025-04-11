import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // 主色調
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057', // 次要色調
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // 按鈕文字不自動大寫
    },
  },
  shape: {
    borderRadius: 8, // 全局圓角設定
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 8px -1px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

export default theme;