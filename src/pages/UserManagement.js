import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Tooltip,
  Fade,
  Grow,
  Stack,
  Alert,
  useTheme,
  alpha
} from "@mui/material";

// 圖標
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
// import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BlockIcon from "@mui/icons-material/Block";
import SaveIcon from "@mui/icons-material/Save";

import { Link as RouterLink } from "react-router-dom";

const UserManagement = () => {
  const theme = useTheme();
  
  // 使用者資料
  const [users, setUsers] = useState([
    {
      id: 1,
      email: "admin@example.com",
      name: "系統管理員",
      role: "管理員",
      status: "active",
      createdAt: "2024-01-01 00:00:00"
    },
    {
      id: 2,
      email: "user@example.com",
      name: "一般使用者",
      role: "一般使用者",
      status: "active",
      createdAt: "2024-01-02 00:00:00"
    },
    {
      id: 3,
      email: "readonly@example.com",
      name: "唯讀使用者",
      role: "唯讀使用者",
      status: "inactive",
      createdAt: "2024-01-03 00:00:00"
    },
    {
      id: 4,
      email: "sales@example.com",
      name: "銷售人員",
      role: "一般使用者",
      status: "active",
      createdAt: "2024-01-04 00:00:00"
    },
    {
      id: 5,
      email: "warehouse@example.com",
      name: "倉儲管理員",
      role: "一般使用者",
      status: "active",
      createdAt: "2024-01-05 00:00:00"
    }
  ]);

  // 角色資料
  const [roles] = useState([
    { id: 1, name: "管理員" },
    { id: 2, name: "一般使用者" },
    { id: 3, name: "唯讀使用者" }
  ]);
  

  // 狀態
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    status: "active"
  });
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 初始化操作
  useEffect(() => {
    // 此處可以添加API呼叫來獲取用戶資料
  }, []);

  // 過濾用戶
  const filteredUsers = users.filter(user => {
    // 搜尋條件
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 狀態過濾
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && user.status === "active") ||
      (statusFilter === "inactive" && user.status === "inactive");
    
    return matchesSearch && matchesStatus;
  });

  // 處理 Tab 變更
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 編輯使用者
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
      status: user.status
    });
    setOpenDialog(true);
  };

  // 新增使用者
  const handleAddUser = () => {
    setSelectedUser(null);
    setEditForm({
      name: "",
      email: "",
      role: "一般使用者",
      password: "",
      confirmPassword: "",
      status: "active"
    });
    setOpenDialog(true);
  };

  // 刪除使用者
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // 確認刪除
  const handleDeleteUser = () => {
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setDeleteDialogOpen(false);
  };

  // 儲存使用者
  const handleSaveUser = () => {
    // 新密碼驗證
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      alert("密碼與確認密碼不符");
      return;
    }

    if (selectedUser) {
      // 更新現有使用者
      setUsers(users.map(user => 
        user.id === selectedUser.id ? 
        { 
          ...user, 
          name: editForm.name, 
          email: editForm.email,
          role: editForm.role,
          status: editForm.status
        } : user
      ));
    } else {
      // 新增使用者
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setUsers([...users, newUser]);
    }
    setOpenDialog(false);
  };

  // 處理搜尋
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 重置過濾器
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // 判斷使用者是否在線上
  const isActive = (status) => status === "active";

  // 取得使用者的頭像
  const getUserAvatar = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // 取得角色色彩
  const getRoleColor = (role) => {
    switch (role) {
      case "管理員":
        return "error";
      case "一般使用者":
        return "primary";
      case "唯讀使用者":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            使用者管理
          </Typography>
          <Typography variant="body1" color="text.secondary">
            管理系統中的使用者及其權限
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              label="使用者管理" 
              sx={{ 
                fontWeight: tabValue === 0 ? 'bold' : 'normal',
                fontSize: '1rem'
              }}
            />
            <Tab 
              label="角色管理" 
              component={RouterLink} 
              to="/role-management" 
              sx={{ 
                textDecoration: 'none',
                fontSize: '1rem'
              }} 
            />
          </Tabs>
        </Box>

        <Card 
          elevation={0} 
          sx={{ 
            mb: 4, 
            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
              <TextField
                placeholder="搜尋使用者..."
                value={searchTerm}
                onChange={handleSearch}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ maxWidth: { sm: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>狀態</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="狀態"
                  >
                    <MenuItem value="all">所有狀態</MenuItem>
                    <MenuItem value="active">啟用</MenuItem>
                    <MenuItem value="inactive">停用</MenuItem>
                  </Select>
                </FormControl>
                
                <Tooltip title="重置過濾器">
                  <IconButton onClick={handleResetFilters} disabled={!searchTerm && statusFilter === "all"}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleAddUser}
                  sx={{ ml: { xs: 0, sm: 1 } }}
                >
                  新增使用者
                </Button>
              </Stack>
            </Stack>

            {filteredUsers.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  沒有符合條件的使用者資料
                </Typography>
              </Box>
            )}

            {filteredUsers.length > 0 && (
              <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>使用者</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>電子郵件</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>角色</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>狀態</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>建立時間</TableCell>
                      <TableCell width="15%" sx={{ fontWeight: 'bold' }}>動作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <Grow
                        in={true}
                        key={user.id}
                        timeout={300 + index * 50}
                      >
                        <TableRow 
                          hover
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  mr: 2, 
                                  bgcolor: isActive(user.status) ? 'primary.main' : 'grey.400',
                                  fontWeight: 'bold'
                                }}
                              >
                                {getUserAvatar(user.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{user.name}</Typography>
                                {user.id === 1 && (
                                  <Chip 
                                    label="系統管理員" 
                                    size="small" 
                                    color="warning" 
                                    sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role} 
                              size="small" 
                              color={getRoleColor(user.role)}
                              sx={{ fontWeight: '500' }}
                              icon={user.role === "管理員" ? <VerifiedUserIcon fontSize="small" /> : undefined}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={isActive(user.status) ? "啟用" : "停用"} 
                              size="small"
                              color={isActive(user.status) ? "success" : "default"}
                              icon={isActive(user.status) ? <VerifiedUserIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                            />
                          </TableCell>
                          <TableCell>{user.createdAt}</TableCell>
                          <TableCell>
                            <Tooltip title="查看詳情">
                              <IconButton size="small" color="info" sx={{ mr: 1 }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="編輯使用者">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditUser(user)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {user.id !== 1 && ( // 禁止刪除管理員
                              <Tooltip title="刪除使用者">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      </Grow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            顯示 {filteredUsers.length} 個使用者，共 {users.length} 個
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="small"
            onClick={() => {/* 此處可添加重新載入資料的邏輯 */}}
          >
            重新載入
          </Button>
        </Box>

        {/* 編輯使用者對話框 */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            elevation: 24,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1,
            typography: 'h6',
            fontWeight: 'bold'
          }}>
            {selectedUser ? "編輯使用者" : "新增使用者"}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="姓名"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="電子郵件"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>角色</InputLabel>
                  <Select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    label="角色"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="密碼設定" size="small" />
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="密碼"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  margin="normal"
                  helperText={selectedUser ? "留空表示不變更密碼" : ""}
                  required={!selectedUser}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="確認密碼"
                  type="password"
                  value={editForm.confirmPassword}
                  onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                  margin="normal"
                  required={!selectedUser}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="帳號狀態" size="small" />
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.background.default, 0.7)
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editForm.status === "active"}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          status: e.target.checked ? "active" : "inactive" 
                        })}
                        color="success"
                      />
                    }
                    label={
                      <Typography 
                        variant="body1"
                        color={editForm.status === "active" ? "success.main" : "text.secondary"}
                        fontWeight={editForm.status === "active" ? "medium" : "normal"}
                      >
                        {editForm.status === "active" ? "帳號已啟用" : "帳號已停用"}
                      </Typography>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {editForm.status === "active" 
                      ? "使用者可以登入系統並使用其權限範圍內的功能。" 
                      : "使用者將無法登入系統，但其資料會被保留。"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)} 
              color="inherit"
              variant="outlined"
            >
              取消
            </Button>
            <Button 
              onClick={handleSaveUser} 
              color="primary" 
              variant="contained"
              disabled={!editForm.name || !editForm.email || !editForm.role || 
                (!selectedUser && !editForm.password)}
              startIcon={<SaveIcon />}
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>

        {/* 刪除確認對話框 */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            elevation: 24,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle 
            sx={{ 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              fontWeight: 'bold'
            }}
          >
            確認刪除使用者?
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedUser && (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  此操作無法復原，請確認您的決定。
                </Alert>
                <Typography>
                  您確定要刪除使用者 "{selectedUser.name}" ({selectedUser.email})? 
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  此操作會永久刪除該使用者的所有資料和紀錄。
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              color="inherit"
              variant="outlined"
            >
              取消
            </Button>
            <Button 
              onClick={handleDeleteUser} 
              color="error" 
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              確認刪除
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Fade>
  );
};

export default UserManagement;