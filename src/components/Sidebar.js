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
  IconButton, 
  Menu,
  MenuItem,
  Tooltip,
  ListItemButton
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SecurityIcon from "@mui/icons-material/Security";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 從 localStorage 獲取用戶信息
  const userEmail = localStorage.getItem("userEmail") || "使用者";
  const userName = localStorage.getItem("userName") || "用戶";
  const userRoles = localStorage.getItem("userRoles") 
    ? JSON.parse(localStorage.getItem("userRoles")) 
    : ["user"];
  
  // 檢查是否是管理員
  const isAdmin = userRoles.includes("admin");
  
  // 用戶選單狀態
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // 處理選單開關
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // 處理登出
  const handleLogout = () => {
    handleClose();
    if (onLogout) onLogout();
    navigate("/login");
  };

  // 檢查是否為當前頁面
  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      {/* 用戶資料區 */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Tooltip title="帳號設定">
          <IconButton onClick={handleClick} size="small">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Box sx={{ ml: 2, overflow: "hidden" }}>
          <Typography variant="subtitle1" noWrap>{userName}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {userEmail}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* 導航鏈接 */}
      <List component="nav" sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/customers"
            selected={isActivePage("/customers")}
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
              <PeopleIcon color={isActivePage("/customers") ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="客戶管理" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/orders"
            selected={isActivePage("/orders")}
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
              <ShoppingCartIcon color={isActivePage("/orders") ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="訂單管理" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/inventory"
            selected={isActivePage("/inventory")}
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
              <InventoryIcon color={isActivePage("/inventory") ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="庫存管理" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/calendar"
            selected={isActivePage("/calendar")}
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
              <CalendarMonthIcon color={isActivePage("/calendar") ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="行事曆" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Divider sx={{ mx: 2 }} />
      
      {/* 管理員選項 */}
      <List component="nav" sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/user-management"
            selected={isActivePage("/user-management")}
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
              <AdminPanelSettingsIcon color={isActivePage("/user-management") ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="使用者管理" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/role-management"
            selected={isActivePage("/role-management")}
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
              <SecurityIcon color={isActivePage("/role-management") ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="角色權限管理" />
          </ListItemButton>
        </ListItem>
      </List>
      
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
    </Drawer>
  );
};

export default Sidebar;