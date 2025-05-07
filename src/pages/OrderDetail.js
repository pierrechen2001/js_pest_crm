import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';

const constructionStatusOptions = ["未開始", "進行中", "已完成", "延遲"];
const billingStatusOptions = ["未請款", "部分請款", "已請款"];
const taiwanCities = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"];
const taiwanDistricts = {
  "台北市": [
    "松山區", "信義區", "大安區", "中山區", "中正區", "大同區", "萬華區", 
    "文山區", "南港區", "內湖區", "士林區", "北投區"
  ],
  "新北市": [
    "板橋區", "新莊區", "中和區", "永和區", "土城區", "樹林區", "三重區", 
    "蘆洲區", "汐止區", "淡水區", "林口區", "三峽區", "鶯歌區", "金山區", 
    "萬里區", "八里區", "瑞芳區", "平溪區", "雙溪區", "貢寮區", "石門區"
  ],
  // 其他縣市區域略...
};

export default function OrderDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [customer, setCustomer] = useState(null);

  // 編輯狀態控制
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // 獲取專案數據
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // 獲取專案詳細資訊
        const { data: projectData, error: projectError } = await supabase
          .from('project')
          .select(`
            *,
            customer_database (*)
          `)
          .eq('project_id', projectId)
          .single();

        if (projectError) throw projectError;
        
        setProject(projectData);
        setCustomer(projectData.customer_database);
        setEditedProject(projectData); // 初始化編輯數據
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // 處理表單變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理城市和區域變更
  const handleCityChange = (newValue) => {
    setEditedProject(prev => ({
      ...prev,
      site_city: newValue,
      site_district: "" // 當縣市變更時，清空區域
    }));
  };

  const handleDistrictChange = (newValue) => {
    setEditedProject(prev => ({
      ...prev,
      site_district: newValue
    }));
  };

  // 更新專案資訊
  const handleUpdateProject = async () => {
    try {
      setLoading(true);
      
      // 準備提交的數據
      const updatedData = {
        project_name: editedProject.project_name,
        site_city: editedProject.site_city,
        site_district: editedProject.site_district,
        site_address: editedProject.site_address,
        construction_item: editedProject.construction_item,
        construction_fee: parseFloat(editedProject.construction_fee),
        start_date: editedProject.start_date,
        end_date: editedProject.end_date,
        construction_days: editedProject.construction_days,
        construction_scope: editedProject.construction_scope,
        project_notes: editedProject.project_notes,
        payment_method: editedProject.payment_method,
        payment_date: editedProject.payment_date,
        construction_status: editedProject.construction_status,
        billing_status: editedProject.billing_status,
        contact1_role: editedProject.contact1_role,
        contact1_name: editedProject.contact1_name,
        contact1_type: editedProject.contact1_type,
        contact1_contact: editedProject.contact1_contact,
        contact2_role: editedProject.contact2_role,
        contact2_name: editedProject.contact2_name,
        contact2_type: editedProject.contact2_type,
        contact2_contact: editedProject.contact2_contact
      };
      
      const { data, error } = await supabase
        .from('project')
        .update(updatedData)
        .eq('project_id', projectId)
        .select();
        
      if (error) throw error;
      
      setProject(data[0]);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('更新專案時發生錯誤：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 刪除專案
  const handleDeleteProject = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('project')
        .delete()
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      // 刪除成功，導航回專案列表頁面
      navigate('/orders');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('刪除專案時發生錯誤：' + error.message);
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };
  
  // 取消編輯
  const handleCancelEdit = () => {
    setEditedProject(project); // 重置為原始數據
    setIsEditing(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!project) return <Typography>找不到此專案</Typography>;

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/orders')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            {project.project_name}
          </Typography>
        </Box>
        <Box>
          {!isEditing ? (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Edit />} 
                onClick={() => setIsEditing(true)}
                sx={{ mr: 2 }}
              >
                編輯專案
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<Delete />} 
                onClick={() => setOpenDeleteDialog(true)}
              >
                刪除專案
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUpdateProject}
                sx={{ mr: 2 }}
              >
                儲存變更
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleCancelEdit}
              >
                取消
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 客戶資訊卡片 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>客戶資訊</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography>客戶名稱：{customer?.customer_name}</Typography>
                  <Typography>聯絡人：{customer?.contact1_name}</Typography>
                  <Typography>電話：{customer?.contact1_contact}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>統一編號：{customer?.tax_id}</Typography>
                  <Typography>抬頭：{customer?.invoice_title}</Typography>
                  <Typography>
                    公司地址：{`${customer?.contact_city || ''}${customer?.contact_district || ''}${customer?.contact_address || ''}`}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 專案基本資訊卡片 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>專案基本資訊</Typography>
              
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="專案名稱"
                      name="project_name"
                      value={editedProject.project_name || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Autocomplete
                        fullWidth
                        options={taiwanCities}
                        renderInput={(params) => <TextField {...params} label="施工縣市" />}
                        value={editedProject.site_city || ''}
                        onChange={(event, newValue) => handleCityChange(newValue)}
                      />
                      <Autocomplete
                        fullWidth
                        options={taiwanDistricts[editedProject.site_city] || []}
                        renderInput={(params) => <TextField {...params} label="施工區域" />}
                        value={editedProject.site_district || ''}
                        onChange={(event, newValue) => handleDistrictChange(newValue)}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="施工地址"
                      name="site_address"
                      value={editedProject.site_address || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>施工狀態</InputLabel>
                      <Select
                        name="construction_status"
                        value={editedProject.construction_status || '未開始'}
                        onChange={handleChange}
                      >
                        {constructionStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>請款狀態</InputLabel>
                      <Select
                        name="billing_status"
                        value={editedProject.billing_status || '未請款'}
                        onChange={handleChange}
                      >
                        {billingStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography><strong>專案名稱：</strong> {project.project_name}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>施工地址：</strong> 
                      {`${project.site_city || ''}${project.site_district || ''}${project.site_address || ''}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>施工狀態：</strong> {project.construction_status}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>請款狀態：</strong> {project.billing_status}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 施工資訊卡片 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>施工資訊</Typography>
              
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="開始日期"
                      type="date"
                      name="start_date"
                      value={editedProject.start_date || ''}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="結束日期"
                      type="date"
                      name="end_date"
                      value={editedProject.end_date || ''}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="施工項目"
                      name="construction_item"
                      value={editedProject.construction_item || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="施工天數"
                      type="number"
                      name="construction_days"
                      value={editedProject.construction_days || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="施工金額"
                      type="number"
                      name="construction_fee"
                      value={editedProject.construction_fee || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="施工範圍"
                      name="construction_scope"
                      value={editedProject.construction_scope || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="注意事項"
                      name="project_notes"
                      value={editedProject.project_notes || ''}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>開始日期：</strong> {project.start_date}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>結束日期：</strong> {project.end_date}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><strong>施工項目：</strong> {project.construction_item}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>施工天數：</strong> {project.construction_days}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>施工金額：</strong> ${project.construction_fee?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><strong>施工範圍：</strong> {project.construction_scope}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><strong>注意事項：</strong> {project.project_notes}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 收款資訊卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>收款資訊</Typography>
              
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="收款方式"
                      name="payment_method"
                      value={editedProject.payment_method || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="收款日期"
                      type="date"
                      name="payment_date"
                      value={editedProject.payment_date || ''}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>收款方式：</strong> {project.payment_method}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>收款日期：</strong> {project.payment_date}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 聯絡人資訊卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>聯絡人資訊</Typography>
              
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">聯絡人 1</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>職位</InputLabel>
                      <Select
                        name="contact1_role"
                        value={editedProject.contact1_role || ''}
                        onChange={handleChange}
                      >
                        {["工地聯絡人", "會計", "設計師", "採購", "監造"].map((role) => (
                          <MenuItem key={role} value={role}>{role}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="名字"
                      name="contact1_name"
                      value={editedProject.contact1_name || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>聯絡方式類型</InputLabel>
                      <Select
                        name="contact1_type"
                        value={editedProject.contact1_type || ''}
                        onChange={handleChange}
                      >
                        {["電話", "市話", "LineID", "Email"].map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="聯絡方式"
                      name="contact1_contact"
                      value={editedProject.contact1_contact || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">聯絡人 2</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>職位</InputLabel>
                      <Select
                        name="contact2_role"
                        value={editedProject.contact2_role || ''}
                        onChange={handleChange}
                      >
                        {["工地聯絡人", "會計", "設計師", "採購", "監造"].map((role) => (
                          <MenuItem key={role} value={role}>{role}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="名字"
                      name="contact2_name"
                      value={editedProject.contact2_name || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>聯絡方式類型</InputLabel>
                      <Select
                        name="contact2_type"
                        value={editedProject.contact2_type || ''}
                        onChange={handleChange}
                      >
                        {["電話", "市話", "LineID", "Email"].map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="聯絡方式"
                      name="contact2_contact"
                      value={editedProject.contact2_contact || ''}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {project.contact1_name && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">聯絡人 1</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography><strong>職位：</strong> {project.contact1_role}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography><strong>姓名：</strong> {project.contact1_name}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography>
                          <strong>{project.contact1_type}：</strong> {project.contact1_contact}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {project.contact2_name && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>聯絡人 2</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography><strong>職位：</strong> {project.contact2_role}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography><strong>姓名：</strong> {project.contact2_name}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography>
                          <strong>{project.contact2_type}：</strong> {project.contact2_contact}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {!project.contact1_name && !project.contact2_name && (
                    <Grid item xs={12}>
                      <Typography>尚未設定聯絡人資訊</Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 刪除確認對話框 */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>確認刪除專案</DialogTitle>
        <DialogContent>
          <Typography>
            你確定要刪除專案「{project.project_name}」嗎？此操作無法撤銷。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>取消</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            確認刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 