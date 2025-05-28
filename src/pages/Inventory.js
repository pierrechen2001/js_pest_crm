import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Autocomplete, CircularProgress, Typography, TablePagination, Tabs, Tab } from "@mui/material";
import { Add } from "@mui/icons-material";
import { supabase } from '../lib/supabaseClient';

const statusOptions = ["正常", "維修中", "報廢"]

const Inventory = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 新增耗材的狀態
  const [newMaterial, setNewMaterial] = useState({
    material_type_id: "",
    name: "",
    status: "正常",
    last_maintenance: null,
    unit_price: "",
    invoice_number: "",
    vendor: ""
  });

  // 新增藥劑的狀態
  const [newMedicine, setNewMedicine] = useState({
    name: ""
  });

  // 新增藥劑的編輯狀態
  const [editingMedicine, setEditingMedicine] = useState(null);

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [newOrder, setNewOrder] = useState({
    quantity: 0,
    date: "",
    vendor: "",
    unit_price: "",
    invoice_number: ""
  });
  const [newUsage, setNewUsage] = useState({
    quantity: 0,
    date: "",
    project: "",
    customer: ""
  });

  // 獲取專案資料
  const [projects, setProjects] = useState([]);

  const [viewHistoryDialogOpen, setViewHistoryDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [historyType, setHistoryType] = useState('usage'); // 'usage' 或 'order'

  // 新增編輯記錄的狀態
  const [editingRecord, setEditingRecord] = useState(null);
  const [editRecordDialogOpen, setEditRecordDialogOpen] = useState(false);

  // 獲取資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 獲取耗材種類
        const { data: typesData, error: typesError } = await supabase
          .from('material_types')
          .select('*');

        if (typesError) throw typesError;
        setMaterialTypes(typesData || []);

        // 獲取耗材組件
        const { data: materialsData, error: materialsError } = await supabase
          .from('material_components')
          .select(`
            *,
            material_types (
              id,
              name,
              type
            )
          `);

        if (materialsError) throw materialsError;
        setMaterials(materialsData || []);

        // 獲取藥劑資料
        const { data: medicinesData, error: medicinesError } = await supabase
          .from('medicines')
          .select(`
            id,
            name,
            created_at,
            updated_at,
            medicine_orders (
              id,
              medicine_id,
              quantity,
              date,
              vendor
            ),
            medicine_usages (
              id,
              medicine_id,
              quantity,
              date,
              project
            )
          `);

        if (medicinesError) throw medicinesError;
        setMedicines(medicinesData || []);

        // 獲取專案資料
        const { data: projectsData, error: projectsError } = await supabase
          .from('project')
          .select('project_id, project_name');

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 處理新增耗材
  const handleAddMaterial = async () => {
    try {
      // 先新增耗材類型
      const { data: typeData, error: typeError } = await supabase
        .from('material_types')
        .insert([{ name: newMaterial.material_type_id, type: newMaterial.material_type_id }])
        .select();

      if (typeError) throw typeError;

      // 再新增耗材組件
      const { data, error } = await supabase
        .from('material_components')
        .insert([{
          ...newMaterial,
          material_type_id: typeData[0].id
        }])
        .select(`
          *,
          material_types (
            id,
            name,
            type
          )
        `);

      if (error) throw error;

      // 更新耗材列表，確保包含完整的資料結構
      setMaterials(prev => [...prev, data[0]]);
      setOpen(false);
      setNewMaterial({
        material_type_id: "",
        name: "",
        status: "正常",
        last_maintenance: null,
        unit_price: "",
        invoice_number: "",
        vendor: ""
      });
    } catch (error) {
      console.error('Error adding material:', error);
      alert('新增耗材失敗，請稍後再試！');
    }
  };

  // 處理新增藥劑
  const handleAddMedicine = async () => {
    try {
      // 檢查是否已存在相同名稱的藥劑
      const { data: existingMedicines, error: checkError } = await supabase
        .from('medicines')
        .select('name')
        .ilike('name', newMedicine.name);

      if (checkError) throw checkError;

      if (existingMedicines && existingMedicines.length > 0) {
        alert('此藥劑種類已存在！');
        return;
      }

      const { data, error } = await supabase
        .from('medicines')
        .insert([{ name: newMedicine.name }])
        .select(`
          *,
          medicine_orders (*),
          medicine_usages (*)
        `);

      if (error) throw error;

      setMedicines(prev => [...prev, data[0]]);
      setOpen(false);
      setNewMedicine({
        name: ""
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('新增藥劑失敗，請稍後再試！');
    }
  };

  // 處理更新耗材狀態
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('material_components')
        .update({ status: newStatus })
        .eq('id', id)
        .select(`
          *,
          material_types (
            id,
            name,
            type
          )
        `);

      if (error) throw error;

      setMaterials(prev => prev.map(m => m.id === id ? data[0] : m));
    } catch (error) {
      console.error('Error updating material status:', error);
      alert('更新耗材狀態失敗，請稍後再試！');
    }
  };

  // 計算藥劑剩餘量
  const calculateMedicineQuantity = (medicine) => {
    const totalOrders = medicine.medicine_orders?.reduce((sum, order) => sum + parseFloat(order.quantity), 0) || 0;
    const totalUsages = medicine.medicine_usages?.reduce((sum, usage) => sum + parseFloat(usage.quantity), 0) || 0;
    return (totalOrders - totalUsages).toFixed(2);
  };

  // 篩選耗材
  const filteredMaterials = materials
    .filter((material) => {
      if (selectedType && material.material_types?.type !== selectedType) return false;
      if (searchQuery.trim() !== "") {
        const searchLower = searchQuery.toLowerCase();
        return material.name.toLowerCase().includes(searchLower);
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));

  // 篩選藥劑
  const filteredMedicines = medicines
    .filter((medicine) => {
      if (searchQuery.trim() !== "") {
        const searchLower = searchQuery.toLowerCase();
        return medicine.name.toLowerCase().includes(searchLower);
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const paginatedMaterials = filteredMaterials.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedMedicines = filteredMedicines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 處理編輯耗材
  const handleEditMaterial = async () => {
    try {
      const { data, error } = await supabase
        .from('material_components')
        .update({
          status: editingMaterial.status,
          last_maintenance: editingMaterial.last_maintenance,
          unit_price: editingMaterial.unit_price,
          invoice_number: editingMaterial.invoice_number,
          vendor: editingMaterial.vendor
        })
        .eq('id', editingMaterial.id)
        .select(`
          *,
          material_types (
            id,
            name,
            type
          )
        `);

      if (error) throw error;

      setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? data[0] : m));
      setEditDialogOpen(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Error updating material:', error);
      alert('更新耗材失敗，請稍後再試！');
    }
  };

  // 處理編輯藥劑
  const handleEditMedicine = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({
          name: editingMedicine.name
        })
        .eq('id', editingMedicine.id)
        .select(`
          *,
          medicine_orders (*),
          medicine_usages (*)
        `);

      if (error) throw error;

      setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? data[0] : m));
      setEditDialogOpen(false);
      setEditingMedicine(null);
    } catch (error) {
      console.error('Error updating medicine:', error);
      alert('更新藥劑失敗，請稍後再試！');
    }
  };

  // 處理新增訂購
  const handleAddOrder = async () => {
    try {
      // 驗證必填欄位
      if (!newOrder.quantity || !newOrder.date || !newOrder.vendor || !newOrder.unit_price || !newOrder.invoice_number) {
        alert('請填寫所有必填欄位！');
        return;
      }

      // 確保日期格式正確
      const orderDate = new Date(newOrder.date);
      if (isNaN(orderDate.getTime())) {
        alert('日期格式不正確！');
        return;
      }

      // 確保數量為有效數字（允許小數點）
      const quantity = parseFloat(newOrder.quantity);
      if (isNaN(quantity)) {
        alert('請輸入有效的數量！');
        return;
      }

      const { error } = await supabase
        .from('medicine_orders')
        .insert([{
          medicine_id: selectedMedicine.id,
          quantity: quantity,
          date: newOrder.date,
          vendor: newOrder.vendor,
          unit_price: newOrder.unit_price,
          invoice_number: newOrder.invoice_number
        }]);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      // 重新獲取藥劑資料以更新列表
      const { data: updatedData, error: fetchError } = await supabase
        .from('medicines')
        .select(`
          *,
          medicine_orders (*),
          medicine_usages (*)
        `);

      if (fetchError) throw fetchError;
      
      setMedicines(updatedData || []);
      setOrderDialogOpen(false);
      setSelectedMedicine(null);
      setNewOrder({
        quantity: 0,
        date: "",
        vendor: "",
        unit_price: "",
        invoice_number: ""
      });
    } catch (error) {
      console.error('Error adding order:', error);
      alert('新增訂購記錄失敗：' + (error.message || '請稍後再試！'));
    }
  };

  // 處理新增使用記錄
  const handleAddUsage = async () => {
    try {
      // 驗證必填欄位
      if (!newUsage.quantity || !newUsage.date || !newUsage.project) {
        alert('請填寫所有必填欄位！');
        return;
      }

      // 確保日期格式正確
      const usageDate = new Date(newUsage.date);
      if (isNaN(usageDate.getTime())) {
        alert('日期格式不正確！');
        return;
      }

      // 確保數量為有效數字（允許小數點）
      const quantity = parseFloat(newUsage.quantity);
      if (isNaN(quantity)) {
        alert('請輸入有效的數量！');
        return;
      }

      // 獲取選中的專案資訊
      const selectedProject = projects.find(p => p.project_id === newUsage.project);
      if (!selectedProject) {
        alert('找不到選擇的專案資訊！');
        return;
      }

      // 新增藥劑使用記錄
      const { error: usageError } = await supabase
        .from('medicine_usages')
        .insert([{
          medicine_id: selectedMedicine.id,
          quantity: quantity,
          date: newUsage.date,
          project: selectedProject.project_name
        }]);

      if (usageError) {
        console.error('Error details:', usageError);
        throw usageError;
      }

      // 新增專案日誌
      const { error: logError } = await supabase
        .from('project_log')
        .insert([{
          project_id: newUsage.project,
          log_type: '使用藥劑',
          log_date: newUsage.date,
          content: `${selectedMedicine.name}-${quantity.toFixed(2)}`,
          notes: '',
          created_by: '庫存頁面'
        }]);

      if (logError) {
        console.error('Error adding project log:', logError);
        throw logError;
      }

      // 重新獲取藥劑資料以更新列表
      const { data: updatedData, error: fetchError } = await supabase
        .from('medicines')
        .select(`
          *,
          medicine_orders (*),
          medicine_usages (*)
        `);

      if (fetchError) throw fetchError;
      
      setMedicines(updatedData || []);
      setUsageDialogOpen(false);
      setSelectedMedicine(null);
      setNewUsage({
        quantity: '',
        date: "",
        project: ""
      });
    } catch (error) {
      console.error('Error adding usage:', error);
      alert('新增使用記錄失敗：' + (error.message || '請稍後再試！'));
    }
  };

  // 處理刪除藥劑
  const handleDeleteMedicine = async (medicine) => {
    if (!window.confirm(`確定要刪除藥劑「${medicine.name}」嗎？此操作將同時刪除所有相關的訂購、使用記錄和專案日誌。`)) {
      return;
    }

    try {
      // 先找到所有使用此藥劑的專案日誌
      const { data: projectLogs, error: logsError } = await supabase
        .from('project_log')
        .select('*')
        .eq('log_type', '使用藥劑')
        .ilike('content', `${medicine.name}-%`);

      if (logsError) throw logsError;

      // 刪除相關的專案日誌
      if (projectLogs && projectLogs.length > 0) {
        const { error: deleteLogsError } = await supabase
          .from('project_log')
          .delete()
          .eq('log_type', '使用藥劑')
          .ilike('content', `${medicine.name}-%`);

        if (deleteLogsError) throw deleteLogsError;
      }

      // 刪除相關的訂購記錄
      const { error: ordersError } = await supabase
        .from('medicine_orders')
        .delete()
        .eq('medicine_id', medicine.id);

      if (ordersError) throw ordersError;

      // 刪除相關的使用記錄
      const { error: usagesError } = await supabase
        .from('medicine_usages')
        .delete()
        .eq('medicine_id', medicine.id);

      if (usagesError) throw usagesError;

      // 最後刪除藥劑本身
      const { error: medicineError } = await supabase
        .from('medicines')
        .delete()
        .eq('id', medicine.id);

      if (medicineError) throw medicineError;

      // 更新藥劑列表
      setMedicines(prev => prev.filter(m => m.id !== medicine.id));
    } catch (error) {
      console.error('Error deleting medicine:', error);
      alert('刪除藥劑失敗，請稍後再試！');
    }
  };

  // 處理查看歷史記錄
  const handleViewHistory = async (medicine) => {
    try {
      setSelectedMedicine(medicine);
      setViewHistoryDialogOpen(true);
      setHistoryType('order'); // 預設顯示訂購記錄
      
      // 預設顯示最近一個月的記錄
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      setDateRange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      // 從資料庫獲取最新的藥劑資料
      const { data: updatedMedicine, error } = await supabase
        .from('medicines')
        .select(`
          id,
          name,
          created_at,
          updated_at,
          medicine_orders (
            id,
            medicine_id,
            quantity,
            date,
            vendor
          ),
          medicine_usages (
            id,
            medicine_id,
            quantity,
            date,
            project
          )
        `)
        .eq('id', medicine.id)
        .single();

      if (error) throw error;

      // 更新選中的藥劑資料
      setSelectedMedicine(updatedMedicine);
      
      // 篩選訂購記錄
      const { data: orders, error: ordersError } = await supabase
        .from('medicine_orders')
        .select('*')
        .eq('medicine_id', updatedMedicine.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });  // 按日期降序排列

      if (ordersError) throw ordersError;
      setFilteredHistory(orders || []);
    } catch (error) {
      console.error('Error fetching medicine history:', error);
      alert('獲取記錄失敗，請稍後再試！');
    }
  };

  // 處理記錄類型切換
  const handleHistoryTypeChange = async (type) => {
    try {
      // 先更新類型
      setHistoryType(type);
      
      // 從資料庫獲取最新的藥劑資料
      const { data: updatedMedicine, error } = await supabase
        .from('medicines')
        .select(`
          id,
          name,
          created_at,
          updated_at,
          medicine_orders (
            id,
            medicine_id,
            quantity,
            date,
            vendor
          ),
          medicine_usages (
            id,
            medicine_id,
            quantity,
            date,
            project
          )
        `)
        .eq('id', selectedMedicine.id)
        .single();

      if (error) throw error;

      // 更新選中的藥劑資料
      setSelectedMedicine(updatedMedicine);

      // 使用最新的資料進行篩選
      if (dateRange.startDate && dateRange.endDate) {
        // 直接從資料庫獲取指定類型的記錄
        if (type === 'order') {
          const { data: orders, error: ordersError } = await supabase
            .from('medicine_orders')
            .select('*')
            .eq('medicine_id', updatedMedicine.id)
            .gte('date', dateRange.startDate)
            .lte('date', dateRange.endDate)
            .order('date', { ascending: false });  // 按日期降序排列

          if (ordersError) throw ordersError;
          setFilteredHistory(orders || []);
        } else {
          const { data: usages, error: usagesError } = await supabase
            .from('medicine_usages')
            .select('*')
            .eq('medicine_id', updatedMedicine.id)
            .gte('date', dateRange.startDate)
            .lte('date', dateRange.endDate)
            .order('date', { ascending: false });  // 按日期降序排列

          if (usagesError) throw usagesError;
          setFilteredHistory(usages || []);
        }
      }
    } catch (error) {
      console.error('Error switching history type:', error);
      alert('切換記錄類型失敗，請稍後再試！');
    }
  };

  // 篩選歷史記錄
  const filterHistory = async (medicine, startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // 設定為當天的最後一刻

      // 從資料庫獲取指定時間範圍的記錄
      if (historyType === 'order') {
        // 查詢訂購記錄
        const { data: orders, error } = await supabase
          .from('medicine_orders')
          .select('*')
          .eq('medicine_id', medicine.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });  // 按日期降序排列

        if (error) throw error;
        setFilteredHistory(orders || []);
      } else if (historyType === 'usage') {
        // 查詢使用記錄
        const { data: usages, error } = await supabase
          .from('medicine_usages')
          .select('*')
          .eq('medicine_id', medicine.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });  // 按日期降序排列

        if (error) throw error;
        setFilteredHistory(usages || []);
      }
    } catch (error) {
      console.error('Error filtering history:', error);
      alert('篩選記錄失敗，請稍後再試！');
    }
  };

  // 處理日期範圍變更
  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    if (newDateRange.startDate && newDateRange.endDate) {
      filterHistory(selectedMedicine, newDateRange.startDate, newDateRange.endDate);
    }
  };

  // 處理刪除耗材
  const handleDeleteMaterial = async (material) => {
    if (!window.confirm(`確定要刪除耗材「${material.name}」嗎？此操作無法復原。`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('material_components')
        .delete()
        .eq('id', material.id);
      if (error) throw error;
      setMaterials(prev => prev.filter(m => m.id !== material.id));
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('刪除耗材失敗，請稍後再試！');
    }
  };

  // 處理編輯記錄
  const handleEditRecord = async () => {
    try {
      if (!editingRecord) return;

      // 驗證必填欄位
      if (!editingRecord.quantity || !editingRecord.date) {
        alert('請填寫所有必填欄位！');
        return;
      }

      // 確保日期格式正確
      const recordDate = new Date(editingRecord.date);
      if (isNaN(recordDate.getTime())) {
        alert('日期格式不正確！');
        return;
      }

      // 確保數量為有效數字（允許小數點）
      const quantity = parseFloat(editingRecord.quantity);
      if (isNaN(quantity)) {
        alert('請輸入有效的數量！');
        return;
      }

      const tableName = historyType === 'order' ? 'medicine_orders' : 'medicine_usages';
      
      // 準備更新資料
      const updateData = {
        quantity: quantity,
        date: editingRecord.date
      };

      // 根據記錄類型添加額外欄位
      if (historyType === 'order') {
        if (!editingRecord.vendor || !editingRecord.unit_price || !editingRecord.invoice_number) {
          alert('請填寫所有必填欄位！');
          return;
        }
        updateData.vendor = editingRecord.vendor;
        updateData.unit_price = editingRecord.unit_price;
        updateData.invoice_number = editingRecord.invoice_number;
      } else {
        if (!editingRecord.project) {
          alert('請選擇專案！');
          return;
        }
        updateData.project = editingRecord.project;

        // 如果是使用記錄，先獲取原本的記錄資料
        const { data: originalRecord, error: originalError } = await supabase
          .from('medicine_usages')
          .select('project')
          .eq('id', editingRecord.id)
          .single();

        if (originalError) {
          console.error('Error fetching original record:', originalError);
          throw originalError;
        }

        // 獲取原本專案的 ID
        if (originalRecord && originalRecord.project) {
          const { data: originalProjectData, error: originalProjectError } = await supabase
            .from('project')
            .select('project_id')
            .eq('project_name', originalRecord.project)
            .single();

          if (originalProjectError) {
            console.error('Error finding original project:', originalProjectError);
            throw originalProjectError;
          }

          if (originalProjectData) {
            // 刪除原本專案中的相關日誌
            const { error: deleteOriginalLogError } = await supabase
              .from('project_log')
              .delete()
              .eq('project_id', originalProjectData.project_id)
              .eq('log_type', '使用藥劑')
              .ilike('content', `${selectedMedicine.name}-%`);

            if (deleteOriginalLogError) {
              console.error('Error deleting original project logs:', deleteOriginalLogError);
              throw deleteOriginalLogError;
            }
          }
        }

        // 獲取新專案的 ID
        const { data: newProjectData, error: newProjectError } = await supabase
          .from('project')
          .select('project_id')
          .eq('project_name', editingRecord.project)
          .single();

        if (newProjectError) {
          console.error('Error finding new project:', newProjectError);
          throw newProjectError;
        }

        if (!newProjectData) {
          throw new Error('找不到對應的專案');
        }

        // 刪除新專案中的相關日誌
        const { error: deleteNewLogError } = await supabase
          .from('project_log')
          .delete()
          .eq('project_id', newProjectData.project_id)
          .eq('log_type', '使用藥劑')
          .ilike('content', `${selectedMedicine.name}-%`);

        if (deleteNewLogError) {
          console.error('Error deleting new project logs:', deleteNewLogError);
          throw deleteNewLogError;
        }

        // 創建新的專案日誌
        const { error: createLogError } = await supabase
          .from('project_log')
          .insert([{
            project_id: newProjectData.project_id,
            log_type: '使用藥劑',
            log_date: editingRecord.date,
            content: `${selectedMedicine.name}-${quantity.toFixed(2)}`,
            notes: '',
            created_by: '庫存頁面'
          }]);

        if (createLogError) {
          console.error('Error creating new project log:', createLogError);
          throw createLogError;
        }
      }

      // 更新資料庫
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingRecord.id);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      // 重新獲取所有藥劑資料
      const { data: allMedicines, error: fetchError } = await supabase
        .from('medicines')
        .select(`
          id,
          name,
          created_at,
          updated_at,
          medicine_orders (
            id,
            medicine_id,
            quantity,
            date,
            vendor
          ),
          medicine_usages (
            id,
            medicine_id,
            quantity,
            date,
            project
          )
        `);

      if (fetchError) throw fetchError;

      // 更新藥劑列表
      setMedicines(allMedicines || []);
      
      // 更新選中的藥劑資料
      const updatedMedicine = allMedicines.find(m => m.id === selectedMedicine.id);
      if (updatedMedicine) {
        setSelectedMedicine(updatedMedicine);
      }
      
      // 更新過濾後的歷史記錄
      if (dateRange.startDate && dateRange.endDate) {
        filterHistory(updatedMedicine, dateRange.startDate, dateRange.endDate);
      }

      setEditRecordDialogOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error editing record:', error);
      alert('編輯記錄失敗：' + (error.message || '請稍後再試！'));
    }
  };

  // 處理刪除記錄
  const handleDeleteRecord = async (record) => {
    if (!window.confirm(`確定要刪除這筆${historyType === 'order' ? '訂購' : '使用'}記錄嗎？`)) {
      return;
    }

    try {
      const tableName = historyType === 'order' ? 'medicine_orders' : 'medicine_usages';
      
      // 如果是使用記錄，先刪除對應的專案日誌
      if (historyType === 'usage') {
        // 先找到對應的專案 ID
        const { data: projectData, error: projectError } = await supabase
          .from('project')
          .select('project_id')
          .eq('project_name', record.project)
          .single();

        if (projectError) {
          console.error('Error finding project:', projectError);
          throw projectError;
        }

        if (!projectData) {
          throw new Error('找不到對應的專案');
        }

        // 刪除專案日誌
        const { error: logError } = await supabase
          .from('project_log')
          .delete()
          .eq('project_id', projectData.project_id)
          .eq('log_type', '使用藥劑')
          .eq('log_date', record.date)
          .eq('content', `${selectedMedicine.name}-${parseFloat(record.quantity).toFixed(2)}`);

        if (logError) {
          console.error('Error deleting project log:', logError);
          throw logError;
        }
      }
      
      // 刪除記錄
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      // 重新獲取所有藥劑資料
      const { data: allMedicines, error: fetchError } = await supabase
        .from('medicines')
        .select(`
          id,
          name,
          created_at,
          updated_at,
          medicine_orders (
            id,
            medicine_id,
            quantity,
            date,
            vendor
          ),
          medicine_usages (
            id,
            medicine_id,
            quantity,
            date,
            project
          )
        `);

      if (fetchError) throw fetchError;

      // 更新藥劑列表
      setMedicines(allMedicines || []);
      
      // 更新選中的藥劑資料
      const updatedMedicine = allMedicines.find(m => m.id === selectedMedicine.id);
      if (updatedMedicine) {
        setSelectedMedicine(updatedMedicine);
      }
      
      // 更新過濾後的歷史記錄
      if (dateRange.startDate && dateRange.endDate) {
        filterHistory(updatedMedicine, dateRange.startDate, dateRange.endDate);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('刪除記錄失敗：' + (error.message || '請稍後再試！'));
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div style={{ padding: 20 }}>
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            backgroundColor: 'primary.light',
            padding: 4,
            borderRadius: 3,
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 4,
          }}
        >
          <Box sx={{ zIndex: 1, position: 'relative' }}>
            <Typography variant="h2" sx={{ color: 'primary.black', fontWeight: 'bold', mb: 10 }}>
              庫存管理
            </Typography>

            <Button startIcon={<Add />} variant="contained" onClick={() => setOpen(true)} style={{ marginBottom: 10 }}>
              新增{currentTab === 0 ? '耗材' : '藥劑'}
            </Button>
          </Box>
        </Paper>

        {/* 標籤頁 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="耗材管理" />
            <Tab label="藥劑管理" />
          </Tabs>
        </Box>

        {/* 搜尋和篩選區域 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          {currentTab === 0 && (
            <>
            <TextField
                label="耗材類型"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                sx={{ minWidth: 200 }}
              />

            <TextField
                label="搜尋耗材名稱"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </>
          )}
        </Box>

        {/* 耗材列表 */}
        {currentTab === 0 && (
          <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                  <TableCell>編號</TableCell>
                  <TableCell>耗材類型</TableCell>
                    <TableCell>名稱</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>最後維護日期</TableCell>
                  <TableCell>單價</TableCell>
                  <TableCell>發票號碼</TableCell>
                  <TableCell>廠商</TableCell>
                  <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {paginatedMaterials.map((material, index) => (
                  <TableRow key={material.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{material.material_types?.name || '未知類型'}</TableCell>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.status}</TableCell>
                    <TableCell>{material.last_maintenance || '未設定'}</TableCell>
                    <TableCell>{material.unit_price || '未設定'}</TableCell>
                    <TableCell>{material.invoice_number || '未設定'}</TableCell>
                    <TableCell>{material.vendor || '未設定'}</TableCell>
                      <TableCell>
                        <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setEditingMaterial(material);
                          setEditDialogOpen(true);
                        }}
                      >
                        編輯
                      </Button>
                        <Button
                        variant="outlined"
                        size="small"
                          color="error"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleDeleteMaterial(material)}
                        >
                          刪除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        )}

        {/* 藥劑列表 */}
        {currentTab === 1 && (
          <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                  <TableCell>編號</TableCell>
                  <TableCell>藥劑名稱</TableCell>
                  <TableCell>剩餘數量</TableCell>
                  <TableCell>最後更新日期</TableCell>
                        <TableCell>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                {paginatedMedicines.map((medicine, index) => (
                  <TableRow key={medicine.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{medicine.name}</TableCell>
                    <TableCell>{calculateMedicineQuantity(medicine)}</TableCell>
                    <TableCell>{new Date(medicine.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setOrderDialogOpen(true);
                          }}
                        >
                          新增訂購
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setUsageDialogOpen(true);
                          }}
                        >
                          新增使用
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="info"
                          onClick={() => handleViewHistory(medicine)}
                        >
                          查看記錄
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMedicine(medicine)}
                        >
                          刪除
                        </Button>
                      </Box>
                    </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

        <TablePagination
          component="div"
          count={currentTab === 0 ? filteredMaterials.length : filteredMedicines.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Box>

      {/* 新增對話框 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>新增{currentTab === 0 ? '耗材' : '藥劑'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {currentTab === 0 ? (
              <>
                <TextField
                  label="耗材類型"
                  value={newMaterial.material_type_id}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, material_type_id: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="耗材名稱"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="狀態"
                  value={newMaterial.status}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, status: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="最後維護日期"
                  type="date"
                  value={newMaterial.last_maintenance || ''}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, last_maintenance: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="單價"
                  type="text"
                  value={newMaterial.unit_price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setNewMaterial(prev => ({ ...prev, unit_price: value }));
                    }
                  }}
                  fullWidth
                />

                <TextField
                  label="發票號碼"
                  value={newMaterial.invoice_number}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, invoice_number: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="廠商"
                  value={newMaterial.vendor}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, vendor: e.target.value }))}
                  fullWidth
                />
              </>
            ) : (
              <TextField
                label="藥劑名稱"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button 
            onClick={currentTab === 0 ? handleAddMaterial : handleAddMedicine} 
            variant="contained"
          >
            新增
          </Button>
        </DialogActions>
      </Dialog>

      {/* 編輯耗材對話框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>編輯{currentTab === 0 ? '耗材' : '藥劑'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {currentTab === 0 ? (
              <>
                <TextField
                  label="耗材類型"
                  value={editingMaterial?.material_types?.name || ''}
                  disabled
                  fullWidth
                />

                <TextField
                  label="耗材名稱"
                  value={editingMaterial?.name || ''}
                  disabled
                  fullWidth
                />

                <TextField
                  label="狀態"
                  value={editingMaterial?.status || ''}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, status: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="最後維護日期"
                  type="date"
                  value={editingMaterial?.last_maintenance || ''}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, last_maintenance: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="單價"
                  type="text"
                  value={editingMaterial?.unit_price || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setEditingMaterial(prev => ({ ...prev, unit_price: value }));
                    }
                  }}
                  fullWidth
                />

                <TextField
                  label="發票號碼"
                  value={editingMaterial?.invoice_number || ''}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, invoice_number: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="廠商"
                  value={editingMaterial?.vendor || ''}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, vendor: e.target.value }))}
                  fullWidth
                />
              </>
            ) : (
              <>
                <TextField
                  label="藥劑名稱"
                  value={editingMedicine?.name || ''}
                  onChange={(e) => setEditingMedicine(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="使用數量"
                  type="number"
                  value={editingMedicine?.usageQuantity || ''}
                  onChange={(e) => setEditingMedicine(prev => ({ ...prev, usageQuantity: parseInt(e.target.value) || 0 }))}
                  fullWidth
                />

                <TextField
                  label="使用日期"
                  type="date"
                  value={editingMedicine?.usageDate || ''}
                  onChange={(e) => setEditingMedicine(prev => ({ ...prev, usageDate: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="使用專案"
                  value={editingMedicine?.usageProject || ''}
                  onChange={(e) => setEditingMedicine(prev => ({ ...prev, usageProject: e.target.value }))}
                  fullWidth
                />
        </>
      )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button 
            onClick={currentTab === 0 ? handleEditMaterial : handleEditMedicine} 
            variant="contained"
          >
            儲存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增訂購對話框 */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)}>
        <DialogTitle>新增訂購 - {selectedMedicine?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="訂購數量"
              type="text"
              value={newOrder.quantity}
              onChange={(e) => {
                const value = e.target.value;
                // 允許輸入數字和小數點
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setNewOrder(prev => ({ ...prev, quantity: value }));
                }
              }}
              fullWidth
            />

            <TextField
              label="訂購日期"
              type="date"
              value={newOrder.date}
              onChange={(e) => setNewOrder(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="廠商"
              value={newOrder.vendor}
              onChange={(e) => setNewOrder(prev => ({ ...prev, vendor: e.target.value }))}
              fullWidth
            />

            <TextField
              label="單價"
              type="text"
              value={newOrder.unit_price}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setNewOrder(prev => ({ ...prev, unit_price: value }));
                }
              }}
              fullWidth
            />

            <TextField
              label="發票號碼"
              value={newOrder.invoice_number}
              onChange={(e) => setNewOrder(prev => ({ ...prev, invoice_number: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>取消</Button>
          <Button onClick={handleAddOrder} variant="contained">
            新增
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增使用記錄對話框 */}
      <Dialog open={usageDialogOpen} onClose={() => setUsageDialogOpen(false)}>
        <DialogTitle>新增使用記錄 - {selectedMedicine?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="使用數量"
              type="text"
              value={newUsage.quantity}
              onChange={(e) => {
                const value = e.target.value;
                // 允許輸入數字和小數點
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setNewUsage(prev => ({ ...prev, quantity: value }));
                }
              }}
              fullWidth
            />

            <TextField
              label="使用日期"
              type="date"
              value={newUsage.date}
              onChange={(e) => setNewUsage(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Autocomplete
              options={projects}
              getOptionLabel={(option) => `${option.project_name}`}
              value={projects.find(p => p.project_id === newUsage.project) || null}
              onChange={(event, newValue) => {
                setNewUsage(prev => ({
                  ...prev,
                  project: newValue?.project_id || ""
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="選擇專案"
                  fullWidth
                  required
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageDialogOpen(false)}>取消</Button>
          <Button onClick={handleAddUsage} variant="contained">
            新增
          </Button>
        </DialogActions>
      </Dialog>

      {/* 查看歷史記錄對話框 */}
      <Dialog 
        open={viewHistoryDialogOpen} 
        onClose={() => setViewHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          記錄查詢 - {selectedMedicine?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant={historyType === 'order' ? 'contained' : 'outlined'}
                onClick={() => handleHistoryTypeChange('order')}
              >
                訂購記錄
              </Button>
              <Button
                variant={historyType === 'usage' ? 'contained' : 'outlined'}
                onClick={() => handleHistoryTypeChange('usage')}
              >
                使用記錄
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="開始日期"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="結束日期"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                    <TableCell>日期</TableCell>
                        <TableCell>數量</TableCell>
                    {historyType === 'order' ? (
                      <>
                        <TableCell>廠商</TableCell>
                        <TableCell>單價</TableCell>
                        <TableCell>發票號碼</TableCell>
                      </>
                    ) : (
                        <TableCell>專案</TableCell>
                    )}
                        <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                  {filteredHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      {historyType === 'order' ? (
                        <>
                          <TableCell>{record.vendor}</TableCell>
                          <TableCell>{record.unit_price || '未設定'}</TableCell>
                          <TableCell>{record.invoice_number || '未設定'}</TableCell>
                        </>
                      ) : (
                          <TableCell>{record.project}</TableCell>
                      )}
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setEditingRecord(record);
                            setEditRecordDialogOpen(true);
                          }}
                        >
                          編輯
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          style={{ marginLeft: 8 }}
                          onClick={() => handleDeleteRecord(record)}
                        >
                          刪除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={historyType === 'order' ? 4 : 3} align="center">
                        此時間範圍內無{historyType === 'order' ? '訂購' : '使用'}記錄
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewHistoryDialogOpen(false)}>關閉</Button>
        </DialogActions>
      </Dialog>

      {/* 編輯記錄對話框 */}
      <Dialog open={editRecordDialogOpen} onClose={() => setEditRecordDialogOpen(false)}>
        <DialogTitle>編輯{historyType === 'order' ? '訂購' : '使用'}記錄</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="數量"
              type="text"
              value={editingRecord?.quantity || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setEditingRecord(prev => ({ ...prev, quantity: value }));
                }
              }}
              fullWidth
              required
            />

            <TextField
              label="日期"
              type="date"
              value={editingRecord?.date || ''}
              onChange={(e) => setEditingRecord(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />

            {historyType === 'order' ? (
              <>
                <TextField
                  label="廠商"
                  value={editingRecord?.vendor || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, vendor: e.target.value }))}
                  fullWidth
                  required
                />

                <TextField
                  label="單價"
                  type="text"
                  value={editingRecord?.unit_price || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setEditingRecord(prev => ({ ...prev, unit_price: value }));
                    }
                  }}
                  fullWidth
                  required
                />

                <TextField
                  label="發票號碼"
                  value={editingRecord?.invoice_number || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, invoice_number: e.target.value }))}
                  fullWidth
                  required
                />
              </>
            ) : (
              <Autocomplete
                options={projects}
                getOptionLabel={(option) => `${option.project_name}`}
                value={projects.find(p => p.project_name === editingRecord?.project) || null}
                onChange={(event, newValue) => {
                  setEditingRecord(prev => ({
                    ...prev,
                    project: newValue?.project_name || ""
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="選擇專案"
                    fullWidth
                    required
                  />
                )}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRecordDialogOpen(false)}>取消</Button>
          <Button onClick={handleEditRecord} variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Inventory;