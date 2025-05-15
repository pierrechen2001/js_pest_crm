import React, { useState, useEffect} from "react";
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// 自定義樣式元件
const StyledDrawer = styled(Drawer)(({ theme, collapsed }) => ({
  width: collapsed ? 64 : 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: collapsed ? 64 : 240,
    boxSizing: 'border-box',
    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
    color: theme.palette.common.white,
    borderRight: 'none',
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  
  // User menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Check if user is approved or an admin
  const isUserApproved = user?.isApproved === true || user?.roles?.includes('admin');
  
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

  // Toggle sidebar collapse
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
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
    },
    {
      text: '用戶審核',
      icon: <SecurityIcon />,
      path: '/user-approvals',
    }
  ];
  
  useEffect(() => {
    if (user) {
      console.log('Current user roles:', user.roles[0]);
      console.log('User approval status:', user.isApproved);
    }
  }, [user]);

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
      collapsed={collapsed}
    >
      {/* 使用者資料區 - 用白色文字 */}
      <Box sx={{ 
        p: collapsed ? 1 : 3, 
        display: "flex", 
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {collapsed ? (
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
        ) : (
          <>
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
                {!isUserApproved && <span style={{ color: '#ff9800', marginLeft: '5px' }}>(待審核)</span>}
              </Typography>
            </Box>
            {isUserApproved && (
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
            )}
          </>
        )}
      </Box>
      
      <Divider />
      
      {/* 收合按鈕 - 只有已審核用戶可見 */}
      {isUserApproved && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: collapsed ? 'center' : 'flex-end',
          p: collapsed ? 1 : 0,
          position: 'relative',
          height: collapsed ? 'auto' : 0
        }}>
          <IconButton 
            onClick={toggleCollapsed} 
            sx={{ 
              color: 'white',
              bgcolor: collapsed ? 'transparent' : 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: 30,
              height: 30,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
              position: collapsed ? 'static' : 'absolute',
              right: collapsed ? 'auto' : 12,
              top: collapsed ? 'auto' : -15,
              zIndex: 1200,
              boxShadow: collapsed ? 'none' : '0 2px 5px rgba(0,0,0,0.2)',
            }}
            size="small"
            aria-label={collapsed ? "展開側邊欄" : "收合側邊欄"}
          >
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}
      

      {/* 導航鏈接 - 只有已審核用戶可見 */}
      {isUserApproved && (
        <>
          <List component="nav" sx={{ p: collapsed ? 1 : 2 }}>
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
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    minHeight: 48,
                    px: collapsed ? 1 : 3,
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
                  <Tooltip title={collapsed ? item.text : ""} placement="right">
                    <ListItemIcon sx={{ 
                      color: 'common.white', 
                      minWidth: collapsed ? 0 : 36,
                      mr: collapsed ? 0 : 3,
                      justifyContent: 'center',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                  </Tooltip>
                  {!collapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        color: isActivePage(item.path) ? 'primary.dark' : 'inherit',
                        fontWeight: isActivePage(item.path) ? 'medium' : 'normal',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ mx: 2 }} />
        </>
      )}
      
      {/* 管理員選項 - 只有管理員角色可見 */}
      {isUserApproved && user?.roles?.includes('admin') && (
        <List component="nav" sx={{ p: collapsed ? 1 : 2 }}>
          {adminMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={isActivePage(item.path)}
                sx={{ 
                  borderRadius: 1,
                  mb: 0.5,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  minHeight: 48,
                  px: collapsed ? 1 : 3,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  }
                }}
              >
                <Tooltip title={collapsed ? item.text : ""} placement="right">
                  <ListItemIcon sx={{ 
                    minWidth: collapsed ? 0 : 36,
                    mr: collapsed ? 0 : 3,
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
                {!collapsed && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      color: isActivePage(item.path) ? 'primary.dark' : 'inherit',
                      fontWeight: isActivePage(item.path) ? 'medium' : 'normal',
                    }}
                  >
                    <Tooltip title={collapsed ? item.text : ""} placement="right">
                      <ListItemIcon sx={{ 
                        minWidth: collapsed ? 0 : 36,
                        mr: collapsed ? 0 : 3,
                        justifyContent: 'center',
                      }}>
                        {item.icon}
                      </ListItemIcon>
                    </Tooltip>
                    {!collapsed && (
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          color: isActivePage(item.path) ? 'primary.main' : 'inherit',
                          fontWeight: isActivePage(item.path) ? 'medium' : 'normal',
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}
      
      {/* 未審核用戶提示 */}
      {!isUserApproved && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          mt: 2
        }}>
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              mb: 1
            }}
          >
            您的帳號正在等待審核
          </Typography>
          <Typography 
            variant="caption" 
            align="center" 
            sx={{ 
              color: 'rgba(255,255,255,0.5)',
              mb: 2
            }}
          >
            審核通過後即可使用系統功能
          </Typography>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      
      {/* 登出按鈕 - 所有用戶可見 */}
      <List component="nav" sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              borderRadius: 1,
              justifyContent: collapsed ? 'center' : 'flex-start',
              minHeight: 48,
              px: collapsed ? 1 : 3,
            }}
          >
            <Tooltip title={collapsed ? "登出" : ""} placement="right">
              <ListItemIcon sx={{ 
                color: 'common.white',
                minWidth: collapsed ? 0 : 36,
                mr: collapsed ? 0 : 3,
                justifyContent: 'center',
              }}>
                <LogoutIcon />
              </ListItemIcon>
            </Tooltip>
            {!collapsed && (
              <ListItemText 
                primary="登出"
                primaryTypographyProps={{
                  color: 'inherit',
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>
      
      {/* User menu */}
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