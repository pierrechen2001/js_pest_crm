import React, { useState } from "react";
import {
  Typography,
  Container,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const RoleManagement = () => {
  // 角色資料
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "管理員",
      description: "系統管理員，擁有所有權限",
      permissionType: "all",
      permissions: {
        customers: { view: true, edit: true, delete: true },
        orders: { view: true, edit: true, delete: true },
        inventory: { view: true, edit: true, delete: true },
        calendar: { view: true, edit: true, delete: true },
        userManagement: { view: true, edit: true, delete: true },
        roleManagement: { view: true, edit: true, delete: true }
      }
    },
    {
      id: 2,
      name: "一般使用者",
      description: "一般使用者，有限權限",
      permissionType: "custom",
      permissions: {
        customers: { view: true, edit: false, delete: false },
        orders: { view: true, edit: true, delete: false },
        inventory: { view: true, edit: false, delete: false },
        calendar: { view: true, edit: true, delete: false },
        userManagement: { view: false, edit: false, delete: false },
        roleManagement: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 3,
      name: "唯讀使用者",
      description: "僅有查看權限",
      permissionType: "custom",
      permissions: {
        customers: { view: true, edit: false, delete: false },
        orders: { view: true, edit: false, delete: false },
        inventory: { view: true, edit: false, delete: false },
        calendar: { view: true, edit: false, delete: false },
        userManagement: { view: false, edit: false, delete: false },
        roleManagement: { view: false, edit: false, delete: false }
      }
    }
  ]);

  // 對話框狀態
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    permissionType: "custom",
    permissions: {
      customers: { view: false, edit: false, delete: false },
      orders: { view: false, edit: false, delete: false },
      inventory: { view: false, edit: false, delete: false },
      calendar: { view: false, edit: false, delete: false },
      userManagement: { view: false, edit: false, delete: false },
      roleManagement: { view: false, edit: false, delete: false }
    }
  });

  // 模組名稱對應
  const moduleNames = {
    customers: "客戶管理",
    orders: "訂單管理",
    inventory: "庫存管理",
    calendar: "行事曆",
    userManagement: "使用者管理",
    roleManagement: "權限角色管理"
  };

  // 編輯角色
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name,
      description: role.description,
      permissionType: role.permissionType,
      permissions: JSON.parse(JSON.stringify(role.permissions)) // 深拷貝
    });
    setOpenDialog(true);
  };

  // 新增角色
  const handleAddRole = () => {
    setSelectedRole(null);
    setEditForm({
      name: "",
      description: "",
      permissionType: "custom",
      permissions: {
        customers: { view: false, edit: false, delete: false },
        orders: { view: false, edit: false, delete: false },
        inventory: { view: false, edit: false, delete: false },
        calendar: { view: false, edit: false, delete: false },
        userManagement: { view: false, edit: false, delete: false },
        roleManagement: { view: false, edit: false, delete: false }
      }
    });
    setOpenDialog(true);
  };

  // 刪除角色
  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  // 確認刪除
  const handleDeleteRole = () => {
    setRoles(roles.filter(role => role.id !== selectedRole.id));
    setDeleteDialogOpen(false);
  };

  // 儲存角色
  const handleSaveRole = () => {
    if (selectedRole) {
      // 更新現有角色
      setRoles(roles.map(role => 
        role.id === selectedRole.id ? 
        { 
          ...role, 
          name: editForm.name, 
          description: editForm.description,
          permissionType: editForm.permissionType,
          permissions: editForm.permissions 
        } : role
      ));
    } else {
      // 新增角色
      const newRole = {
        id: Math.max(...roles.map(r => r.id), 0) + 1,
        name: editForm.name,
        description: editForm.description,
        permissionType: editForm.permissionType,
        permissions: editForm.permissions
      };
      setRoles([...roles, newRole]);
    }
    setOpenDialog(false);
  };

  // 處理權限變更
  const handlePermissionChange = (module, action, checked) => {
    // 如果取消了 view 權限，同時也取消 edit 和 delete 權限
    let updatedPermissions = {
      ...editForm.permissions,
      [module]: {
        ...editForm.permissions[module],
        [action]: checked
      }
    };

    if (action === 'view' && !checked) {
      updatedPermissions[module].edit = false;
      updatedPermissions[module].delete = false;
    }

    // 如果選中了 delete 權限，同時也選中 view 和 edit 權限
    if (action === 'delete' && checked) {
      updatedPermissions[module].view = true;
      updatedPermissions[module].edit = true;
    }

    // 如果選中了 edit 權限，同時也選中 view 權限
    if (action === 'edit' && checked) {
      updatedPermissions[module].view = true;
    }

    setEditForm({
      ...editForm,
      permissions: updatedPermissions
    });
  };

  // 全選/全不選
  const handleSelectAll = (checked) => {
    const updatedPermissions = {};
    Object.keys(editForm.permissions).forEach(module => {
      updatedPermissions[module] = { view: checked, edit: checked, delete: checked };
    });
    
    setEditForm({
      ...editForm,
      permissionType: checked ? "all" : "custom",
      permissions: updatedPermissions
    });
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          權限角色管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          創建和管理系統中的使用者角色及其權限
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRole}
        >
          新增角色
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>角色名稱</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>權限類型</TableCell>
              <TableCell width="20%">動作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{role.name}</Typography>
                </TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={role.permissionType === "all" ? "完整權限" : "自訂權限"}
                    color={role.permissionType === "all" ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditRole(role)}
                  >
                    <EditIcon />
                  </IconButton>
                  {role.id !== 1 && ( // 禁止刪除管理員角色
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(role)}
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

      {/* 編輯角色對話框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRole ? "編輯角色" : "新增角色"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                基本資訊
              </Typography>
              <TextField
                fullWidth
                label="角色名稱"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="描述"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
              
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editForm.permissionType === "all"}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="賦予所有權限"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                權限設定
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>模組</TableCell>
                      <TableCell align="center">查看</TableCell>
                      <TableCell align="center">編輯</TableCell>
                      <TableCell align="center">刪除</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(editForm.permissions).map(([module, permissions]) => (
                      <TableRow key={module}>
                        <TableCell>{moduleNames[module]}</TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions.view}
                            onChange={(e) => handlePermissionChange(module, "view", e.target.checked)}
                            disabled={editForm.permissionType === "all"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions.edit}
                            onChange={(e) => handlePermissionChange(module, "edit", e.target.checked)}
                            disabled={editForm.permissionType === "all" || !permissions.view}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions.delete}
                            onChange={(e) => handlePermissionChange(module, "delete", e.target.checked)}
                            disabled={editForm.permissionType === "all" || !permissions.view || !permissions.edit}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            取消
          </Button>
          <Button 
            onClick={handleSaveRole} 
            color="primary" 
            variant="contained"
            disabled={!editForm.name}
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
        <DialogTitle>確認刪除角色?</DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Typography>
              您確定要刪除角色 "{selectedRole.name}"? 此操作無法復原，且可能會影響目前使用此角色的使用者。
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
          <Button onClick={handleDeleteRole} color="error" variant="contained">
            刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoleManagement;