import React from "react";
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
  ListItemButton
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

// Icons
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Assignment as AssignmentIcon, Map as MapIcon } from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Check if current page
  const isActivePage = (path) => {
    return location.pathname === path;
  };

  // Menu items with simple structure
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
      text: '專案管理',
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
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      {/* 使用者資料區 */}
      <Box sx={{ 
        p: 2, 
        display: "flex", 
        alignItems: "center",
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.email?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ ml: 2, overflow: "hidden" }}>
          <Typography variant="subtitle1" noWrap>
            {user?.email}
          </Typography>
          <Typography variant="body2" noWrap color="textSecondary">
            {user?.roles?.[0] || 'User'}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* 主導航 */}
      <List sx={{ p: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link}
              to={item.path}
              selected={isActivePage(item.path)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* 管理員選項 */}
      {hasRole('admin') && (
        <>
          <List sx={{ p: 1 }}>
            <Typography 
              variant="overline" 
              display="block" 
              sx={{ px: 1, pt: 1, opacity: 0.7 }}
            >
              管理員選單
            </Typography>
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  component={Link}
                  to={item.path}
                  selected={isActivePage(item.path)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}
      
      {/* 登出按鈕 */}
      <Box sx={{ flexGrow: 1 }} />
      <List sx={{ p: 1 }}>
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
    </Drawer>
  );
};

export default Sidebar;