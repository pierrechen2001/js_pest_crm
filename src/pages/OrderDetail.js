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
  Chip,
  InputAdornment,
} from '@mui/material';
import { Edit, Delete, ArrowBack, Add, Business, Receipt, LocationOn, Phone, Fax, Person, Note, Info, Build, Payment, ContactPhone, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

const constructionStatusOptions = ["未開始", "進行中", "已完成", "延遲", "估價", "取消"];
const billingStatusOptions = ["未請款", "部分請款", "已請款", "取消"];
const taiwanCities = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"];

// 狀態樣式函數
const getStatusStyle = (status, type) => {
  const statusColors = {
    construction: {
      "未開始": { bg: "#e3f2fd", color: "#1976d2" },
      "進行中": { bg: "#fff3e0", color: "#f57c00" },
      "已完成": { bg: "#e8f5e8", color: "#388e3c" },
      "延遲": { bg: "#ffebee", color: "#d32f2f" },
      "估價": { bg: "#f3e5f5", color: "#7b1fa2" },
      "取消": { bg: "#fafafa", color: "#616161" }
    },
    billing: {
      "未請款": { bg: "#e3f2fd", color: "#1976d2" },
      "部分請款": { bg: "#fff3e0", color: "#f57c00" },
      "已請款": { bg: "#e8f5e8", color: "#388e3c" },
      "取消": { bg: "#fafafa", color: "#616161" }
    }
  };
  
  return statusColors[type]?.[status] || { bg: "#fafafa", color: "#616161" };
};
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

const validLogTypes = ['工程', '財務', '行政', '藥劑'];

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
  const [openFinanceLogDialog, setOpenFinanceLogDialog] = useState(false);
  const [newLog, setNewLog] = useState({
    log_type: '工程',
    log_date: new Date().toISOString().split('T')[0],
    content: '',
    notes: '',
    medicine_id: '',
    medicine_quantity: ''
  });
  // 在 OrderDetail 組件內
  const [financeFields, setFinanceFields] = useState({
    invoice_number: '',
    amount_no_tax: '',
    tax: '',
    amount_with_tax: '',
    retention_invoice_issued: '否',
    retention_percent: '',
    retention_amount: '',
    taxManuallyChanged: false,
    amountWithTaxManuallyChanged: false,
    retentionAmountManuallyChanged: false
  });
  const [editedProject, setEditedProject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);

  const [medicines, setMedicines] = useState([]);

  const handleOpenProjectDialog = () => {
    // 準備編輯項目數據，確保 construction_items 有正確的格式
    let constructionItems = [];
    if (project.construction_items && Array.isArray(project.construction_items)) {
      constructionItems = project.construction_items;
    } else if (project.construction_item) {
      constructionItems = project.construction_item.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    setEditedProject({
      ...project,
      construction_items: constructionItems
    });
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
  
  // 新增：財務日誌編輯相關狀態
  const [openEditFinanceLogDialog, setOpenEditFinanceLogDialog] = useState(false);
  const [editingFinanceLog, setEditingFinanceLog] = useState(null);
  const [editFinanceFields, setEditFinanceFields] = useState({
    invoice_number: '',
    amount_no_tax: '',
    tax: '',
    amount_with_tax: '',
    retention_invoice_issued: '否',
    retention_percent: '',
    retention_amount: '',
    taxManuallyChanged: false,
    amountWithTaxManuallyChanged: false,
    retentionAmountManuallyChanged: false
  });
  const location = useLocation();
  const [trackType, setTrackType] = useState("month"); // "month" or "year"
  const [trackValue, setTrackValue] = useState(1);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [trackRefresh, setTrackRefresh] = useState(0);
  
  // 施工項目相關狀態
  const [constructionItemOptions, setConstructionItemOptions] = useState([
    "白蟻防治", "除蟲", "環境消毒", "清潔", "裝修", "維修", "檢測"
  ]);
  const [newConstructionItem, setNewConstructionItem] = useState("");
  const [constructionItemDialogOpen, setConstructionItemDialogOpen] = useState(false);
  
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
          .order('log_date', { ascending: true });

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

  // 處理施工項目選擇
  const handleConstructionItemChange = (event, newValue) => {
    setEditedProject(prev => ({
      ...prev,
      construction_items: newValue || [],
      construction_item: (newValue || []).join(", ") // 保持向後兼容性
    }));
  };

  // 新增自定義施工項目
  const handleAddConstructionItem = () => {
    if (newConstructionItem.trim() && !constructionItemOptions.includes(newConstructionItem.trim())) {
      const newItem = newConstructionItem.trim();
      setConstructionItemOptions(prev => [...prev, newItem]);
      const currentItems = editedProject.construction_items || [];
      setEditedProject(prev => ({
        ...prev,
        construction_items: [...currentItems, newItem],
        construction_item: [...currentItems, newItem].join(", ")
      }));
      setNewConstructionItem("");
      setConstructionItemDialogOpen(false);
    }
  };

  // 刪除施工項目
  const handleRemoveConstructionItem = (itemToRemove) => {
    setEditedProject(prev => {
      const updatedItems = (prev.construction_items || []).filter(item => item !== itemToRemove);
      return {
        ...prev,
        construction_items: updatedItems,
        construction_item: updatedItems.join(", ")
      };
    });
  };

  // const handleAddLog = async () => {
  //   try {
  //     // 驗證必填欄位
  //     if (!newLog.content) {
  //       alert('請輸入日誌內容！');
  //       return;
  //     }

  //     // 確保日誌類型是有效的值
  //     const validLogTypes = ['工程', '財務', '行政', '藥劑'];
  //     // 移除所有空白字符，包括空格、換行等
  //     const logType = newLog.log_type.replace(/\s+/g, '');
      
  //     console.log('=== 日誌類型追蹤 ===');
  //     console.log('表單中的原始值:', newLog.log_type);
  //     console.log('處理後的值:', logType);
  //     console.log('允許的值列表:', validLogTypes);
  //     console.log('是否在允許列表中:', validLogTypes.includes(logType));
  //     console.log('值的長度:', logType.length);
  //     console.log('值的字符編碼:', Array.from(logType).map(c => c.charCodeAt(0)));
      
  //     // 詳細比較每個字符
  //     console.log('=== 字符比較 ===');
  //     validLogTypes.forEach(validType => {
  //       console.log(`比較 "${logType}" 和 "${validType}":`);
  //       console.log('長度是否相同:', logType.length === validType.length);
  //       console.log('字符編碼比較:');
  //       Array.from(logType).forEach((char, i) => {
  //         console.log(`位置 ${i}: ${char}(${char.charCodeAt(0)}) vs ${validType[i]}(${validType[i]?.charCodeAt(0)})`);
  //       });
  //     });
  //     console.log('===================');

  //     // 確保值完全匹配資料庫約束
  //     if (!validLogTypes.includes(logType)) {
  //       const errorMessage = `無效的日誌類型！\n\n` +
  //         `您選擇的類型: "${logType}"\n` +
  //         `允許的類型: ${validLogTypes.join(', ')}\n\n` +
  //         '請選擇正確的日誌類型。\n\n' +
  //         '技術細節：\n' +
  //         `- 值的長度: ${logType.length}\n` +
  //         `- 字符編碼: ${Array.from(logType).map(c => c.charCodeAt(0)).join(', ')}\n\n` +
  //         '注意：如果您的選擇看起來正確但仍然失敗，請聯繫系統管理員更新資料庫約束。';
  //       console.error(errorMessage);
  //       alert(errorMessage);
  //       return;
  //     }

  //     if (logType === '藥劑') {
  //       if (!newLog.medicine_id || !newLog.medicine_quantity) {
  //         alert('請選擇藥劑並輸入使用數量！');
  //         return;
  //       }
  //     }

  //     // 準備日誌資料
  //     const logDataToInsert = {
  //       project_id: projectId,
  //       log_type: logType,
  //       log_date: newLog.log_date,
  //       content: newLog.content.trim(),
  //       notes: (newLog.notes || '').trim(),
  //       created_by: user?.name || '未知使用者'
  //     };

  //     // 如果是藥劑類型，將藥劑資訊加入內容中
  //     if (logType === '藥劑') {
  //       const selectedMedicine = medicines.find(m => m.id === newLog.medicine_id);
  //       if (!selectedMedicine) {
  //         alert('找不到選擇的藥劑！');
  //         return;
  //       }
  //       // 修改內容格式為 "藥劑種類-使用量"
  //       logDataToInsert.content = `${selectedMedicine.name}-${newLog.medicine_quantity}`;

  //       // 新增使用記錄到 medicine_usages
  //       const { error: usageError } = await supabase
  //         .from('medicine_usages')
  //         .insert([{
  //           medicine_id: newLog.medicine_id,
  //           quantity: parseFloat(newLog.medicine_quantity),
  //           date: newLog.log_date,
  //           project: project.project_name
  //         }]);

  //       if (usageError) {
  //         console.error('Error inserting usage:', usageError);
  //         throw new Error('新增藥劑使用記錄失敗：' + usageError.message);
  //       }
  //     }

  //     console.log('=== 準備插入的資料 ===');
  //     console.log('完整的插入資料:', JSON.stringify(logDataToInsert, null, 2));
  //     console.log('log_type 的最終值:', logDataToInsert.log_type);
  //     console.log('===================');

  //     // 插入日誌記錄
  //     const { data: insertedLog, error: logError } = await supabase
  //       .from('project_log')
  //       .insert([logDataToInsert])
  //       .select();

  //     if (logError) {
  //       console.error('Error inserting log:', logError);
  //       console.error('Failed data:', JSON.stringify(logDataToInsert, null, 2));
        
  //       // 更詳細的錯誤訊息
  //       let errorMessage = '新增日誌失敗！\n\n';
        
  //       if (logError.message.includes('project_log_log_type_check')) {
  //         errorMessage += '原因：日誌類型不符合資料庫要求\n\n' +
  //           `您選擇的類型: "${logDataToInsert.log_type}"\n` +
  //           `允許的類型: ${validLogTypes.join(', ')}\n\n` +
  //           '請選擇正確的日誌類型。\n\n' +
  //           '技術細節：\n' +
  //           `- 值的長度: ${logDataToInsert.log_type.length}\n` +
  //           `- 字符編碼: ${Array.from(logDataToInsert.log_type).map(c => c.charCodeAt(0)).join(', ')}`;
  //       } else {
  //         errorMessage += `錯誤訊息：${logError.message}\n\n` +
  //           '請檢查輸入的資料是否正確。';
  //       }
        
  //       throw new Error(errorMessage);
  //     }

  //     // 更新日誌列表
  //     setProjectLogs([insertedLog[0], ...projectLogs]);
      
  //     // 重置表單
  //     setOpenLogDialog(false);
  //     setNewLog({
  //       log_type: '工程',
  //       log_date: new Date().toISOString().split('T')[0],
  //       content: '',
  //       notes: '',
  //       medicine_id: '',
  //       medicine_quantity: ''
  //     });

  //   } catch (error) {
  //     console.error('Error in handleAddLog:', error);
  //     setError(error.message);
  //     alert(error.message);
  //   }
  // };

  const handleAddLog = async () => {
    try {
      // 基本驗證
      if (newLog.log_type === '藥劑') {
        if (!newLog.medicine_id || !newLog.medicine_quantity) {
          alert('請選擇藥劑並輸入使用數量！');
          return;
        }
      } else if (newLog.log_type !== '財務' && !newLog.content) {
        alert('請輸入日誌內容！');
        return;
      }

      // 組合 content
      let content = newLog.content;
      if (newLog.log_type === '財務') {
        content = `
          ${financeFields.invoice_number ? `<div><b>請款單編號：</b>${financeFields.invoice_number}</div>` : ''}
          ${financeFields.amount_no_tax ? `<div><b>本期請款金額（未稅）：</b>${financeFields.amount_no_tax}</div>` : ''}
          ${financeFields.tax ? `<div><b>稅金：</b>${financeFields.tax}</div>` : ''}
          ${financeFields.amount_with_tax ? `<div><b>本期請款金額（含稅）：</b>${financeFields.amount_with_tax}</div>` : ''}
          ${financeFields.retention_invoice_issued ? `<div><b>保留款發票已開：</b>${financeFields.retention_invoice_issued}</div>` : ''}
          ${financeFields.retention_percent ? `<div><b>保留款%數：</b>${financeFields.retention_percent}</div>` : ''}
          ${financeFields.retention_amount ? `<div><b>保留款金額：</b>${financeFields.retention_amount}</div>` : ''}
        `.replace(/^\s+/gm, '');
      } else if (newLog.log_type === '藥劑') {
        const selectedMedicine = medicines.find(m => m.id === newLog.medicine_id);
        if (!selectedMedicine) {
          alert('找不到選擇的藥劑！');
          return;
        }
        content = `${selectedMedicine.name}-${newLog.medicine_quantity}`;
        // 新增藥劑使用記錄
        await supabase
          .from('medicine_usages')
          .insert([{
            medicine_id: newLog.medicine_id,
            quantity: parseFloat(newLog.medicine_quantity),
            date: newLog.log_date,
            project: project.project_name
          }]);
      }

      // 準備要插入的資料
      const logDataToInsert = {
        project_id: projectId,
        log_type: newLog.log_type,
        log_date: newLog.log_date,
        content: content.trim(),
        notes: (newLog.notes || '').trim(),
        created_by: user?.name || '未知使用者'
      };

      // 寫入資料庫
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
      setFinanceFields({
        invoice_number: '',
        amount_no_tax: '',
        tax: '',
        amount_with_tax: '',
        retention_invoice_issued: '否',
        retention_percent: '',
        retention_amount: ''
      });
    } catch (error) {
      console.error('Error in handleAddLog:', error);
      setError(error.message);
      alert(error.message);
    }
  };

  const handleAddFinanceLog = async () => {
    try {
      // 驗證必填欄位
      if (!financeFields.invoice_number) {
        alert('請輸入請款單編號！');
        return;
      }

      // 確認 projectId 是否正確獲取
      if (!projectId) {
        console.error('無法新增財務日誌：projectId 未定義');
        alert('無法新增財務日誌，因為專案 ID 未定義');
        return;
      }

      console.log('當前的 projectId:', projectId);

      // 插入到 finance_logs 表
      const financeData = {
        project_id: projectId, // 確保這裡的 projectId 是有效的 UUID
        log_date: newLog.log_date,
        invoice_number: financeFields.invoice_number,
        amount_no_tax: parseFloat(financeFields.amount_no_tax) || null,
        tax: parseFloat(financeFields.tax) || null,
        amount_with_tax: parseFloat(financeFields.amount_with_tax) || null,
        retention_invoice_issued: financeFields.retention_invoice_issued === '是',
        retention_percent: parseFloat(financeFields.retention_percent) || null,
        retention_amount: parseFloat(financeFields.retention_amount) || null,
        tax_manually_changed: financeFields.taxManuallyChanged || false,
        amount_with_tax_manually_changed: financeFields.amountWithTaxManuallyChanged || false,
        retention_amount_manually_changed: financeFields.retentionAmountManuallyChanged || false,
      };

      // 檢查必填欄位是否存在
      if (!financeData.project_id) {
        console.error('插入失敗：缺少 project_id', financeData);
        alert('無法新增財務日誌，缺少 project_id');
        return;
      }

      // 確保其他必要欄位不為 undefined
      const requiredFields = ['invoice_number', 'amount_no_tax', 'tax', 'amount_with_tax'];
      for (const field of requiredFields) {
        if (financeData[field] === undefined) {
          console.error(`插入失敗：缺少必要欄位 ${field}`, financeData);
          alert(`無法新增財務日誌，缺少必要欄位：${field}`);
          return;
        }
      }

      console.log('準備插入的財務日誌資料:', financeData);

      const { data: insertedData, error: financeError } = await supabase
        .from('finance_logs')
        .insert([financeData]);

      if (financeError) {
        console.error('插入財務日誌失敗:', financeError);
        console.error('錯誤詳細信息:', financeError.details);
        console.error('錯誤提示:', financeError.hint);
        console.error('插入失敗的資料:', financeData);
        alert('財務日誌新增失敗：' + financeError.message);
        return;
      }

      console.log('插入成功的資料:', insertedData);

      alert('財務日誌新增成功');
      setOpenFinanceLogDialog(false); // 關閉對話框
      setFinanceFields({}); // 清空表單
    } catch (error) {
      console.error('Error in handleAddFinanceLog:', error);
      alert('財務日誌新增失敗：' + error.message);
    }
  };
  

  // 新增：處理財務日誌編輯
  const handleEditFinanceLog = async () => {
    try {
      // 驗證必填欄位
      if (!editFinanceFields.invoice_number) {
        alert('請輸入請款單編號！');
        return;
      }

      // 更新財務日誌內容
      const updateData = {
        project_id: projectId,
        log_date: editingFinanceLog.log_date,
        invoice_number: editFinanceFields.invoice_number,
        amount_no_tax: parseFloat(editFinanceFields.amount_no_tax) || null,
        tax: parseFloat(editFinanceFields.tax) || null,
        amount_with_tax: parseFloat(editFinanceFields.amount_with_tax) || null,
        retention_invoice_issued: editFinanceFields.retention_invoice_issued === '是',
        retention_percent: parseFloat(editFinanceFields.retention_percent) || null,
        retention_amount: parseFloat(editFinanceFields.retention_amount) || null,
        tax_manually_changed: editFinanceFields.taxManuallyChanged || false,
        amount_with_tax_manually_changed: editFinanceFields.amountWithTaxManuallyChanged || false,
        retention_amount_manually_changed: editFinanceFields.retentionAmountManuallyChanged || false,
      };

      const { data, error } = await supabase
        .from('finance_logs')
        .update(updateData)
        .eq('id', editingFinanceLog.id) // 假設 `id` 是 `finance_logs` 的主鍵
        .select();

      if (error) throw error;

      // 更新日誌並重新排序以保持時間順序
      const updatedLogs = projectLogs.map(log => 
        log.id === editingFinanceLog.id ? data[0] : log
      ).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

      setProjectLogs(updatedLogs);
      setOpenEditFinanceLogDialog(false);
      setEditingFinanceLog(null);
      setEditFinanceFields({
        invoice_number: '',
        amount_no_tax: '',
        tax: '',
        amount_with_tax: '',
        retention_invoice_issued: '否',
        retention_percent: '',
        retention_amount: '',
        taxManuallyChanged: false,
        amountWithTaxManuallyChanged: false,
        retentionAmountManuallyChanged: false
      });

      alert('財務日誌更新成功');
    } catch (error) {
      console.error('Error updating finance log:', error);
      setError('更新財務日誌時發生錯誤：' + error.message);
      alert('財務日誌更新失敗：' + error.message);
    }
  };

  // 新增：開啟財務日誌編輯對話框
  const handleOpenEditFinanceLog = (log) => {
    if (!log.project_id) {
      alert('無法編輯財務日誌，因為缺少有效的專案 ID！');
      return;
    }
    setEditingFinanceLog(log);
    
    // 從資料庫欄位載入財務資料，如果沒有則從 content 解析
    const financeData = {
      invoice_number: log.invoice_number || '',
      amount_no_tax: log.amount_no_tax ? log.amount_no_tax.toString() : '',
      tax: log.tax ? log.tax.toString() : '',
      amount_with_tax: log.amount_with_tax ? log.amount_with_tax.toString() : '',
      retention_invoice_issued: log.retention_invoice_issued ? '是' : '否',
      retention_percent: log.retention_percent ? log.retention_percent.toString() : '',
      retention_amount: log.retention_amount ? log.retention_amount.toString() : '',
      taxManuallyChanged: log.tax_manually_changed || false,
      amountWithTaxManuallyChanged: log.amount_with_tax_manually_changed || false,
      retentionAmountManuallyChanged: log.retention_amount_manually_changed || false
    };

    // 如果資料庫欄位為空，嘗試從 content 解析（向後兼容性）
    if (!financeData.invoice_number && log.content) {
      const parseFinanceContent = (content) => {
        const extractValue = (fieldName) => {
          const regex = new RegExp(`<b>${fieldName}：?</b>([^<]+)`, 'i');
          const match = content.match(regex);
          return match ? match[1].trim() : '';
        };

        return {
          invoice_number: extractValue('請款單編號'),
          amount_no_tax: extractValue('本期請款金額（未稅）'),
          tax: extractValue('稅金'),
          amount_with_tax: extractValue('本期請款金額（含稅）'),
          retention_invoice_issued: extractValue('保留款發票已開'),
          retention_percent: extractValue('保留款%數'),
          retention_amount: extractValue('保留款金額'),
          taxManuallyChanged: false,
          amountWithTaxManuallyChanged: false,
          retentionAmountManuallyChanged: false
        };
      };

      const parsedData = parseFinanceContent(log.content);
      Object.assign(financeData, parsedData);
    }

    setEditFinanceFields(financeData);
    setOpenEditFinanceLogDialog(true);
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
        construction_items: editedProject.construction_items || [], // 添加多選施工項目
        construction_fee: parseFloat(editedProject.construction_fee),
        start_date: editedProject.start_date,
        end_date: editedProject.end_date,
        construction_days: editedProject.construction_days,
        construction_scope: editedProject.construction_scope,
        project_notes: editedProject.project_notes,
        payment_method: editedProject.payment_method,
        payment_date: editedProject.payment_date,
        construction_fee: parseFloat(editedProject.construction_fee) || null,
        fee: parseFloat(editedProject.fee) || null,
        payer: editedProject.payer,
        payee: editedProject.payee,
        check_number: editedProject.check_number,
        bank_branch: editedProject.bank_branch,
        due_date: editedProject.due_date,
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
    // 排除財務日誌，財務日誌在獨立區塊顯示
    if (log.log_type === '財務') return false;
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

      // 更新日誌並重新排序以保持時間順序
      const updatedLogs = projectLogs.map(log => 
        log.log_id === editingLog.log_id ? data[0] : log
      ).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
      
      setProjectLogs(updatedLogs);
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
                <Person sx={{ mr: 1, color: 'primary' }} />
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
                  <Typography><strong>開始日期：</strong> {project.start_date}</Typography>
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
                  <Typography><strong>收款金額：</strong> ${project.construction_fee?.toLocaleString()}</Typography>
                  <Typography><strong>結清日期：</strong> {project.payment_date}</Typography>
                  {project.payment_method === '匯款' && (
                    <Typography><strong>匯款手續費：</strong> ${project.fee?.toLocaleString()}</Typography>
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

      <Dialog
        open={openEditProjectDialog}
        onClose={handleCloseProjectDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>編輯專案資訊</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>基本資訊</Typography>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <TextField
              name="project_name"
              label="專案名稱"
              fullWidth
              value={editedProject.project_name || ''}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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
          </div>

          <Typography variant="h6" gutterBottom>聯絡人資訊</Typography>
          
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: "20px" }}>
              <Typography variant="subtitle1" gutterBottom>聯絡人 {i}</Typography>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <TextField
                  label="職位"
                  fullWidth
                  name={`contact${i}_role`}
                  value={editedProject[`contact${i}_role`] || ''}
                  onChange={handleChange}
                />
                <TextField
                  label="名字"
                  fullWidth
                  name={`contact${i}_name`}
                  value={editedProject[`contact${i}_name`] || ''}
                  onChange={handleChange}
                />
                <FormControl fullWidth>
                  <InputLabel>聯絡方式類型</InputLabel>
                  <Select
                    name={`contact${i}_type`}
                    value={editedProject[`contact${i}_type`] || ''}
                    onChange={handleChange}
                  >
                    {["電話", "市話", "LineID", "Email"].map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label={editedProject[`contact${i}_type`] || "聯絡方式"}
                  fullWidth
                  name={`contact${i}_contact`}
                  value={editedProject[`contact${i}_contact`] || ''}
                  onChange={(e) => {
                    let formattedValue = e.target.value;
                    const contactType = editedProject[`contact${i}_type`];

                    if (contactType === "電話") {
                      formattedValue = formattedValue
                        .replace(/[^\d]/g, "")
                        .replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                    } else if (contactType === "市話") {
                      formattedValue = formattedValue
                        .replace(/[^\d]/g, "")
                        .replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                    }

                    handleChange({
                      target: {
                        name: `contact${i}_contact`,
                        value: formattedValue
                      }
                    });
                  }}
                />
              </div>
            </div>
          ))}

          <Typography variant="h6" gutterBottom>施工資訊</Typography>

          {/* 施工地址 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <Autocomplete
                options={taiwanCities}
                renderInput={(params) => <TextField {...params} label="施工縣市" fullWidth />}
                value={editedProject.site_city || ''}
                onChange={(event, newValue) => handleCityChange(newValue)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Autocomplete
                options={taiwanDistricts[editedProject.site_city] || []}
                renderInput={(params) => <TextField {...params} label="施工區域" fullWidth />}
                value={editedProject.site_district || ''}
                onChange={(event, newValue) => handleDistrictChange(newValue)}
              />
            </div>
            <div style={{ flex: 3 }}>
              <TextField
                name="site_address"
                label="施工地址"
                fullWidth
                value={editedProject.site_address || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              name="start_date"
              label="開始日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={editedProject.start_date || ''}
              onChange={handleChange}
            />
            <TextField
              name="end_date"
              label="結束日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={editedProject.end_date || ''}
              onChange={handleChange}
            />
          </div>

          {/* 施工項目多選 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>施工項目</Typography>
            <Autocomplete
              multiple
              options={constructionItemOptions}
              value={editedProject.construction_items || []}
              onChange={handleConstructionItemChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    onDelete={() => handleRemoveConstructionItem(option)}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="選擇或輸入施工項目"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setConstructionItemDialogOpen(true)}
                            size="small"
                          >
                            <Add />
                          </IconButton>
                        </InputAdornment>
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* 新增施工天數、施工範圍、注意事項 */}
          <TextField
            name="construction_days"
            label="施工天數"
            type="number"
            fullWidth
            margin="normal"
            value={editedProject.construction_days || ''}
            onChange={handleChange}
          />
          <TextField
            name="construction_scope"
            label="施工範圍"
            fullWidth
            margin="normal"
            value={editedProject.construction_scope || ''}
            onChange={handleChange}
          />
          <TextField
            name="project_notes"
            label="注意事項"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={editedProject.project_notes || ''}
            onChange={handleChange}
          />

          <Typography variant="h6" gutterBottom>收款資訊</Typography>

          {/* 收款方式和結清日期 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <FormControl fullWidth>
              <InputLabel>收款方式</InputLabel>
              <Select
                name="payment_method"
                value={editedProject.payment_method || ''}
                onChange={handleChange}
              >
                <MenuItem value="現金">現金</MenuItem>
                <MenuItem value="匯款">匯款</MenuItem>
                <MenuItem value="支票">支票</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="payment_date"
              label="結清日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={editedProject.payment_date || ''}
              onChange={handleChange}
            />
          </div>

          {/* 收款金額 */}
          <TextField
            name="construction_fee"
            label="收款金額"
            type="number"
            fullWidth
            margin="normal"
            value={editedProject.construction_fee || ''}
            onChange={handleChange}
          />

          {/* 匯款手續費 */}
          {editedProject.payment_method === '匯款' && (
            <TextField
              name="fee"
              label="匯款手續費"
              type="number"
              fullWidth
              margin="normal"
              value={editedProject.fee || ''}
              onChange={handleChange}
            />
          )}

          {/* 支票相關資訊 */}
          {editedProject.payment_method === '支票' && (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <TextField
                  name="payer"
                  label="付款人"
                  fullWidth
                  value={editedProject.payer || ''}
                  onChange={handleChange}
                />
                <FormControl fullWidth>
                  <InputLabel>收款人</InputLabel>
                  <Select
                    name="payee"
                    value={editedProject.payee || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="中星">中星</MenuItem>
                    <MenuItem value="建興">建興</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <TextField
                  name="check_number"
                  label="支票號碼"
                  fullWidth
                  value={editedProject.check_number || ''}
                  onChange={handleChange}
                />
                <TextField
                  name="bank_branch"
                  label="銀行分行"
                  fullWidth
                  value={editedProject.bank_branch || ''}
                  onChange={handleChange}
                />
                <TextField
                  name="due_date"
                  label="到期日"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={editedProject.due_date || ''}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDialog}>取消</Button>
          <Button onClick={handleUpdateProject} variant="contained" color="primary">儲存</Button>
        </DialogActions>
      </Dialog>

      {/* 專案日誌區塊 (排除財務日誌) */}
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
                    <MenuItem value="行政">行政</MenuItem>
                    <MenuItem value="藥劑">藥劑</MenuItem>
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
                  <TableCell width="10%" sx={{ textAlign: 'center', padding: '8px' }}>類型</TableCell>
                  <TableCell width="12%" sx={{ textAlign: 'center', padding: '8px' }}>日期</TableCell>
                  <TableCell width="35%" sx={{ textAlign: 'center', padding: '8px' }}>內容</TableCell>
                  <TableCell width="15%" sx={{ textAlign: 'center', padding: '8px' }}>備註</TableCell>
                  <TableCell width="12%" sx={{ textAlign: 'center', padding: '8px' }}>建立者</TableCell>
                  <TableCell width="15%" sx={{ textAlign: 'center', padding: '8px' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell sx={{ textAlign: 'center', padding: '8px' }}>
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
                    <TableCell sx={{ textAlign: 'center', padding: '8px' }}>{log.log_date}</TableCell>
                    <TableCell sx={{ textAlign: 'center', padding: '8px' }}>
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
                    <TableCell sx={{ textAlign: 'center', padding: '8px' }}>{log.notes}</TableCell>
                    <TableCell sx={{ textAlign: 'center', padding: '8px' }}>{log.created_by}</TableCell>
                    <TableCell sx={{ textAlign: 'center', padding: '8px' }}>
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

      {/* 財務日誌區塊 */}
      <Box mt={3}>
        <Card sx={{ borderRadius: 2, p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold" color="primary">財務日誌</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpenFinanceLogDialog(true)}
              sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
            >
              新增財務日誌
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {(() => {
            const financeLogss = projectLogs.filter(log => log.log_type === '財務');
            if (financeLogss.length === 0) {
              return (
                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                  尚無財務日誌記錄
                </Typography>
              );
            }

            return (
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(46, 125, 50, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center'  }}>日期</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center'  }}>請款單編號</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '8%' }}>未稅金額</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '6%' }}>稅金</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '8%' }}>含稅金額</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '12%', textAlign: 'center'  }}>保留款發票已開</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center'  }}>保留款%數</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>保留款金額</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center'  }}>建立者</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '10%' }} align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {financeLogss.map((log) => {
                      // 優先使用資料庫欄位，如果沒有則解析財務日誌內容
                      const getFinanceData = (log) => {
                        // 如果有資料庫欄位，直接使用
                        if (log.invoice_number) {
                          return {
                            invoice_number: log.invoice_number,
                            amount_no_tax: log.amount_no_tax,
                            tax: log.tax,
                            amount_with_tax: log.amount_with_tax,
                            retention_invoice_issued: log.retention_invoice_issued ? '是' : '否',
                            retention_percent: log.retention_percent,
                            retention_amount: log.retention_amount
                          };
                        }

                        // 否則從 content 解析（向後兼容性）
                        const result = {
                          invoice_number: '',
                          amount_no_tax: '',
                          tax: '',
                          amount_with_tax: '',
                          retention_invoice_issued: '',
                          retention_percent: '',
                          retention_amount: ''
                        };

                        if (!log.content) return result;

                        // 使用正則表達式提取各個字段
                        const extractValue = (fieldName) => {
                          const regex = new RegExp(`<b>${fieldName}：?</b>([^<]+)`, 'i');
                          const match = log.content.match(regex);
                          return match ? match[1].trim() : '';
                        };

                        result.invoice_number = extractValue('請款單編號');
                        result.amount_no_tax = extractValue('本期請款金額（未稅）');
                        result.tax = extractValue('稅金');
                        result.amount_with_tax = extractValue('本期請款金額（含稅）');
                        result.retention_invoice_issued = extractValue('保留款發票已開');
                        result.retention_percent = extractValue('保留款%數');
                        result.retention_amount = extractValue('保留款金額');

                        return result;
                      };

                      const financeData = getFinanceData(log);

                      return (
                        <TableRow key={log.log_id} sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.02)' } }}>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{log.log_date}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{financeData.invoice_number}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            {financeData.amount_no_tax ? `$${Number(financeData.amount_no_tax).toLocaleString()}` : ''}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            {financeData.tax ? `$${Number(financeData.tax).toLocaleString()}` : ''}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            {financeData.amount_with_tax ? `$${Number(financeData.amount_with_tax).toLocaleString()}` : ''}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', textAlign: 'center' }}>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                backgroundColor: financeData.retention_invoice_issued === '是' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                color: financeData.retention_invoice_issued === '是' ? 'rgb(76, 175, 80)' : 'rgb(255, 152, 0)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                            >
                              {financeData.retention_invoice_issued}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', textAlign: 'center' }}>
                            {financeData.retention_percent ? `${financeData.retention_percent}%` : ''}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            {financeData.retention_amount ? `$${Number(financeData.retention_amount).toLocaleString()}` : ''}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', textAlign: 'center'}}>{log.created_by}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditFinanceLog(log)}
                              sx={{ mr: 0.5 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeletingLogId(log.log_id);
                                setOpenDeleteLogDialog(true);
                              }}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            );
          })()}
        </Card>
      </Box>

      <Dialog
        open={openLogDialog}
        onClose={() => setOpenLogDialog(false)}
        maxWidth="md"
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
          {newLog.log_type === '財務' ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Typography sx={{ mb: 1 }}>財務資訊</Typography>
              <Grid container spacing={1} wrap="nowrap">
                <Grid item sx={{ minWidth: 200 }}>
                  <TextField
                    label="請款單編號"
                    fullWidth
                    value={financeFields.invoice_number}
                    onChange={e => setFinanceFields(f => ({ ...f, invoice_number: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="本期請款金額（未稅）"
                    type="number"
                    fullWidth
                    value={financeFields.amount_no_tax}
                    onChange={e => {
                      const value = e.target.value;
                      // 自動計算稅金與含稅金額
                      setFinanceFields(f => ({
                        ...f,
                        amount_no_tax: value,
                        // 只有當使用者沒手動改過 tax/amount_with_tax 才自動計算
                        tax: f.taxManuallyChanged ? f.tax : value ? (parseFloat(value) * 0.05).toFixed(0) : '',
                        amount_with_tax: f.amountWithTaxManuallyChanged ? f.amount_with_tax : value ? (parseFloat(value) * 1.05).toFixed(0) : '',
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="稅金"
                    type="number"
                    fullWidth
                    value={financeFields.tax}
                    onChange={e => {
                      const value = e.target.value;
                      setFinanceFields(f => ({
                        ...f,
                        tax: value,
                        taxManuallyChanged: true
                      }));
                    }}
                    onBlur={() => {
                      // 若清空則恢復自動計算
                      setFinanceFields(f => ({
                        ...f,
                        taxManuallyChanged: !(!f.tax)
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="本期請款金額（含稅）"
                    type="number"
                    fullWidth
                    value={financeFields.amount_with_tax}
                    onChange={e => {
                      const value = e.target.value;
                      setFinanceFields(f => ({
                        ...f,
                        amount_with_tax: value,
                        amountWithTaxManuallyChanged: true
                      }));
                    }}
                    onBlur={() => {
                      setFinanceFields(f => ({
                        ...f,
                        amountWithTaxManuallyChanged: !(!f.amount_with_tax)
                      }));
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4} sx={{ mt: 2 }}>
                  <FormControl fullWidth sx={{ minWidth: 150 }}>
                    <InputLabel>保留款發票已開</InputLabel>
                    <Select
                      value={financeFields.retention_invoice_issued}
                      label="保留款發票已開"
                      onChange={e => setFinanceFields(f => ({ ...f, retention_invoice_issued: e.target.value }))}
                    >
                      <MenuItem value="是">是</MenuItem>
                      <MenuItem value="否">否</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3} sx={{ mt: 2 }}>
                  <TextField
                    label="保留款%數"
                    type="number"
                    fullWidth
                    value={financeFields.retention_percent}
                    onChange={e => {
                      const value = e.target.value;
                      setFinanceFields(f => {
                        // 自動算保留款金額（如果沒手動改過）
                        let autoRetentionAmount = f.retentionAmountManuallyChanged
                          ? f.retention_amount
                          : (f.amount_with_tax && value)
                            ? (parseFloat(f.amount_with_tax) * parseFloat(value) / 100).toFixed(0)
                            : '';
                        return {
                          ...f,
                          retention_percent: value,
                          retention_amount: autoRetentionAmount
                        };
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={3} sx={{ mt: 2 }}>
                  <TextField
                    label="保留款金額"
                    type="number"
                    fullWidth
                    value={financeFields.retention_amount}
                    onChange={e => {
                      const value = e.target.value;
                      setFinanceFields(f => ({
                        ...f,
                        retention_amount: value,
                        retentionAmountManuallyChanged: true
                      }));
                    }}
                    onBlur={() => {
                      setFinanceFields(f => ({
                        ...f,
                        retentionAmountManuallyChanged: !(!f.retention_amount)
                      }));
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography sx={{ mb: 1 }}>內容</Typography>
              <ReactQuill
                theme="snow"
                value={newLog.content}
                onChange={(value) => setNewLog({ ...newLog, content: value })}
                style={{ height: '200px', backgroundColor: 'white' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogDialog(false)}>取消</Button>
          <Button 
            onClick={handleAddLog} 
            variant="contained" 
            color="primary"
            disabled={
            (newLog.log_type === '藥劑' && (!newLog.medicine_id || !newLog.medicine_quantity))||
            (newLog.log_type !== '財務' && newLog.log_type !== '藥劑' && !newLog.content)}
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

      {/* 財務日誌對話框 */}
      <Dialog
        open={openFinanceLogDialog}
        onClose={() => setOpenFinanceLogDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>新增財務日誌</DialogTitle>
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

            {/* 備註 */}
            <Box sx={{ flex: 5 }}>
              <TextField
                fullWidth
                label="備註"
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                margin="normal"
              />
            </Box>
          </Grid>

          {/* 財務資訊輸入區 */}
          <Box sx={{ overflowX: 'auto' }}>
            <Typography sx={{ mb: 1 }}>財務資訊</Typography>
            <Grid container spacing={1} wrap="nowrap">
              <Grid item sx={{ minWidth: 200 }}>
                <TextField
                  label="請款單編號"
                  fullWidth
                  value={financeFields.invoice_number}
                  onChange={e => setFinanceFields(f => ({ ...f, invoice_number: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="本期請款金額（未稅）"
                  type="number"
                  fullWidth
                  value={financeFields.amount_no_tax}
                  onChange={e => {
                    const value = e.target.value;
                    setFinanceFields(f => ({
                      ...f,
                      amount_no_tax: value,
                      // 自動計算稅金與含稅金額
                      tax: f.taxManuallyChanged ? f.tax : value ? (parseFloat(value) * 0.05).toFixed(0) : '',
                      amount_with_tax: f.amountWithTaxManuallyChanged ? f.amount_with_tax : value ? (parseFloat(value) * 1.05).toFixed(0) : '',
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="稅金"
                  type="number"
                  fullWidth
                  value={financeFields.tax}
                  onChange={e => {
                    const value = e.target.value;
                    setFinanceFields(f => ({
                      ...f,
                      tax: value,
                      taxManuallyChanged: true
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="本期請款金額（含稅）"
                  type="number"
                  fullWidth
                  value={financeFields.amount_with_tax}
                  onChange={e => {
                    const value = e.target.value;
                    setFinanceFields(f => ({
                      ...f,
                      amount_with_tax: value,
                      amountWithTaxManuallyChanged: true
                    }));
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4} sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel>保留款發票已開</InputLabel>
                  <Select
                    value={financeFields.retention_invoice_issued}
                    label="保留款發票已開"
                    onChange={e => setFinanceFields(f => ({ ...f, retention_invoice_issued: e.target.value }))}
                  >
                    <MenuItem value="是">是</MenuItem>
                    <MenuItem value="否">否</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3} sx={{ mt: 2 }}>
                <TextField
                  label="保留款%數"
                  type="number"
                  fullWidth
                  value={financeFields.retention_percent}
                  onChange={e => {
                    const value = e.target.value;
                    setFinanceFields(f => {
                      // 自動算保留款金額（如果沒手動改過）
                      let autoRetentionAmount = f.retentionAmountManuallyChanged
                        ? f.retention_amount
                        : (f.amount_with_tax && value)
                          ? (parseFloat(f.amount_with_tax) * parseFloat(value) / 100).toFixed(0)
                          : '';
                      return {
                        ...f,
                        retention_percent: value,
                        retention_amount: autoRetentionAmount
                      };
                    });
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3} sx={{ mt: 2 }}>
                <TextField
                  label="保留款金額"
                  type="number"
                  fullWidth
                  value={financeFields.retention_amount}
                  onChange={e => {
                    const value = e.target.value;
                    setFinanceFields(f => ({
                      ...f,
                      retention_amount: value,
                      retentionAmountManuallyChanged: true
                    }));
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinanceLogDialog(false)}>取消</Button>
          <Button 
            onClick={handleAddFinanceLog} 
            variant="contained" 
            color="primary"
          >
            儲存財務日誌
          </Button>
        </DialogActions>
      </Dialog>

      {/* 編輯財務日誌對話框 */}
      <Dialog
        open={openEditFinanceLogDialog}
        onClose={() => setOpenEditFinanceLogDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>編輯財務日誌</DialogTitle>
        <DialogContent>
          <Grid container alignItems="center" sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
            {/* 日期 */}
            <Box sx={{ flex: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="日期"
                value={editingFinanceLog?.log_date || ''}
                onChange={(e) => setEditingFinanceLog(prev => ({ ...prev, log_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Box>

            {/* 備註 */}
            <Box sx={{ flex: 5 }}>
              <TextField
                fullWidth
                label="備註"
                value={editingFinanceLog?.notes || ''}
                onChange={(e) => setEditingFinanceLog(prev => ({ ...prev, notes: e.target.value }))}
                margin="normal"
              />
            </Box>
          </Grid>

          {/* 財務資訊輸入區 */}
          <Box sx={{ overflowX: 'auto' }}>
            <Typography sx={{ mb: 1 }}>財務資訊</Typography>
            <Grid container spacing={1} wrap="nowrap">
              <Grid item sx={{ minWidth: 200 }}>
                <TextField
                  label="請款單編號"
                  fullWidth
                  value={editFinanceFields.invoice_number}
                  onChange={e => setEditFinanceFields(f => ({ ...f, invoice_number: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="本期請款金額（未稅）"
                  type="number"
                  fullWidth
                  value={editFinanceFields.amount_no_tax}
                  onChange={e => {
                    const value = e.target.value;
                    setEditFinanceFields(f => ({
                      ...f,
                      amount_no_tax: value,
                      tax: f.taxManuallyChanged ? f.tax : value ? (parseFloat(value) * 0.05).toFixed(0) : '',
                      amount_with_tax: f.amountWithTaxManuallyChanged ? f.amount_with_tax : value ? (parseFloat(value) * 1.05).toFixed(0) : '',
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="稅金"
                  type="number"
                  fullWidth
                  value={editFinanceFields.tax}
                  onChange={e => {
                    const value = e.target.value;
                    setEditFinanceFields(f => ({
                      ...f,
                      tax: value,
                      taxManuallyChanged: true
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="本期請款金額（含稅）"
                  type="number"
                  fullWidth
                  value={editFinanceFields.amount_with_tax}
                  onChange={e => {
                    const value = e.target.value;
                    setEditFinanceFields(f => ({
                      ...f,
                      amount_with_tax: value,
                      amountWithTaxManuallyChanged: true
                    }));
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4} sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel>保留款發票已開</InputLabel>
                  <Select
                    value={editFinanceFields.retention_invoice_issued}
                    label="保留款發票已開"
                    onChange={e => setEditFinanceFields(f => ({ ...f, retention_invoice_issued: e.target.value }))}
                  >
                    <MenuItem value="是">是</MenuItem>
                    <MenuItem value="否">否</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mt: 2 }}>
                <TextField
                  label="保留款%數"
                  type="number"
                  fullWidth
                  value={editFinanceFields.retention_percent}
                  onChange={e => {
                    const value = e.target.value;
                    setEditFinanceFields(f => ({
                      ...f,
                      retention_percent: value,
                      retention_amount: f.retentionAmountManuallyChanged ? f.retention_amount : 
                        (value && f.amount_with_tax) ? (parseFloat(f.amount_with_tax) * (parseFloat(value) / 100)).toFixed(0) : ''
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4} sx={{ mt: 2 }}>
                <TextField
                  label="保留款金額"
                  type="number"
                  fullWidth
                  value={editFinanceFields.retention_amount}
                  onChange={e => {
                    const value = e.target.value;
                    setEditFinanceFields(f => ({
                      ...f,
                      retention_amount: value,
                      retentionAmountManuallyChanged: true
                    }));
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditFinanceLogDialog(false)}>取消</Button>
          <Button 
            onClick={handleEditFinanceLog} 
            variant="contained" 
            color="primary"
          >
            更新財務日誌
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

      {/* 新增自定義施工項目對話框 */}
      <Dialog
        open={constructionItemDialogOpen}
        onClose={() => setConstructionItemDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>新增施工項目</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="施工項目名稱"
            fullWidth
            variant="outlined"
            value={newConstructionItem}
            onChange={(e) => setNewConstructionItem(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConstructionItemDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleAddConstructionItem}
            variant="contained"
            disabled={!newConstructionItem.trim() || constructionItemOptions.includes(newConstructionItem.trim())}
          >
            新增
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    
  );
}