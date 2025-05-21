import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Edit, Delete, ArrowBack, Add, Business, Receipt, LocationOn, Phone, Fax, Person, Note, Info, Build, Payment, ContactPhone, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customerNoteExpanded, setCustomerNoteExpanded] = useState(false);
  const [projectNoteExpanded, setProjectNoteExpanded] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [projectLogs, setProjectLogs] = useState([]);
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [newLog, setNewLog] = useState({
    log_type: '工程',
    log_date: new Date().toISOString().split('T')[0],
    content: '',
    notes: '',
    medicine_id: '',
    medicine_quantity: ''
  });

  const [editedProject, setEditedProject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);

  const [medicines, setMedicines] = useState([]);

  const handleOpenProjectDialog = () => {
    setEditedProject(project);
    setOpenEditProjectDialog(true);
  };

  const handleCloseProjectDialog = () => {
    setEditedProject(project);
    setOpenEditProjectDialog(false);
  };

  const [filterType, setFilterType] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({
    start: '',
    end: ''
  });
  const [filterKeyword, setFilterKeyword] = useState('');

  const [openEditLogDialog, setOpenEditLogDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [openDeleteLogDialog, setOpenDeleteLogDialog] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState(null);
  const location = useLocation();
  const [trackType, setTrackType] = useState("month"); // "month" or "year"
  const [trackValue, setTrackValue] = useState(1);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [trackRefresh, setTrackRefresh] = useState(0);
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
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
        setEditedProject(projectData);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, trackRefresh]);

  useEffect(() => {
    const fetchProjectLogs = async () => {
      try {
        const { data: logsData, error: logsError } = await supabase
          .from('project_log')
          .select('*')
          .eq('project_id', projectId)
          .order('log_date', { ascending: false });

        if (logsError) throw logsError;
        setProjectLogs(logsData || []);
      } catch (error) {
        console.error('Error fetching project logs:', error);
        setError(error.message);
      }
    };

    fetchProjectLogs();
  }, [projectId]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const { data, error } = await supabase
          .from('medicines')
          .select('*');

        if (error) throw error;
        setMedicines(data || []);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        setError('獲取藥劑列表失敗：' + error.message);
      }
    };

    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCityChange = (newValue) => {
    setEditedProject(prev => ({
      ...prev,
      site_city: newValue,
      site_district: ""
    }));
  };

  const handleDistrictChange = (newValue) => {
    setEditedProject(prev => ({
      ...prev,
      site_district: newValue
    }));
  };

  const handleAddLog = async () => {
    try {
      // 驗證必填欄位
      if (!newLog.content) {
        alert('請輸入日誌內容！');
        return;
      }

      // 確保日誌類型是有效的值
      const validLogTypes = ['工程', '財務', '行政', '使用藥劑'];
      const logType = newLog.log_type.trim();
      
      if (!validLogTypes.includes(logType)) {
        console.error('無效的日誌類型:', logType);
        alert('無效的日誌類型！');
        return;
      }

      if (logType === '使用藥劑') {
        if (!newLog.medicine_id || !newLog.medicine_quantity) {
          alert('請選擇藥劑並輸入使用數量！');
          return;
        }
      }

      // 準備日誌資料
      const logDataToInsert = {
        project_id: projectId,
        log_type: logType, // 使用驗證過的 logType
        log_date: newLog.log_date,
        content: newLog.content.trim(),
        notes: (newLog.notes || '').trim(),
        created_by: '系統管理員'
      };

      // 如果是使用藥劑類型，將藥劑資訊加入內容中
      if (logType === '使用藥劑') {
        const selectedMedicine = medicines.find(m => m.id === newLog.medicine_id);
        if (!selectedMedicine) {
          alert('找不到選擇的藥劑！');
          return;
        }
        logDataToInsert.content = `使用藥劑：${selectedMedicine.name}，數量：${newLog.medicine_quantity}\n\n${newLog.content}`;
      }

      console.log('準備插入的日誌資料:', JSON.stringify(logDataToInsert, null, 2)); // 使用 JSON.stringify 以便更好地查看資料

      // 插入日誌記錄
      const { data: insertedLog, error: logError } = await supabase
        .from('project_log')
        .insert([
          {
            project_id: projectId,
            log_type: newLog.log_type,
            log_date: newLog.log_date,
            content: newLog.content,
            notes: newLog.notes,
            created_by: user?.name || '未知使用者'
          }
        ])
        .select();

      if (logError) {
        console.error('Error inserting log:', logError);
        console.error('Failed data:', JSON.stringify(logDataToInsert, null, 2));
        throw new Error('新增日誌失敗：' + logError.message);
      }

      // 如果是使用藥劑類型，同時更新藥劑使用記錄
      if (logType === '使用藥劑') {
        const { error: usageError } = await supabase
          .from('medicine_usages')
          .insert([{
            medicine_id: newLog.medicine_id,
            quantity: parseFloat(newLog.medicine_quantity),
            date: newLog.log_date,
            project: project.project_name,
            customer: project.customer_database?.customer_name || '未知客戶'
          }]);

        if (usageError) {
          console.error('Error inserting usage:', usageError);
          throw new Error('新增藥劑使用記錄失敗：' + usageError.message);
        }
      }

      // 更新日誌列表
      setProjectLogs([insertedLog[0], ...projectLogs]);
      
      // 重置表單
      setOpenLogDialog(false);
      setNewLog({
        log_type: '工程',
        log_date: new Date().toISOString().split('T')[0],
        content: '',
        notes: '',
        medicine_id: '',
        medicine_quantity: ''
      });

    } catch (error) {
      console.error('Error in handleAddLog:', error);
      setError('新增日誌時發生錯誤：' + error.message);
      alert('新增日誌時發生錯誤：' + error.message);
    }
  };

  const handleUpdateProject = async () => {
    try {
      setLoading(true);
      
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
        contact2_contact: editedProject.contact2_contact,
        contact3_role: editedProject.contact3_role,
        contact3_name: editedProject.contact3_name,
        contact3_type: editedProject.contact3_type,
        contact3_contact: editedProject.contact3_contact
      };
      
      const { data, error } = await supabase
        .from('project')
        .update(updatedData)
        .eq('project_id', projectId)
        .select();
        
      if (error) throw error;
      
      setProject(data[0]);
      setOpenEditProjectDialog(false);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('更新專案時發生錯誤：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('project')
        .delete()
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      navigate('/orders');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('刪除專案時發生錯誤：' + error.message);
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  const filteredLogs = projectLogs.filter(log => {
    if (filterType && log.log_type !== filterType) return false;
    if (filterDateRange.start && log.log_date < filterDateRange.start) return false;
    if (filterDateRange.end && log.log_date > filterDateRange.end) return false;
    if (filterKeyword) {
      const keyword = filterKeyword.toLowerCase();
      return (
        log.content.toLowerCase().includes(keyword) ||
        log.notes?.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

  const handleResetFilter = () => {
    setFilterType('');
    setFilterDateRange({ start: '', end: '' });
    setFilterKeyword('');
  };

  const handleEditLog = async () => {
    try {
      const { data, error } = await supabase
        .from('project_log')
        .update({
          log_type: editingLog.log_type,
          log_date: editingLog.log_date,
          content: editingLog.content,
          notes: editingLog.notes,
          updated_at: new Date().toISOString()
        })
        .eq('log_id', editingLog.log_id)
        .select();

      if (error) throw error;

      setProjectLogs(projectLogs.map(log => 
        log.log_id === editingLog.log_id ? data[0] : log
      ));
      setOpenEditLogDialog(false);
      setEditingLog(null);
    } catch (error) {
      console.error('Error updating log:', error);
      setError('更新日誌時發生錯誤：' + error.message);
    }
  };

  const handleDeleteLog = async () => {
    try {
      const { error } = await supabase
        .from('project_log')
        .delete()
        .eq('log_id', deletingLogId);

      if (error) throw error;

      setProjectLogs(projectLogs.filter(log => log.log_id !== deletingLogId));
      setOpenDeleteLogDialog(false);
      setDeletingLogId(null);
    } catch (error) {
      console.error('Error deleting log:', error);
      setError('刪除日誌時發生錯誤：' + error.message);
    }
  };

  // 並讓 isTracked 依賴 trackRefresh
  const isTracked = !!project?.is_tracked;

  const handleCancelTrack = async () => {
    try {
      const { error } = await supabase
        .from('project')
        .update({
          is_tracked: false,
          track_remind_date: null
        })
        .eq('project_id', project.project_id);

      if (error) throw error;
      setTrackRefresh(r => r + 1); // 重新 fetch project
      alert('已取消追蹤！');
    } catch (err) {
      alert('取消追蹤失敗：' + err.message);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("setTrack") === "1") {
      setTrackDialogOpen(true);
    }
  }, [location.search]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!project) return <Typography>找不到此專案</Typography>;

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/orders')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {project.project_name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Button
            variant="contained"
            color={isTracked ? "success" : "inherit"}
            startIcon={isTracked ? <CheckCircle /> : <RadioButtonUnchecked />}
            onClick={() => setTrackDialogOpen(true)}
            sx={{
              mr: 2,
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 'bold',
              bgcolor: isTracked ? 'success.main' : 'grey.400',
              color: isTracked ? 'white' : 'text.primary',
              '&:hover': {
                bgcolor: isTracked ? 'success.dark' : 'grey.500',
              },
            }}
          >
            {isTracked
              ? `已設定 ${project.track_remind_date || ''} 追蹤`
              : '未設定追蹤'}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Edit />} 
            onClick={handleOpenProjectDialog}
            sx={{ mr: 2, borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            編輯專案
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Delete />} 
            onClick={() => setOpenDeleteDialog(true)}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            刪除專案
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row', 
          gap: 3,
          alignItems: 'flex-start',
          flexWrap: 'nowrap', 
          overflowX: 'auto',  
          alignItems: 'stretch',
        }}
      >
        <Grid item xs={12} md={6} sx={{ flexBasis: { xs: '100%', md: '40%' }, flexShrink: 0, minWidth: '300px', }}>
          <Card sx={{ mb: 0, borderRadius: 2, p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
            <Typography variant="h5" fontWeight="bold" color="primary.black" gutterBottom>客戶資訊</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <Business sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary" >基本資訊</Typography>
              </Box>
              <Typography sx={{ mb: 1 }}><b>公司名稱：</b>{customer?.customer_name}</Typography>
              <Typography sx={{ mb: 1 }}><b>統一編號：</b>{customer?.tax_id}</Typography>
              <Typography sx={{ mb: 1 }}><b>抬頭：</b>{customer?.invoice_title}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">聯絡資訊</Typography>
              </Box>
              <Typography sx={{ mb: 1 }}><b>公司地址：</b>{`${customer?.contact_city || ''}${customer?.contact_district || ''}${customer?.contact_address || ''}`}</Typography>
              <Typography sx={{ mb: 1 }}><b>公司電話：</b>{customer?.company_phone}</Typography>
              <Typography sx={{ mb: 1 }}><b>傳真：</b>{customer?.fax}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <Person sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">聯絡人資訊</Typography>
              </Box>
              {customer?.contact1_name && (
                <Typography sx={{ mb: 1 }}><b>{customer?.contact1_role ? customer?.contact1_role + '：' : ''}</b>{customer?.contact1_name} {customer?.contact1_type && <span style={{ color: '#888', marginLeft: 8 }}>{customer?.contact1_type}：</span>}{customer?.contact1_contact && <span style={{ marginLeft: 8 }}>{customer?.contact1_contact}</span>}</Typography>
              )}
              {customer?.contact2_name && (
                <Typography sx={{ mb: 1 }}><b>{customer?.contact2_role ? customer?.contact2_role + '：' : ''}</b>{customer?.contact2_name} {customer?.contact2_type && <span style={{ color: '#888', marginLeft: 8 }}>{customer?.contact2_type}：</span>}{customer?.contact2_contact && <span style={{ marginLeft: 8 }}>{customer?.contact2_contact}</span>}</Typography>
              )}
              {customer?.contact3_name && (
                <Typography sx={{ mb: 1 }}><b>{customer?.contact3_role ? customer?.contact3_role + '：' : ''}</b>{customer?.contact3_name} {customer?.contact3_type && <span style={{ color: '#888', marginLeft: 8 }}>{customer?.contact3_type}：</span>}{customer?.contact3_contact && <span style={{ marginLeft: 8 }}>{customer?.contact3_contact}</span>}</Typography>
              )}
              {!customer?.contact1_name && !customer?.contact2_name && !customer?.contact3_name && (
                <Typography color="textSecondary">尚未設定聯絡人資訊</Typography>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Note sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">注意事項</Typography>
                </Box>

                {(() => {
                  const note = customer?.notes || '無';
                  const previewLength = 100;
                  const isLong = note.length > previewLength;
                  const preview = isLong ? note.slice(0, previewLength) + '...' : note;

                  return (
                    <Typography color="textSecondary">
                      {customerNoteExpanded || !isLong ? note : preview}
                      {isLong && (
                        <Typography
                          component="span"
                          onClick={() => setCustomerNoteExpanded(!customerNoteExpanded)}
                          sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                            ml: 1,
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          {customerNoteExpanded ? '收起' : '顯示更多'}
                        </Typography>
                      )}
                    </Typography>
                  );
                })()}
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8} sx={{ flexBasis: { xs: '100%', md: '60%' }, flexGrow: 1, minWidth: '300px', }}>
          <Card sx={{ mb: 0, borderRadius: 2, p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
            <Typography variant="h5" fontWeight="bold" color="primary.black" gutterBottom>專案資訊</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box mb={3}>
              <Box display="flex" alignItems="center" mb={1}>
                <Info sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">基本資訊</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>專案名稱：</strong> {project.project_name}</Typography>
                  <Typography>
                    <strong>施工地址：</strong> 
                    {`${project.site_city || ''}${project.site_district || ''}${project.site_address || ''}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>施工狀態：</strong> {project.construction_status}</Typography>
                  <Typography><strong>請款狀態：</strong> {project.billing_status}</Typography>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box mb={3}>
              <Box display="flex" alignItems="center" mb={1}>
                <Build sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">施工資訊</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>開始日期：</strong> {project.start_date}</Typography>
                  <Typography><strong>施工項目：</strong> {project.construction_item}</Typography>
                  <Typography><strong>施工天數：</strong> {project.construction_days}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>結束日期：</strong> {project.end_date}</Typography>
                  <Typography><strong>施工金額：</strong> ${project.construction_fee?.toLocaleString()}</Typography>
                  <Typography><strong>施工範圍：</strong> {project.construction_scope}</Typography>
                </Grid>
                {/* <Grid item xs={12}>
                  <Typography><strong>注意事項：</strong> {project.project_notes}</Typography>
                </Grid> */}
              </Grid>
                {/* 🆕 注意事項區塊 */}
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Note sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">注意事項</Typography>
                  </Box>

                  {/* 展開文字控制邏輯 */}
                  {(() => {
                    const note = project.project_notes || '無';
                    const previewLength = 100;
                    const isLong = note.length > previewLength;
                    const preview = isLong ? note.slice(0, previewLength) + '...' : note;

                    return (
                      <Typography color="textSecondary">
                        {projectNoteExpanded || !isLong ? note : preview}
                        {isLong && (
                          <Typography
                            component="span"
                            onClick={() => setProjectNoteExpanded(!projectNoteExpanded)}
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              ml: 1,
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                            }}
                          >
                            {projectNoteExpanded ? '收起' : '顯示更多'}
                          </Typography>
                        )}
                      </Typography>
                    );
                  })()}
                </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box mb={3}>
              <Box display="flex" alignItems="center" mb={1}>
                <Payment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">收款資訊</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>收款方式：</strong> {project.payment_method}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>收款日期：</strong> {project.payment_date}</Typography>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box>
              <Box display="flex" alignItems="center" mb={1}>
                <ContactPhone sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">聯絡人資訊</Typography>
                </Box>
                <>
                  {[
                    {
                      role: project.contact1_role,
                      name: project.contact1_name,
                      type: project.contact1_type,
                      contact: project.contact1_contact,
                    },
                    {
                      role: project.contact2_role,
                      name: project.contact2_name,
                      type: project.contact2_type,
                      contact: project.contact2_contact,
                    },
                    {
                      role: project.contact3_role,
                      name: project.contact3_name,
                      type: project.contact3_type,
                      contact: project.contact3_contact,
                    },
                  ].map((c, idx) =>
                    c.name ? (
                      <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }} key={idx}>
                        <Grid item xs={12} md={4}>
                          <Typography>
                            <strong>{c.role}：</strong>{c.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography>
                            <strong>{c.type}：</strong>{c.contact}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : null
                  )}

                  {!project.contact1_name && !project.contact2_name && !project.contact3_name && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography color="textSecondary">尚未設定聯絡人資訊</Typography>
                      </Grid>
                    </Grid>
                  )}
                </>
                </Box>

          </Card>
        </Grid>
      </Box>

      <Dialog
        open={openEditProjectDialog}
        onClose={handleCloseProjectDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>編輯專案資訊</DialogTitle>
        <DialogContent>
          <Box mb={3}>
      <Typography variant="subtitle1" fontWeight="bold ">基本資訊</Typography>

{/* 第一行：專案名稱、施工狀態、請款狀態 */}
<Grid container alignItems="center" sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
  <Box sx={{ flex: 1 }}>
    <TextField
      fullWidth
      label="專案名稱"
      name="project_name"
      value={editedProject.project_name || ''}
      onChange={handleChange}
      margin="normal"
    />
  </Box>
  <Box sx={{ flex: 1 }}>
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
  </Box>
  <Box sx={{ flex: 1 }}>
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
  </Box>
</Grid>

{/* 第二行：縣市（2）、區域（2）、地址（6） */}
<Grid container alignItems="center" sx={{ mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
  <Box sx={{ flex: 2 }}>
    <Autocomplete
      fullWidth
      options={taiwanCities}
      renderInput={(params) => <TextField {...params} label="施工縣市" margin="normal" />}
      value={editedProject.site_city || ''}
      onChange={(event, newValue) => handleCityChange(newValue)}
    />
  </Box>
  <Box sx={{ flex: 2 }}>
    <Autocomplete
      fullWidth
      options={taiwanDistricts[editedProject.site_city] || []}
      renderInput={(params) => <TextField {...params} label="施工區域" margin="normal" />}
      value={editedProject.site_district || ''}
      onChange={(event, newValue) => handleDistrictChange(newValue)}
    />
  </Box>
  <Box sx={{ flex: 6 }}>
    <TextField
      fullWidth
      label="施工地址"
      name="site_address"
      value={editedProject.site_address || ''}
      onChange={handleChange}
      margin="normal"
    />
  </Box>
</Grid>

      <Typography variant="subtitle1" fontWeight="bold">施工資訊</Typography>

      {/* 第一行：開始日期、結束日期、施工項目 */}
      <Grid container alignItems="center" sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
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
        </Box>
        <Box sx={{ flex: 1 }}>
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
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="施工項目"
            name="construction_item"
            value={editedProject.construction_item || ''}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
      </Grid>

      {/* 第二行：施工天數、施工金額、施工範圍 */}
      <Grid container alignItems="center" sx={{ mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="施工天數"
            type="number"
            name="construction_days"
            value={editedProject.construction_days || ''}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="施工金額"
            type="number"
            name="construction_fee"
            value={editedProject.construction_fee || ''}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="施工範圍"
            name="construction_scope"
            value={editedProject.construction_scope || ''}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
      </Grid>

      {/* 第三行：注意事項 */}
      <Grid container alignItems="center" sx={{ mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="注意事項"
            name="project_notes"
            value={editedProject.project_notes || ''}
            onChange={handleChange}
            multiline
            minRows={4}
            margin="normal"
          />
        </Box>
      </Grid>

      <Typography variant="subtitle1" fontWeight="bold">收款資訊</Typography>
      {/* 收款資訊 */}
      <Grid container alignItems="center" sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="收款方式"
            name="payment_method"
            value={editedProject.payment_method || ''}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
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
        </Box>
      </Grid>

            <Typography variant="subtitle1" fontWeight="bold">聯絡人資訊</Typography>
            {/* Contact rows: one per person */}
            {/* 聯絡人 1 */}
            <Grid container alignItems="center" sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
              <Box sx={{ flex: '0 0 100px' }}><Typography variant="subtitle2">聯絡人 1</Typography></Box>
              <Box sx={{ flex: 1 }}>
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
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="名字"
                  name="contact1_name"
                  value={editedProject.contact1_name || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
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
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="聯絡方式"
                  name="contact1_contact"
                  value={editedProject.contact1_contact || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            </Grid>
            {/* 聯絡人 2 */}
            <Grid container alignItems="center" sx={{ mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
              <Box sx={{ flex: '0 0 100px' }}><Typography variant="subtitle2">聯絡人 2</Typography></Box>
              <Box sx={{ flex: 1 }}>
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
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="名字"
                  name="contact2_name"
                  value={editedProject.contact2_name || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
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
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="聯絡方式"
                  name="contact2_contact"
                  value={editedProject.contact2_contact || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            </Grid>
            {/* 聯絡人 3 */}
            <Grid container alignItems="center" sx={{ mb: 1, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
              <Box sx={{ flex: '0 0 100px' }}><Typography variant="subtitle2">聯絡人 3</Typography></Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>職位</InputLabel>
                  <Select
                    name="contact3_role"
                    value={editedProject.contact3_role || ''}
                    onChange={handleChange}
                  >
                    {["工地聯絡人", "會計", "設計師", "採購", "監造"].map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="名字"
                  name="contact3_name"
                  value={editedProject.contact3_name || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>聯絡方式類型</InputLabel>
                  <Select
                    name="contact3_type"
                    value={editedProject.contact3_type || ''}
                    onChange={handleChange}
                  >
                    {["電話", "市話", "LineID", "Email"].map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="聯絡方式"
                  name="contact3_contact"
                  value={editedProject.contact3_contact || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDialog}>取消</Button>
          <Button onClick={handleUpdateProject} variant="contained" color="primary">儲存</Button>
        </DialogActions>
      </Dialog>

      <Box mt={3}>
        <Card sx={{ borderRadius: 2, p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold" color="primary">專案日誌</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpenLogDialog(true)}
              sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
            >
              新增日誌
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small" sx={{ minWidth: '90px' }}>
                  <InputLabel>類型</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="類型"
                  >
                    <MenuItem value="">全部</MenuItem>
                    <MenuItem value="工程">工程</MenuItem>
                    <MenuItem value="財務">財務</MenuItem>
                    <MenuItem value="行政">行政</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="開始日期"
                  value={filterDateRange.start}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: '150px' }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="結束日期"
                  value={filterDateRange.end}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: '150px' }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="關鍵字搜尋"
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  sx={{ minWidth: '200px' }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleResetFilter}
                  size="small"
                  sx={{ minWidth: '100px' }}
                >
                  重設
                </Button>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="10%">類型</TableCell>
                  <TableCell width="12%">日期</TableCell>
                  <TableCell width="35%">內容</TableCell>
                  <TableCell width="15%">備註</TableCell>
                  <TableCell width="12%">建立者</TableCell>
                  <TableCell width="15%" align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 
                            log.log_type === '工程' ? 'rgba(25, 118, 210, 0.1)' :
                            log.log_type === '財務' ? 'rgba(46, 125, 50, 0.1)' :
                            'rgba(237, 108, 2, 0.1)',
                          color: 
                            log.log_type === '工程' ? 'rgb(25, 118, 210)' :
                            log.log_type === '財務' ? 'rgb(46, 125, 50)' :
                            'rgb(237, 108, 2)',
                          fontWeight: 500,
                        }}
                      >
                        {log.log_type}
                      </Box>
                    </TableCell>
                    <TableCell>{log.log_date}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          position: 'relative',
                          display: '-webkit-box',
                          WebkitLineClamp: expandedLogId === log.log_id ? 'none' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word',
                          maxHeight: expandedLogId === log.log_id ? 'none' : '3.2em',
                        }}
                        dangerouslySetInnerHTML={{ __html: log.content }}
                      />
                      {log.content?.length > 60 && ( // 如果內容稍長就顯示按鈕（你可視情況調整閾值）
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: 'pointer', mt: 1 }}
                          onClick={() =>
                            setExpandedLogId(prev => (prev === log.log_id ? null : log.log_id))
                          }
                        >
                          {expandedLogId === log.log_id ? '收起' : '顯示更多'}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{log.notes}</TableCell>
                    <TableCell>{log.created_by}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingLog(log);
                          setOpenEditLogDialog(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeletingLogId(log.log_id);
                          setOpenDeleteLogDialog(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">尚無日誌記錄</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      <Dialog
        open={openLogDialog}
        onClose={() => setOpenLogDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>新增專案日誌</DialogTitle>
        <DialogContent>
          <Grid container alignItems="center" sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
            {/* 日期 */}
            <Box sx={{ flex: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="日期"
                value={newLog.log_date}
                onChange={(e) => setNewLog({ ...newLog, log_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Box>

            {/* 日誌類型 */}
            <Box sx={{ flex: 3 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>日誌類型</InputLabel>
                <Select
                  value={newLog.log_type}
                  onChange={(e) => setNewLog({ ...newLog, log_type: e.target.value })}
                >
                  <MenuItem value="工程">工程</MenuItem>
                  <MenuItem value="財務">財務</MenuItem>
                  <MenuItem value="行政">行政</MenuItem>
                  <MenuItem value="使用藥劑">使用藥劑</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* 備註 */}
            <Box sx={{ flex: 5 }}>
              <TextField
                fullWidth
                label="備註"
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                margin="normal"
                sx={{
                  '& .MuiInputBase-root': {
                    height: '56px',
                    alignItems: 'center',
                  },
                  '& input': {
                    height: '100%',
                    boxSizing: 'border-box',
                  },
                }}
              />
            </Box>
          </Grid>

          {/* 藥劑選擇（僅在使用藥劑類型時顯示） */}
          {newLog.log_type === '使用藥劑' && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>選擇藥劑</InputLabel>
                  <Select
                    value={newLog.medicine_id}
                    onChange={(e) => setNewLog({ ...newLog, medicine_id: e.target.value })}
                    label="選擇藥劑"
                  >
                    {medicines.map((medicine) => (
                      <MenuItem key={medicine.id} value={medicine.id}>
                        {medicine.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="使用數量"
                  type="text"
                  value={newLog.medicine_quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setNewLog({ ...newLog, medicine_quantity: value });
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}

          {/* 內容輸入區（整行） */}
          <Box>
            <Typography sx={{ mb: 1 }}>內容</Typography>
            <ReactQuill
              theme="snow"
              value={newLog.content}
              onChange={(value) => setNewLog({ ...newLog, content: value })}
              style={{ height: '200px', backgroundColor: 'white' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogDialog(false)}>取消</Button>
          <Button 
            onClick={handleAddLog} 
            variant="contained" 
            color="primary"
            disabled={!newLog.content || (newLog.log_type === '使用藥劑' && (!newLog.medicine_id || !newLog.medicine_quantity))}
          >
            新增
          </Button>
        </DialogActions>
      </Dialog>

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

      <Dialog
        open={openEditLogDialog}
        onClose={() => {
          setOpenEditLogDialog(false);
          setEditingLog(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>編輯專案日誌</DialogTitle>
        <DialogContent sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
          {/* 日期 / 類型 / 備註 */}
          <Grid container alignItems="center" sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
            <Box sx={{ flex: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="日期"
                value={editingLog?.log_date || ''}
                onChange={(e) => setEditingLog(prev => ({ ...prev, log_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Box>

            <Box sx={{ flex: 3 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>日誌類型</InputLabel>
                <Select
                  value={editingLog?.log_type || ''}
                  onChange={(e) => setEditingLog(prev => ({ ...prev, log_type: e.target.value }))}
                >
                  <MenuItem value="工程">工程</MenuItem>
                  <MenuItem value="財務">財務</MenuItem>
                  <MenuItem value="行政">行政</MenuItem>
                  <MenuItem value="使用藥劑">使用藥劑</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 5 }}>
              <TextField
                fullWidth
                label="備註"
                value={editingLog?.notes || ''}
                onChange={(e) => setEditingLog(prev => ({ ...prev, notes: e.target.value }))}
                margin="normal"
                // 👇 保證高度與 Select/TextField 對齊
                sx={{
                  '& .MuiInputBase-root': {
                    height: '56px',
                    alignItems: 'center',
                  },
                  '& input': {
                    height: '100%',
                    boxSizing: 'border-box',
                  },
                }}
              />
            </Box>
          </Grid>

          {/* 內容欄位 */}
          <Box>
            <Typography sx={{ mb: 1 }}>內容</Typography>
            <ReactQuill
              theme="snow"
              value={editingLog?.content || ''}
              onChange={(value) => setEditingLog(prev => ({ ...prev, content: value }))}
              style={{ height: '200px', backgroundColor: 'white' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenEditLogDialog(false);
              setEditingLog(null);
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleEditLog} 
            variant="contained" 
            color="primary"
            disabled={!editingLog?.content}
          >
            儲存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteLogDialog}
        onClose={() => {
          setOpenDeleteLogDialog(false);
          setDeletingLogId(null);
        }}
      >
        <DialogTitle>確認刪除日誌</DialogTitle>
        <DialogContent>
          <Typography>
            你確定要刪除這筆日誌記錄嗎？此操作無法撤銷。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDeleteLogDialog(false);
              setDeletingLogId(null);
            }}
          >
            取消
          </Button>
          <Button 
            onClick={handleDeleteLog} 
            color="error" 
            variant="contained"
          >
            確認刪除
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={trackDialogOpen} onClose={() => setTrackDialogOpen(false)}>
        <DialogTitle>設定追蹤提醒</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {isTracked && project.track_remind_date
              ? `目前已設定追蹤日期：${project.track_remind_date}，你可以重設或取消追蹤。`
              : '請選擇要幾個月或幾年後提醒追蹤此專案：'}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              type="number"
              label="數值"
              value={trackValue}
              onChange={e => setTrackValue(Number(e.target.value))}
              inputProps={{ min: 1 }}
              sx={{ width: 100 }}
            />
            <FormControl>
              <Select
                value={trackType}
                onChange={e => setTrackType(e.target.value)}
              >
                <MenuItem value="month">個月後</MenuItem>
                <MenuItem value="year">年後</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackDialogOpen(false)}>關閉</Button>
          {isTracked && (
            <Button
              color="warning"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('project')
                    .update({
                      is_tracked: false,
                      track_remind_date: null
                    })
                    .eq('project_id', project.project_id);
                  if (error) throw error;
                  setTrackDialogOpen(false);
                  setTrackRefresh(r => r + 1);
                  alert('已取消追蹤！');
                } catch (err) {
                  alert('取消追蹤失敗：' + err.message);
                }
              }}
            >
              取消追蹤
            </Button>
          )}
          <Button
            variant="contained"
            onClick={async () => {
              try {
                // 計算提醒日期
                const baseDate = project.start_date ? new Date(project.start_date) : new Date();
                let remindDate = new Date(baseDate);
                if (trackType === "month") {
                  remindDate.setMonth(remindDate.getMonth() + trackValue);
                } else {
                  remindDate.setFullYear(remindDate.getFullYear() + trackValue);
                }
                // 更新 supabase
                const { error } = await supabase
                  .from('project')
                  .update({
                    is_tracked: true,
                    track_remind_date: remindDate.toISOString().split('T')[0]
                  })
                  .eq('project_id', project.project_id);
                if (error) throw error;
                setTrackDialogOpen(false);
                setTrackRefresh(r => r + 1);
                alert(isTracked ? '已重設追蹤！' : '已設定追蹤，可至行事曆頁面查看！');
              } catch (err) {
                alert('設定追蹤失敗：' + err.message);
              }
            }}
          >
            {isTracked ? '重設追蹤' : '確認'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    
  );
}