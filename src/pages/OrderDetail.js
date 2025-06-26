import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import ProjectForm from '../components/ProjectForm';
import {
  Box,
  Card,
  Grid,
  Button,
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
  Chip,
} from '@mui/material';
import { Edit, Delete, ArrowBack, Add, Business, LocationOn, Person, Note, Info, Build, Payment, ContactPhone, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

const constructionStatusOptions = ["未開始", "進行中", "已完成", "延遲", "估價", "取消"];
const billingStatusOptions = ["未請款", "部分請款", "已請款", "取消"];

export default function OrderDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customerNoteExpanded, setCustomerNoteExpanded] = useState(false);
  const [projectNoteExpanded, setProjectNoteExpanded] = useState(false);
  const [isDisplayScopeExpanded, setIsDisplayScopeExpanded] = useState(false);
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

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);

  const [medicines, setMedicines] = useState([]);

  const handleOpenProjectDialog = () => {
    setOpenEditProjectDialog(true);
  };

  const handleCloseProjectDialog = () => {
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

  const handleAddLog = async () => {
    try {
      // 驗證必填欄位
      if (!newLog.content) {
        alert('請輸入日誌內容！');
        return;
      }

      // 確保日誌類型是有效的值
      const validLogTypes = ['工程', '財務', '行政', '藥劑'];
      // 移除所有空白字符，包括空格、換行等
      const logType = newLog.log_type.replace(/\s+/g, '');
      
      console.log('=== 日誌類型追蹤 ===');
      console.log('表單中的原始值:', newLog.log_type);
      console.log('處理後的值:', logType);
      console.log('允許的值列表:', validLogTypes);
      console.log('是否在允許列表中:', validLogTypes.includes(logType));
      console.log('值的長度:', logType.length);
      console.log('值的字符編碼:', Array.from(logType).map(c => c.charCodeAt(0)));
      
      // 詳細比較每個字符
      console.log('=== 字符比較 ===');
      validLogTypes.forEach(validType => {
        console.log(`比較 "${logType}" 和 "${validType}":`);
        console.log('長度是否相同:', logType.length === validType.length);
        console.log('字符編碼比較:');
        Array.from(logType).forEach((char, i) => {
          console.log(`位置 ${i}: ${char}(${char.charCodeAt(0)}) vs ${validType[i]}(${validType[i]?.charCodeAt(0)})`);
        });
      });
      console.log('===================');

      // 確保值完全匹配資料庫約束
      if (!validLogTypes.includes(logType)) {
        const errorMessage = `無效的日誌類型！\n\n` +
          `您選擇的類型: "${logType}"\n` +
          `允許的類型: ${validLogTypes.join(', ')}\n\n` +
          '請選擇正確的日誌類型。\n\n' +
          '技術細節：\n' +
          `- 值的長度: ${logType.length}\n` +
          `- 字符編碼: ${Array.from(logType).map(c => c.charCodeAt(0)).join(', ')}\n\n` +
          '注意：如果您的選擇看起來正確但仍然失敗，請聯繫系統管理員更新資料庫約束。';
        console.error(errorMessage);
        alert(errorMessage);
        return;
      }

      if (logType === '藥劑') {
        if (!newLog.medicine_id || !newLog.medicine_quantity) {
          alert('請選擇藥劑並輸入使用數量！');
          return;
        }
      }

      // 準備日誌資料
      const logDataToInsert = {
        project_id: projectId,
        log_type: logType,
        log_date: newLog.log_date,
        content: newLog.content.trim(),
        notes: (newLog.notes || '').trim(),
        created_by: user?.name || '未知使用者'
      };

      // 如果是藥劑類型，將藥劑資訊加入內容中
      if (logType === '藥劑') {
        const selectedMedicine = medicines.find(m => m.id === newLog.medicine_id);
        if (!selectedMedicine) {
          alert('找不到選擇的藥劑！');
          return;
        }
        // 修改內容格式為 "藥劑種類-使用量"
        logDataToInsert.content = `${selectedMedicine.name}-${newLog.medicine_quantity}`;

        // 新增使用記錄到 medicine_usages
        const { error: usageError } = await supabase
          .from('medicine_usages')
          .insert([{
            medicine_id: newLog.medicine_id,
            quantity: parseFloat(newLog.medicine_quantity),
            date: newLog.log_date,
            project: project.project_name
          }]);

        if (usageError) {
          console.error('Error inserting usage:', usageError);
          throw new Error('新增藥劑使用記錄失敗：' + usageError.message);
        }
      }

      console.log('=== 準備插入的資料 ===');
      console.log('完整的插入資料:', JSON.stringify(logDataToInsert, null, 2));
      console.log('log_type 的最終值:', logDataToInsert.log_type);
      console.log('===================');

      // 插入日誌記錄
      const { data: insertedLog, error: logError } = await supabase
        .from('project_log')
        .insert([logDataToInsert])
        .select();

      if (logError) {
        console.error('Error inserting log:', logError);
        console.error('Failed data:', JSON.stringify(logDataToInsert, null, 2));
        
        // 更詳細的錯誤訊息
        let errorMessage = '新增日誌失敗！\n\n';
        
        if (logError.message.includes('project_log_log_type_check')) {
          errorMessage += '原因：日誌類型不符合資料庫要求\n\n' +
            `您選擇的類型: "${logDataToInsert.log_type}"\n` +
            `允許的類型: ${validLogTypes.join(', ')}\n\n` +
            '請選擇正確的日誌類型。\n\n' +
            '技術細節：\n' +
            `- 值的長度: ${logDataToInsert.log_type.length}\n` +
            `- 字符編碼: ${Array.from(logDataToInsert.log_type).map(c => c.charCodeAt(0)).join(', ')}`;
        } else {
          errorMessage += `錯誤訊息：${logError.message}\n\n` +
            '請檢查輸入的資料是否正確。';
        }
        
        throw new Error(errorMessage);
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
      setError(error.message);
      alert(error.message);
    }
  };

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
    setOpenEditProjectDialog(false);
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
      // 先獲取要刪除的日誌記錄
      const logToDelete = projectLogs.find(log => log.log_id === deletingLogId);
      
      if (!logToDelete) {
        throw new Error('找不到要刪除的日誌記錄');
      }

      // 如果是藥劑的日誌，先刪除對應的使用記錄
      if (logToDelete.log_type === '藥劑') {
        // 從內容中解析藥劑名稱和數量
        const [medicineName, quantity] = logToDelete.content.split('-');
        
        // 找到對應的藥劑 ID
        const { data: medicineData, error: medicineError } = await supabase
          .from('medicines')
          .select('id')
          .eq('name', medicineName)
          .single();

        if (medicineError) {
          console.error('Error finding medicine:', medicineError);
          throw medicineError;
        }

        if (!medicineData) {
          throw new Error('找不到對應的藥劑');
        }

        // 刪除使用記錄
        const { error: usageError } = await supabase
          .from('medicine_usages')
          .delete()
          .eq('medicine_id', medicineData.id)
          .eq('quantity', parseFloat(quantity))
          .eq('date', logToDelete.log_date)
          .eq('project', project.project_name);

        if (usageError) {
          console.error('Error deleting medicine usage:', usageError);
          throw usageError;
        }
      }

      // 刪除日誌記錄
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
            
            {/* 根據客戶類型顯示不同的資訊 */}
            {customer?.customer_type === "一般住家" ? (
              // 一般住家只顯示基本資訊
              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">基本資訊</Typography>
                </Box>
                <Typography sx={{ mb: 1 }}><b>住址：</b>{`${customer?.contact_city || ''}${customer?.contact_district || ''}${customer?.contact_address || ''}`}</Typography>
                <Typography sx={{ mb: 1 }}><b>市話：</b>{customer?.company_phone}</Typography>
                <Typography sx={{ mb: 1 }}><b>信箱：</b>{customer?.email}</Typography>
              </Box>
            ) : (
              // 其他類型顯示完整公司資訊
              <>
                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Business sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">基本資訊</Typography>
                  </Box>
                  <Typography sx={{ mb: 1 }}>
                    <b>
                      {customer?.customer_type === "建築師" ? "事務所名稱：" :
                       customer?.customer_type === "古蹟、政府機關" ? "專案名稱：" :
                       "公司名稱："}
                    </b>
                    {customer?.customer_name}
                  </Typography>
                  <Typography sx={{ mb: 1 }}><b>統一編號：</b>{customer?.tax_id}</Typography>
                  <Typography sx={{ mb: 1 }}><b>抬頭：</b>{customer?.invoice_title}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />

                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">聯絡資訊</Typography>
                  </Box>
                  <Typography sx={{ mb: 1 }}>
                    <b>
                      {customer?.customer_type === "建築師" ? "事務所地址：" :
                       customer?.customer_type === "古蹟、政府機關" ? "專案地址：" :
                       "公司地址："}
                    </b>
                    {`${customer?.contact_city || ''}${customer?.contact_district || ''}${customer?.contact_address || ''}`}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <b>
                      {customer?.customer_type === "建築師" ? "事務所市話：" :
                       customer?.customer_type === "古蹟、政府機關" ? "市話：" :
                       "公司市話："}
                    </b>
                    {customer?.company_phone}
                  </Typography>
                   <Typography sx={{ mb: 1 }}><b>傳真：</b>{customer?.fax}</Typography>
                  <Typography sx={{ mb: 1 }}>
                    <b>
                      {customer?.customer_type === "建築師" ? "事務所信箱：" :
                       customer?.customer_type === "古蹟、政府機關" ? "信箱：" :
                       "公司信箱："}
                    </b>
                    {customer?.email}
                  </Typography>
                </Box>
              </>
            )}
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
              <Grid container spacing={2}>                <Grid item xs={12} md={6}>
                  <Typography><strong>估價日期：</strong> {project.quote_date}</Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography component="span"><strong>施工項目：</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {(() => {
                        // Try to parse construction_items array or fall back to construction_item
                        let items = [];
                        
                        if (project.construction_items && Array.isArray(project.construction_items)) {
                          items = project.construction_items;
                        } else if (project.construction_item) {
                          // Try to split by comma if it's a string
                          items = project.construction_item.split(',').map(item => item.trim()).filter(Boolean);
                        }
                        
                        if (items.length > 0) {
                          return items.map((item, index) => (
                            <Chip
                              key={index}
                              label={item}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                bgcolor: 'primary.light',
                                color: 'black',
                                '& .MuiChip-label': { fontSize: '0.75rem' }
                              }}
                            />
                          ));
                        } else {
                          return <Typography component="span" color="textSecondary"> 無</Typography>;
                        }
                      })()}
                    </Box>
                  </Box>
                  <Typography><strong>施工天數：</strong> {project.construction_days}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>預計進場日期：</strong> {project.expected_start_date}</Typography>
                  <Typography><strong>施工金額：</strong> ${project.construction_fee?.toLocaleString()}</Typography>
                  <Box>
                    <Typography component="span"><strong>施工範圍：</strong></Typography>
                    {(() => {
                      const scope = project.construction_scope || '無';
                      const previewLength = 30;
                      const isLong = scope.length > previewLength;
                      const preview = isLong ? scope.slice(0, previewLength) + '...' : scope;

                      return (
                        <Typography component="span" sx={{ ml: 1 }}>
                          {isDisplayScopeExpanded || !isLong ? scope : preview}
                          {isLong && (
                            <Typography
                              component="span"
                              onClick={() => setIsDisplayScopeExpanded(!isDisplayScopeExpanded)}
                              sx={{
                                color: 'primary.main',
                                cursor: 'pointer',
                                ml: 1,
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                              }}
                            >
                              {isDisplayScopeExpanded ? '收起' : '顯示更多'}
                            </Typography>
                          )}
                        </Typography>
                      );
                    })()}
                  </Box>
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
                  <Typography><strong>收款金額：</strong> ${project.amount?.toLocaleString()}</Typography>
                  <Typography><strong>結清日期：</strong> {project.payment_date}</Typography>
                  {project.payment_method === '匯款' && (
                    <Typography><strong>手續費：</strong> ${project.fee?.toLocaleString()}</Typography>
                  )}
                  {project.payment_method === '支票' && (
                    <>
                      <Typography><strong>付款人：</strong> {project.payer}</Typography>
                      <Typography><strong>收款人：</strong> {project.payee}</Typography>
                      <Typography><strong>支票號碼：</strong> {project.check_number}</Typography>
                      <Typography><strong>銀行分行：</strong> {project.bank_branch}</Typography>
                      <Typography><strong>到期日：</strong> {project.due_date}</Typography>
                    </>
                  )}
                </Grid>
              </Grid>
              
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box>
              <Box display="flex" alignItems="center" mb={1}>
                <ContactPhone sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold" color="primary">聯絡人資訊</Typography>
              </Box>
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
                  <Typography sx={{ mb: 1 }} key={idx}>
                    <strong>{c.role ? c.role + '：' : ''}</strong>
                    {c.name}
                    {c.type && <span style={{ color: '#888', marginLeft: 8 }}>{c.type}：</span>}
                    {c.contact && <span style={{ marginLeft: 8 }}>{c.contact}</span>}
                  </Typography>
                ) : null
              )}
              {!project.contact1_name && !project.contact2_name && !project.contact3_name && (
                <Typography color="textSecondary">尚未設定聯絡人資訊</Typography>
              )}
            </Box>

          </Card>
        </Grid>
      </Box>

      {/* 編輯專案對話框 - 使用 ProjectForm 組件 */}
      <ProjectForm
        open={openEditProjectDialog}
        onClose={handleCloseProjectDialog}
        onSave={handleProjectUpdated}
        customers={[]}
        preSelectedCustomer={null}
        showCustomerSearch={false}
        mode="edit"
        projectToEdit={project}
      />

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
                  <MenuItem value="藥劑">藥劑</MenuItem>
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

          {/* 藥劑選擇（僅在藥劑類型時顯示） */}
          {newLog.log_type === '藥劑' && (
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
            disabled={!newLog.content || (newLog.log_type === '藥劑' && (!newLog.medicine_id || !newLog.medicine_quantity))}
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
                  <MenuItem value="藥劑">藥劑</MenuItem>
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
                const baseDate = project.quote_date ? new Date(project.quote_date) : new Date();
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