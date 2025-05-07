import React, { useState } from "react";
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Typography, 
  Box, 
  Menu,
  MenuItem,
  ListItemButton,
  IconButton,
  Tooltip
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

// Icons
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SecurityIcon from "@mui/icons-material/Security";
import LogoutIcon from "@mui/icons-material/Logout";
import { Assignment as AssignmentIcon, Map as MapIcon } from '@mui/icons-material';


// 自定義樣式元件
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: theme.palette.common.white,
    borderRight: 'none',
  },
}));

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  
  // User menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Handle menu open/close
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Check if current page
  const isActivePage = (path) => {
    return location.pathname === path;
  };

  // Menu items
  const menuItems = [
    {
      text: '客戶管理',
      icon: <PeopleIcon />,
      path: '/customers',
    },
    {
      text: '工程管理',
      icon: <AssignmentIcon />,
      path: '/orders',
    },
    {
      text: '庫存管理',
      icon: <InventoryIcon />,
      path: '/inventory',
    },
    {
      text: '行事曆',
      icon: <CalendarMonthIcon />,
      path: '/calendar',
    },
    {
      text: 'Google日曆',
      icon: <CalendarMonthIcon />,
      path: '/apicalendar',
    },
    {
      text: '地圖',
      icon: <MapIcon />,
      path: '/map',
    }
  ];

  // Admin menu items
  const adminMenuItems = [
    {
      text: '用戶管理',
      icon: <PeopleIcon />,
      path: '/user-management',
    },
    {
      text: '角色管理',
      icon: <AdminPanelSettingsIcon />,
      path: '/role-management',
    }
  ];

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
    >
      {/* 使用者資料區 - 用白色文字 */}
      <Box sx={{ 
        p: 3, 
        display: "flex", 
        alignItems: "center",
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Avatar 
          sx={{ 
            bgcolor: 'common.white', 
            color: 'primary.dark',
            width: 42,
            height: 42
          }}
        >
          {user?.email?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ ml: 2, overflow: "hidden" }}>
          <Typography variant="subtitle1" noWrap sx={{ color: 'common.white' }}>
            {user?.email}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {user?.roles?.[0] || 'User'}
          </Typography>
        </Box>
        <Tooltip title="帳號設定">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 1 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <SecurityIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider />
      
      {/* 導航鏈接 */}
      <List component="nav" sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={isActivePage(item.path)}
              sx={{ 
                borderRadius: 1,
                mb: 1,
                color: 'common.white',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'common.white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  color: isActivePage(item.path) ? 'primary.main' : 'inherit',
                  fontWeight: isActivePage(item.path) ? 'medium' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ mx: 2 }} />
      
      {/* 管理員選項 */}
      {hasRole('admin') && (
        <List component="nav" sx={{ p: 1 }}>
          {adminMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={isActivePage(item.path)}
                sx={{ 
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    color: isActivePage(item.path) ? 'primary.main' : 'inherit',
                    fontWeight: isActivePage(item.path) ? 'medium' : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      
      {/* 登出按鈕 */}
      <List component="nav" sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              borderRadius: 1,
              color: 'error.main',
            }}
          >
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="登出" />
          </ListItemButton>
        </ListItem>
      </List>
      
      {/* 用戶選單 */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          登出
        </MenuItem>
      </Menu>
    </StyledDrawer>
  );
};

export default Sidebar;