import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

import { useAuth } from '../context/AuthContext';
import ProjectForm from '../components/ProjectForm';
import ProjectLogDialog from '../components/ProjectLogDialog';
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
    log_date: new Date().toISOString().split('T')[0],
    amount: '',
    amount_untaxed: '',
    amount_taxed: '',
    personnel: '',
    work_item: '',
    work_scope: '',
    warranty_years: '',
    notes: ''
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);



  const handleOpenProjectDialog = () => {
    setOpenEditProjectDialog(true);
  };

  const handleCloseProjectDialog = () => {
    setOpenEditProjectDialog(false);
  };

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



  const handleAddLog = async () => {
    try {
      // 基本驗證
      if (!newLog.log_date) {
        alert('請選擇日期！'); 
        return; 
      }

      const logDataToInsert = {
        project_id: projectId,
        log_date: newLog.log_date,
        amount: parseFloat(newLog.amount) || 0,
        amount_untaxed: parseFloat(newLog.amount_untaxed) || 0,
        amount_taxed: parseFloat(newLog.amount_taxed) || 0,
        personnel: (newLog.personnel || '').trim(),
        work_item: (newLog.work_item || '').trim(),
        work_scope: (newLog.work_scope || '').trim(),
        warranty_years: parseFloat(newLog.warranty_years) || 0,
        notes: (newLog.notes || '').trim(),
        created_by: user?.name || '未知使用者'
      };

      // 新增 project_log
      const { data: insertedLog, error: logError } = await supabase
        .from('project_log').insert([logDataToInsert]).select();
      
      if (logError) throw logError;

      setProjectLogs([insertedLog[0], ...projectLogs]);
      setOpenLogDialog(false);
      setNewLog({ 
        log_date: new Date().toISOString().split('T')[0], 
        amount: '',
        amount_untaxed: '',
        amount_taxed: '',
        personnel: '',
        work_item: '',
        work_scope: '',
        warranty_years: '',
        notes: '' 
      });
    } catch (error) {
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
    if (filterDateRange.start && log.log_date < filterDateRange.start) return false;
    if (filterDateRange.end && log.log_date > filterDateRange.end) return false;
    if (filterKeyword) {
      const keyword = filterKeyword.toLowerCase();
      return (
        (log.work_item && log.work_item.toLowerCase().includes(keyword)) ||
        (log.work_scope && log.work_scope.toLowerCase().includes(keyword)) ||
        (log.personnel && log.personnel.toLowerCase().includes(keyword)) ||
        (log.notes && log.notes.toLowerCase().includes(keyword))
      );
    }
    return true;
  });

  const handleResetFilter = () => {
    setFilterDateRange({ start: '', end: '' });
    setFilterKeyword('');
  };

  const handleEditLog = async () => {
    try {
      const { data, error } = await supabase
        .from('project_log')
        .update({
          log_date: editingLog.log_date,
          amount: parseFloat(editingLog.amount) || 0,
          amount_untaxed: parseFloat(editingLog.amount_untaxed) || 0,
          amount_taxed: parseFloat(editingLog.amount_taxed) || 0,
          personnel: (editingLog.personnel || '').trim(),
          work_item: (editingLog.work_item || '').trim(),
          work_scope: (editingLog.work_scope || '').trim(),
          warranty_years: parseFloat(editingLog.warranty_years) || 0,
          notes: (editingLog.notes || '').trim(),
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
      const logToDelete = projectLogs.find(log => log.log_id === deletingLogId);
      if (!logToDelete) { 
        alert('找不到要刪除的日誌記錄'); 
        return; 
      }

      // 刪除日誌
      const { error } = await supabase
        .from('project_log')
        .delete()
        .eq('log_id', deletingLogId);
      
      if (error) throw error;

      setProjectLogs(projectLogs.filter(log => log.log_id !== deletingLogId));
      setOpenDeleteLogDialog(false);
      setDeletingLogId(null);
    } catch (error) {
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
                    <Typography 
                      color="textSecondary"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
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
                  <Typography><strong>估價日期：</strong> {project.quote_date}</Typography>
                  <Typography><strong>施工天數：</strong> {project.construction_days}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography fontWeight="bold">施工範圍：</Typography>
                    {(() => {
                      const scope = project.construction_scope || '無';
                      const previewLength = 30;
                      const isLong = scope.length > previewLength;
                      const preview = isLong ? scope.slice(0, previewLength) + '...' : scope;

                      return (
                        <Typography
                          sx={{
                            ml: 1,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
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



                  {/* <Typography><strong>施工天數：</strong> {project.construction_days}</Typography> */}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>預計進場日期：</strong> {project.expected_start_date}</Typography>
                  {/* <Typography><strong>施工金額：</strong> ${project.construction_fee?.toLocaleString()}</Typography> */}
                  {/* 施工項目*/}
                  <Box sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      gap: 0.5,
                      mt: 0.5,
                      overflowX: 'auto',
                      maxWidth: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        fontWeight: 'bold',
                      }}
                    >
                      施工項目：
                    </Typography>

                    {(() => {
                      let items = [];

                      if (project.construction_items && Array.isArray(project.construction_items)) {
                        items = project.construction_items;
                      } else if (project.construction_item) {
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
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                              '& .MuiChip-label': { fontSize: '0.75rem', whiteSpace: 'nowrap' },
                            }}
                          />
                        ));
                      } else {
                        return (
                          <Typography
                            component="span"
                            color="textSecondary"
                            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            無
                          </Typography>
                        );
                      }
                    })()}
                  </Box>
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
                      <Typography 
                        color="textSecondary"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
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
                  placeholder="搜尋人員、施作工項、範圍或備註"
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
                  <TableCell width="10%">日期</TableCell>
                  <TableCell width="8%">金額</TableCell>
                  <TableCell width="8%">未稅</TableCell>
                  <TableCell width="8%">含稅</TableCell>
                  <TableCell width="10%">人員</TableCell>
                  <TableCell width="15%">施作工項</TableCell>
                  <TableCell width="15%">範圍</TableCell>
                  <TableCell width="8%">保固年限</TableCell>
                  <TableCell width="8%">建立者</TableCell>
                  <TableCell width="10%" align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell>{log.log_date}</TableCell>
                    <TableCell>
                      {log.amount > 0 ? `$${parseFloat(log.amount).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {log.amount_untaxed > 0 ? `$${parseFloat(log.amount_untaxed).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {log.amount_taxed > 0 ? `$${parseFloat(log.amount_taxed).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>{log.personnel || '-'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          maxWidth: '150px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflow: expandedLogId === log.log_id ? 'visible' : 'hidden',
                          textOverflow: expandedLogId === log.log_id ? 'clip' : 'ellipsis',
                          display: expandedLogId === log.log_id ? 'block' : '-webkit-box',
                          WebkitLineClamp: expandedLogId === log.log_id ? 'none' : 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                        title={log.work_item}
                      >
                        {log.work_item || '-'}
                      </Box>
                      {log.work_item && log.work_item.length > 20 && (
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                          onClick={() =>
                            setExpandedLogId(prev => (prev === log.log_id ? null : log.log_id))
                          }
                        >
                          {expandedLogId === log.log_id ? '收起' : '更多'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          maxWidth: '150px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflow: expandedLogId === log.log_id ? 'visible' : 'hidden',
                          textOverflow: expandedLogId === log.log_id ? 'clip' : 'ellipsis',
                          display: expandedLogId === log.log_id ? 'block' : '-webkit-box',
                          WebkitLineClamp: expandedLogId === log.log_id ? 'none' : 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                        title={log.work_scope}
                      >
                        {log.work_scope || '-'}
                      </Box>
                      {log.work_scope && log.work_scope.length > 20 && (
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                          onClick={() =>
                            setExpandedLogId(prev => (prev === log.log_id ? null : log.log_id))
                          }
                        >
                          {expandedLogId === log.log_id ? '收起' : '更多'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.warranty_years > 0 ? `${log.warranty_years}年` : '-'}
                    </TableCell>
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
                    <TableCell colSpan={10} align="center">
                      <Typography color="textSecondary">尚無日誌記錄</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      <ProjectLogDialog
        open={openLogDialog}
        onClose={() => setOpenLogDialog(false)}
        onSave={handleAddLog}
        logData={newLog}
        setLogData={setNewLog}
        mode="create"
      />

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

      <ProjectLogDialog
        open={openEditLogDialog}
        onClose={() => {
          setOpenEditLogDialog(false);
          setEditingLog(null);
        }}
        onSave={handleEditLog}
        logData={editingLog}
        setLogData={setEditingLog}
        mode="edit"
      />

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