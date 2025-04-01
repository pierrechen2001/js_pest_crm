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
  Paper,
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
  Link,
  Tab,
  Tabs,
  Switch,
  FormControlLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Link as RouterLink } from "react-router-dom";

const UserManagement = () => {
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
    }
  ]);

  // 角色資料（從 RoleManagement 取得）
  const [roles, setRoles] = useState([
    { id: 1, name: "管理員" },
    { id: 2, name: "一般使用者" },
    { id: 3, name: "唯讀使用者" }
  ]);

  // 使用者編輯表單
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

  // Tab 選擇
  const [tabValue, setTabValue] = useState(0);

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
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          使用者管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理系統中的使用者及其權限
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="使用者管理" />
          <Tab 
            label="角色管理" 
            component={RouterLink} 
            to="/role-management" 
            sx={{ textDecoration: 'none' }} 
          />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddUser}
        >
          新增使用者
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>使用者</TableCell>
              <TableCell>電子郵件</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>建立時間</TableCell>
              <TableCell width="15%">動作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: isActive(user.status) ? 'primary.main' : 'grey.400' 
                      }}
                    >
                      {getUserAvatar(user.name)}
                    </Avatar>
                    <Typography variant="subtitle2">{user.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color={getRoleColor(user.role)}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={isActive(user.status) ? "啟用" : "停用"} 
                    size="small"
                    color={isActive(user.status) ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditUser(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  {user.id !== 1 && ( // 禁止刪除管理員
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 編輯使用者對話框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? "編輯使用者" : "新增使用者"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="姓名"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                margin="normal"
                required
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
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
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
              <TextField
                fullWidth
                label="密碼"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                margin="normal"
                helperText={selectedUser ? "留空表示不變更密碼" : ""}
                required={!selectedUser}
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
              />
            </Grid>
            <Grid item xs={12}>
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
                label="帳號啟用"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            取消
          </Button>
          <Button 
            onClick={handleSaveUser} 
            color="primary" 
            variant="contained"
            disabled={!editForm.name || !editForm.email || !editForm.role || 
              (!selectedUser && !editForm.password)}
          >
            儲存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>確認刪除使用者?</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Typography>
              您確定要刪除使用者 "{selectedUser.name}" ({selectedUser.email})? 此操作無法復原。
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
          >
            取消
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;