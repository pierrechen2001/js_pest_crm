import React, { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { 
  Box, 
  Paper, 
  Button, 
  TextField, 
  Select, 
  FormControl, 
  InputLabel, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TableSortLabel, 
  Autocomplete, 
  Checkbox, 
  ListItemText, 
  CircularProgress, 
  Typography, 
  Divider, 
  Menu, 
  MenuItem, 
  IconButton, 
  TablePagination, 
  TableContainer,
  Chip,
  InputAdornment,
  useTheme
} from "@mui/material";
import { Add, Add as AddIcon } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from 'react-router-dom';
import { geocodeAddress, combineAddress } from '../lib/geocoding';
import AddressSelector from '../components/AddressSelector';

const constructionStatusOptions = ["未開始", "進行中", "已完成", "延遲", "已估價", "取消"];
const billingStatusOptions = ["未請款", "部分請款", "已請款", "取消"];
const getStatusStyle = (status, type) => {
  if (type === 'construction') {
    switch (status) {
      case '未開始':
        return { bg: 'rgba(128, 128, 128, 0.1)', color: 'gray' };
      case '進行中':
        return { bg: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' };
      case '已完成':
        return { bg: 'rgba(76, 175, 80, 0.1)', color: 'green' };
      case '延遲':
        return { bg: 'rgba(244, 67, 54, 0.1)', color: 'red' };
      case '已估價':
        return { bg: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' };
      case '取消':
        return { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' };
      default:
        return { bg: 'rgba(0,0,0,0.05)', color: 'black' };
    }
  }
  if (type === 'billing') {
    switch (status) {
      case '未請款':
        return { bg: 'rgba(128, 128, 128, 0.1)', color: 'gray' };
      case '部分請款':
        return { bg: 'rgba(255, 152, 0, 0.1)', color: '#f57c00' };
      case '已結清':
        return { bg: 'rgba(76, 175, 80, 0.1)', color: 'green' };
      case '取消':
        return { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' };
      default:
        return { bg: 'rgba(0,0,0,0.05)', color: 'black' };
    }
  }
};

export default function Orders({ projects: initialProjects = [], customers: initialCustomers = [] }) {
  const navigate = useNavigate();
  // Use props for initial state, allow internal updates if needed for local operations like adding a new project optimistically
  const [projects, setProjects] = useState(initialProjects);
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(true); // Loading is now handled by App.js
  const [error, setError] = useState(null); // Error is now handled by App.js
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProject, setMenuProject] = useState(null);
  const [menuType, setMenuType] = useState('');

  const handleOpenStatusMenu = (event, project, type) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
    setMenuType(type);
  };

  const handleCloseStatusMenu = () => {
    setAnchorEl(null);
    setMenuProject(null);
    setMenuType('');
  };

  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [trackProject, setTrackProject] = useState(null);
  const [trackType, setTrackType] = useState(""); // "construction" or "billing"

  const updateStatus = async (value) => {
    if (!menuProject) return;
    const field = menuType === 'construction' ? 'construction_status' : 'billing_status';
    const { data, error } = await supabase
      .from('project')
      .update({ [field]: value })
      .eq('project_id', menuProject.project_id)
      .select();
    if (error) {
      console.error('Error updating status:', error);
        return;
    }
    setProjects(prev => prev.map(p => p.project_id === data[0].project_id ? { ...p, [field]: value } : p));
    handleCloseStatusMenu();

    // 取得另一個欄位的狀態
    const otherStatus =
      field === 'construction_status'
        ? menuProject.billing_status
        : menuProject.construction_status;

    // 判斷兩個欄位都已達指定狀態
    if (
      (field === 'construction_status' && value === '已完成' && otherStatus === '已結清') ||
      (field === 'billing_status' && value === '已結清' && otherStatus === '已完成')
    ) {
      // 先查詢該專案是否已設置追蹤
      const { data: projectDetail, error: detailError } = await supabase
        .from('project')
        .select('is_tracked, track_remind_date')
        .eq('project_id', menuProject.project_id)
        .single();

      if (detailError) {
        console.error('Error fetching project detail:', detailError);
        return;
      }

      // 如果已設置追蹤，不再提醒
      if (projectDetail?.is_tracked && projectDetail?.track_remind_date) {
        // 已設置追蹤，不彈 Dialog
        return;
      }

      // 尚未設置追蹤，才彈 Dialog
      setTrackProject(menuProject);
      setTrackType(field);
      setTrackDialogOpen(true);
    }
  };

// ... (rest of the state variables: statusFilter, billingFilter, etc.)
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [sortField, setSortField] = useState("created_at"); // 預設用建立時間排序
  const [sortOrder, setSortOrder] = useState("desc");  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const filterOptions = ["專案名稱", "客戶名稱", "施工地址"];

  console.log("原始專案資料：", projects);
  const normalizePhone = (str) => (str || "").replace(/\D/g, "");

// ... (filteredProjects logic remains largely the same, but uses the 'projects' state derived from props)
const filteredProjects = (projects || [])
.filter((project) => {
  // 搜索邏輯
  if (searchQuery.trim() !== "") {
    const searchLower = searchQuery.toLowerCase();

    if (selectedFilters.length === 0) {
      const normalizeText = (str) => (str || "").toLowerCase();
      const normalizePhone = (str) => (str || "").replace(/\D/g, "");
      const queryText = searchQuery.toLowerCase();
      const queryPhone = normalizePhone(searchQuery);

      return (
        project.project_name?.toLowerCase().includes(queryText) ||
        project.customer_database?.customer_name?.toLowerCase().includes(queryText) ||
        ((project.site_city || "") + (project.site_district || "") + (project.site_address || ""))
          .toLowerCase()
          .includes(queryText) ||
        normalizePhone(project.contact1_contact).includes(queryPhone) ||
        normalizePhone(project.contact2_contact).includes(queryPhone) ||
        normalizePhone(project.contact3_contact).includes(queryPhone)
      );
    }



    const matchesAnyField = selectedFilters.some((filter) => {
      switch (filter) {
        case "專案名稱":
          return project.project_name?.toLowerCase().includes(searchLower);
        case "客戶名稱":
          return project.customer_database?.customer_name?.toLowerCase().includes(searchLower);
        case "施工地址":
          return `${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`
            .toLowerCase()
            .includes(searchLower);

        default:
          return false;
      }
    });
    console.log(project.contacts)
    if (!matchesAnyField) return false;
  }

  return true;
})
.sort((a, b) => {
  let aValue, bValue;
  if (sortField === "start_date") {
    aValue = a.start_date || "";
    bValue = b.start_date || "";
  } else {
    aValue = a.created_at || "";
    bValue = b.created_at || "";
  }
  if (sortOrder === "desc") {
    return new Date(bValue) - new Date(aValue);
  } else {
    return new Date(aValue) - new Date(bValue);
  }
})

// 先做狀態與請款篩選
const filteredAndStatusProjects = filteredProjects.filter((project) => {
  if (statusFilter && project.construction_status !== statusFilter) return false;
  if (billingFilter && project.billing_status !== billingFilter) return false;
  return true;
});
// 再做分頁
const paginatedProjects = filteredAndStatusProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Dialog 控制
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [useCustomerAddress, setUseCustomerAddress] = useState(false);
  const [useCustomerContact, setUseCustomerContact] = useState(false);
  const [useCustomerContacts, setUseCustomerContacts] = useState(false);

  // 施工項目相關狀態
  const [constructionItemOptions, setConstructionItemOptions] = useState([
    "餌站安裝", "餌站檢測", "白蟻防治", "餌站埋設", "木料藥劑噴塗", "藥劑", "害蟲驅除", "老鼠餌站",
    "空間消毒", "調查費用", "鼠害防治工程", "外牆清洗", "外牆去漆",
    "門窗框去漆", "屋樑支撐工程", "牆身止潮帶", "外牆防護工程", "除鏽", "其他"
  ]);
  const [newConstructionItem, setNewConstructionItem] = useState("");
  const [constructionItemDialogOpen, setConstructionItemDialogOpen] = useState(false);

  const theme = useTheme();


  function getInitialProjectData() {
    return {
      project_name: "",
      customer_id: null,
      site_city: "",
      site_district: "",
      site_address: "",
      construction_item: "",
      construction_items: [], // 新增：多選施工項目數組
      construction_fee: "",
      start_date: "",
      end_date: "",
      construction_days: "",
      construction_scope: "",
      construction_notes: "",
      payment_method: "",
      payment_date: "",
      construction_status: "未開始",
      billing_status: "未請款",
      contacts: [
        { role: "", name: "", contactType: "", contact: "" }, // 預設一個聯絡人
      ],
    };
  }
  const [projectData, setProjectData] = useState(getInitialProjectData());
  
  // 客戶搜尋相關的 state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerFilters, setCustomerFilters] = useState([]);
  const customerFilterOptions = ["客戶名稱", "聯絡人姓名", "電話", "地址"];
  
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [billingAnchorEl, setBillingAnchorEl] = useState(null);
  const handleStatusFilterClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };
  
  const handleBillingFilterClick = (event) => {
    setBillingAnchorEl(event.currentTarget);
  };
  
  const handleStatusFilterClose = (status) => {
    setStatusAnchorEl(null);
    if (status !== undefined) setStatusFilter(status);
  };
  
  const handleBillingFilterClose = (billing) => {
    setBillingAnchorEl(null);
    if (billing !== undefined) setBillingFilter(billing);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('project')
          .select(`
            *,
            customer_database (
              customer_id,
              customer_name
            )
          `)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        const { data: customersData, error: customersError } = await supabase
          .from('customer_database')
          .select('customer_id, customer_name');

        if (customersError) throw customersError;

        setProjects(projectsData || []);
        setCustomers(customersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update local state if props change (e.g., after global data re-fetches)
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  // handleSaveProject might need to inform App.js to re-fetch or optimistically update the global projects state
  // For now, it will update the local 'projects' state in Orders.js
  const handleSaveProject = async () => {
    try {
      // 1. 組合完整地址並進行 geocoding
      const fullAddress = combineAddress(projectData.site_city, projectData.site_district, projectData.site_address);
      const coords = await geocodeAddress(fullAddress);
      const latitude = coords?.latitude || null;
      const longitude = coords?.longitude || null;
  
      // 4. 寫入 Supabase
      const { data, error } = await supabase
        .from('project')
        .insert([{
          project_name: projectData.project_name,
          customer_id: projectData.customer_id,
          site_city: projectData.site_city,
          site_district: projectData.site_district,
          site_address: projectData.site_address,
          construction_item: projectData.construction_item,
          construction_fee: parseFloat(projectData.construction_fee),
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          construction_days: projectData.construction_days,
          construction_scope: projectData.construction_scope,
          project_notes: projectData.construction_notes,
          payment_method: projectData.payment_method,
          payment_date: projectData.payment_date,
          construction_status: projectData.construction_status,
          billing_status: projectData.billing_status,
          contact1_role: projectData.contacts[0]?.role || "",
          contact1_name: projectData.contacts[0]?.name || "",
          contact1_type: projectData.contacts[0]?.contactType || "",
          contact1_contact: projectData.contacts[0]?.contact || "",
          contact2_role: projectData.contacts[1]?.role || "",
          contact2_name: projectData.contacts[1]?.name || "",
          contact2_type: projectData.contacts[1]?.contactType || "",
          contact2_contact: projectData.contacts[1]?.contact || "",
          contact3_role: projectData.contacts[2]?.role || "",
          contact3_name: projectData.contacts[2]?.name || "",
          contact3_type: projectData.contacts[2]?.contactType || "",
          contact3_contact: projectData.contacts[2]?.contact || "",
          latitude,
          longitude
        }])
        .select('*, customer_database(customer_id, customer_name)'); // Ensure you select joined data if needed for optimistic update
  
      if (error) throw error;
  
      // Optimistically update the local projects state. 
      // For a true global update, App.js would need a way to refresh its projects list.
      setProjects(prev => [...prev, data[0]]); 
      setOpenDialog(false);
      // Reset form data
      setProjectData({
        project_name: "",
        customer_id: null,
        site_city: "",
        site_district: "",
        site_address: "",
        construction_item: "",
        construction_fee: "",
        start_date: "",
        end_date: "",
        construction_days: "",
        construction_scope: "",
        construction_notes: "",
        payment_method: "",
        payment_date: "",
        construction_status: "未開始",
        billing_status: "未請款",
        contacts: [
          { role: "", name: "", contactType: "", contact: "" },
          { role: "", name: "", contactType: "", contact: "" }
        ],
        construction_items: [], // 重置施工項目
    });
    setSelectedCustomer(null);
    } catch (error) {
      console.error('Error saving project:', error);
      // You might want to set an error state here to display to the user
    }
  };

// ... (handleChange, handleCityChange, handleDistrictChange, updateContact remain the same)
const handleChange = (e) => {
  const { name, value } = e.target;
  setProjectData(prev => ({
    ...prev,
    [name]: value
  }));
};
// 用於更新 Autocomplete 的縣市和區域
const handleCityChange = (newCity) => {
  setProjectData((prev) => ({
    ...prev,
    site_city: newCity,
    site_district: "", // 當縣市改變時，清空區域
  }));
};

const handleDistrictChange = (newDistrict) => {
  setProjectData((prev) => ({
    ...prev,
    site_district: newDistrict,
  }));
};

const updateContact = (index, field, value) => {
  const updated = [...projectData.contacts];
  updated[index] = { ...updated[index], [field]: value };
  setProjectData({ ...projectData, contacts: updated });
};
  

  // 處理施工項目選擇
  const handleConstructionItemChange = (event, newValue) => {
    setProjectData(prev => ({
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
      setProjectData(prev => ({
        ...prev,
        construction_items: [...(prev.construction_items || []), newItem],
        construction_item: [...(prev.construction_items || []), newItem].join(", ")
      }));
      setNewConstructionItem("");
      setConstructionItemDialogOpen(false);
    }
  };

  // 刪除施工項目
  const handleRemoveConstructionItem = (itemToRemove) => {
    setProjectData(prev => {
      const updatedItems = prev.construction_items.filter(item => item !== itemToRemove);
      return {
        ...prev,
        construction_items: updatedItems,
        construction_item: updatedItems.join(", ")
      };
    });
  };

  // Remove loading/error checks that are now in App.js
  // if (loading) return <CircularProgress />;
  // if (error) return <Typography color="error">{error}</Typography>;


  return (
    <div style={{ padding: 20 }}>
      {/* ... (Button, Search, Filter UI remains the same) ... */}
      <Box sx={{ position: 'relative', mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'primary.light', // or use "#935F4D"
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
          <Typography variant="h2" sx={{ color: 'primary.black', fontWeight: 'bold' , mb: 10}}>
            專案管理
          </Typography>
        <Button 
        variant="contained" 
        startIcon={<Add />} 
        onClick={() => {
          setProjectData(getInitialProjectData());
          setSelectedCustomer(null); // 重置選擇的客戶
          setOpenDialog(true);
        }}
        style={{ marginBottom: 10 }}
        >
          新增專案
        </Button>


        </Box>


        {/* 右側：插圖 */}
        <Box
          component="img"
          src="/order-page.svg"
          alt="客戶管理圖"
          sx={{
            height: 200,
            maxWidth: '100%',
          }}
        />


      </Paper>
      </Box>


      

      {/* 搜尋與篩選條件 */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: 20 }}>
        <TextField
          label="搜尋專案"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>篩選條件</InputLabel>
          <Select
            multiple
            value={selectedFilters}
            onChange={(e) => setSelectedFilters(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {filterOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={selectedFilters.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* ... (Dialog content remains the same) ... */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth >
        <DialogTitle>新增專案</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>基本資訊</Typography>
          
          {/* 客戶搜尋與篩選 */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: 20 }}>
            <TextField
              label="搜尋客戶"
              fullWidth
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
            />
            <FormControl style={{ minWidth: 200 }}>
              <InputLabel>篩選條件</InputLabel>
              <Select
                multiple
                value={customerFilters}
                onChange={(e) => setCustomerFilters(e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {customerFilterOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={customerFilters.indexOf(option) > -1} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* 客戶選擇列表 */}
          <div style={{ marginBottom: 20 }}>
            <Typography variant="subtitle1" gutterBottom>
              選擇客戶 {selectedCustomer && `(已選擇: ${selectedCustomer.customer_name})`}
            </Typography>
            
            {selectedCustomer ? (
              // 顯示已選擇的客戶
              <Paper 
                elevation={1} 
                style={{ 
                  border: '2px solid #1976d2',
                  borderRadius: 4
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#e3f2fd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        {selectedCustomer.customer_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                        聯絡人: {[selectedCustomer.contact1_name, selectedCustomer.contact2_name, selectedCustomer.contact3_name]
                          .filter(Boolean).join(', ') || '無'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                        電話: {[selectedCustomer.contact1_contact, selectedCustomer.contact2_contact, selectedCustomer.contact3_contact]
                          .filter(Boolean).join(', ') || '無'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        地址: {`${selectedCustomer.contact_city || ''}${selectedCustomer.contact_district || ''}${selectedCustomer.contact_address || ''}` || '無'}
                      </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        backgroundColor: '#1976d2', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: 24, 
                        height: 24, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}>
                        ✓
                      </div>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setProjectData(prev => ({
                            ...prev,
                            customer_id: null,
                          }));
                          setUseCustomerAddress(false);
                        }}
                        style={{ minWidth: 'auto', padding: '4px 8px' }}
                      >
                        重選
                      </Button>
                    </div>
                  </div>
                </div>
              </Paper>
            ) : (
              // 顯示客戶選擇列表
              <Paper 
                elevation={1} 
                style={{ 
                  maxHeight: 200, 
                  overflow: 'auto', 
                  border: '1px solid #e0e0e0',
                  borderRadius: 4
                }}
              >
                {(() => {
                  const filteredCustomers = [...(customers || [])].filter((customer) => {
                    // 搜索邏輯
                    if (customerSearchQuery.trim() !== "") {
                      const searchLower = customerSearchQuery.toLowerCase();

                      if (customerFilters.length === 0) {
                        return (
                          customer.customer_name?.toLowerCase().includes(searchLower) ||
                          `${customer.contact1_name || ""}${customer.contact2_name || ""}${customer.contact3_name || ""}`
                            .toLowerCase()
                            .includes(searchLower) ||
                          `${customer.contact1_contact || ""}${customer.contact2_contact || ""}${customer.contact3_contact || ""}`
                            .toLowerCase()
                            .includes(searchLower) ||
                          `${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`
                            .toLowerCase()
                            .includes(searchLower)
                        );
                      }

                      const matchesAnyField = customerFilters.some((filter) => {
                        switch (filter) {
                          case "客戶名稱":
                            return customer.customer_name?.toLowerCase().includes(searchLower);
                          case "聯絡人姓名":
                            return `${customer.contact1_name || ""}${customer.contact2_name || ""}${customer.contact3_name || ""}`
                              .toLowerCase()
                              .includes(searchLower);
                          case "電話":
                            return `${customer.contact1_contact || ""}${customer.contact2_contact || ""}${customer.contact3_contact || ""}`
                              .toLowerCase()
                              .includes(searchLower);
                          case "地址":
                            return `${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`
                              .toLowerCase()
                              .includes(searchLower);
                          default:
                            return false;
                        }
                      });

                      if (!matchesAnyField) return false;
                    }

                    return true;
                  }).sort((a, b) => 
                    new Date(b.created_at || 0) - new Date(a.created_at || 0)
                  );

                  if (filteredCustomers.length === 0) {
                    return (
                      <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                        {customerSearchQuery.trim() !== "" || customerFilters.length > 0 
                          ? "沒有符合篩選條件的客戶" 
                          : "請輸入搜尋條件或選擇篩選條件"}
                      </div>
                    );
                  }

                  return filteredCustomers.map((customer) => (
                    <div
                      key={customer.customer_id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setProjectData(prev => ({
                          ...prev,
                          customer_id: customer.customer_id,
                        }));
                        // 當客戶改變時重置地址複製選項
                        setUseCustomerAddress(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {customer.customer_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                            聯絡人: {[customer.contact1_name, customer.contact2_name, customer.contact3_name]
                              .filter(Boolean).join(', ') || '無'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                            電話: {[customer.contact1_contact, customer.contact2_contact, customer.contact3_contact]
                              .filter(Boolean).join(', ') || '無'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            地址: {`${customer.contact_city || ''}${customer.contact_district || ''}${customer.contact_address || ''}` || '無'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </Paper>
            )}
          </div>

          
          
          {/* 客戶選擇列表
          <Autocomplete
            options={
              [...customers].filter((customer) => {
                // 搜索邏輯
                if (customerSearchQuery.trim() !== "") {
                  const searchLower = customerSearchQuery.toLowerCase();

                  if (customerFilters.length === 0) {
                    return (
                      customer.customer_name?.toLowerCase().includes(searchLower) ||
                      `${customer.contact1_name || ""}${customer.contact2_name || ""}${customer.contact3_name || ""}`
                        .toLowerCase()
                        .includes(searchLower) ||
                      `${customer.contact1_contact || ""}${customer.contact2_contact || ""}${customer.contact3_contact || ""}`
                        .toLowerCase()
                        .includes(searchLower) ||
                      `${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`
                        .toLowerCase()
                        .includes(searchLower)
                    );
                  }

                  const matchesAnyField = customerFilters.some((filter) => {
                    switch (filter) {
                      case "客戶名稱":
                        return customer.customer_name?.toLowerCase().includes(searchLower);
                      case "聯絡人姓名":
                        return `${customer.contact1_name || ""}${customer.contact2_name || ""}${customer.contact3_name || ""}`
                          .toLowerCase()
                          .includes(searchLower);
                      case "電話":
                        return `${customer.contact1_contact || ""}${customer.contact2_contact || ""}${customer.contact3_contact || ""}`
                          .toLowerCase()
                          .includes(searchLower);
                      case "地址":
                        return `${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`
                          .toLowerCase()
                          .includes(searchLower);
                      default:
                        return false;
                    }
                  });

                  if (!matchesAnyField) return false;
                }

                return true;
              }).sort((a, b) => 
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
              )
            }            
            getOptionLabel={(option) => option.customer_name}
            value={selectedCustomer}
            onChange={(event, newValue) => {
              setSelectedCustomer(newValue);
              setProjectData(prev => ({
                ...prev,
                customer_id: newValue?.customer_id || null,
              }));
              // 當客戶改變時重置地址複製選項
              setUseCustomerAddress(false);
            }}
            renderInput={(params) => (
              <TextField {...params} label="選擇客戶" margin="normal" />
            )}
          />
           */}
          <TextField
            name="project_name"
            label="專案名稱"
            fullWidth
            margin="normal"
            value={projectData.project_name}
            onChange={handleChange}
            required
          />
          
          <Typography variant="h6" gutterBottom>聯絡人資訊</Typography>
          {selectedCustomer && (
            <FormControl component="fieldset" style={{ marginTop: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* 聯絡資訊同客戶資料 */}
                <Checkbox
                  checked={useCustomerContacts}
                  onChange={async (e) => {
                    setUseCustomerContacts(e.target.checked);
                    if (e.target.checked) {
                      const { data, error } = await supabase
                        .from('customer_database')
                        .select('*')
                        .eq('customer_id', selectedCustomer.customer_id)
                        .single();
                      if (error) return;
                      setProjectData(prev => ({
                        ...prev,
                        contacts: [
                          ...(data.contact1_name ? [{
                            role: data.contact1_role || "",
                            name: data.contact1_name || "",
                            contactType: data.contact1_type || "",
                            contact: data.contact1_contact || ""
                          }] : []),
                          ...(data.contact2_name ? [{
                            role: data.contact2_role || "",
                            name: data.contact2_name || "",
                            contactType: data.contact2_type || "",
                            contact: data.contact2_contact || ""
                          }] : []),
                          ...(data.contact3_name ? [{
                            role: data.contact3_role || "",
                            name: data.contact3_name || "",
                            contactType: data.contact3_type || "",
                            contact: data.contact3_contact || ""
                          }] : [])
                        ].filter(contact => contact.name)
                      }));
                    } else {
                      setProjectData(prev => ({
                        ...prev,
                        contacts: [{ role: "", name: "", contactType: "", contact: "" }]
                      }));
                    }
                  }}
                />
                <Typography>聯絡資訊同客戶資料</Typography>
              </div>
            </FormControl>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
            {/* 預設聯絡人 1 */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <TextField
                label="職位"
                fullWidth
                value={projectData.contacts[0]?.role || ""}
                onChange={(e) => updateContact(0, "role", e.target.value)}
              />
              <TextField
                label="名字"
                fullWidth
                value={projectData.contacts[0]?.name || ""}
                onChange={(e) => updateContact(0, "name", e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>聯絡方式類型</InputLabel>
                <Select
                  value={projectData.contacts[0]?.contactType || ""}
                  onChange={(e) => updateContact(0, "contactType", e.target.value)}
                >
                  {["電話", "市話", "LineID", "Email"].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={projectData.contacts[0]?.contactType || "聯絡方式"}
                fullWidth
                value={projectData.contacts[0]?.contact || ""}
                onChange={(e) => {
                  let formattedValue = e.target.value;

                  // 自動格式化電話號碼
                  if (projectData.contacts[0]?.contactType === "電話") {
                    formattedValue = formattedValue
                      .replace(/[^\d]/g, "")
                      .replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                  } else if (projectData.contacts[0]?.contactType === "市話") {
                    formattedValue = formattedValue
                      .replace(/[^\d]/g, "")
                      .replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                  }

                  const newContacts = [...projectData.contacts];
                  newContacts[0] = { ...newContacts[0], contact: formattedValue };
                  setProjectData({ ...projectData, contacts: newContacts });
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
          {/* 動態聯絡人 1 */}
          {projectData.contacts?.map((contact, index) => {
            if (index === 0) return null; // 跳過預設聯絡人
            return (
            <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <TextField
                label="職位"
                fullWidth
                value={contact.role || ""}
                onChange={(e) => updateContact(index, "role", e.target.value)}
              />
              <TextField
                label="名字"
                fullWidth
                value={contact.name || ""}
                onChange={(e) => updateContact(index, "name", e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>聯絡方式類型</InputLabel>
                <Select
                  value={contact.contactType || ""}
                  onChange={(e) => updateContact(index, "contactType", e.target.value)}
                >
                  {["電話", "市話", "LineID", "Email"].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={contact.contactType || "聯絡方式"}
                fullWidth
                value={contact.contact || ""}
                onChange={(e) => {
                  let formattedValue = e.target.value;
                  if (contact.contactType === "電話") {
                    formattedValue = formattedValue
                      .replace(/[^\d]/g, "")
                      .replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                  } else if (contact.contactType === "市話") {
                    formattedValue = formattedValue
                      .replace(/[^\d]/g, "")
                      .replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                  }
                  const newContacts = [...projectData.contacts];
                  newContacts[index] = { ...newContacts[index], contact: formattedValue };
                  setProjectData({ ...projectData, contacts: newContacts });
                }}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  const updatedContacts = projectData.contacts.filter((_, i) => i !== index);
                  setProjectData({ ...projectData, contacts: updatedContacts });
                }}
              >
                刪除
              </Button>
            </div>
            );})}

          <Button
            variant="outlined"
            onClick={() => {
              const updatedContacts = [...(projectData.contacts || []), { role: "", name: "", contactType: "", contact: "" }];
              setProjectData({ ...projectData, contacts: updatedContacts });
            }}
            disabled={projectData.contacts.length >= 3}
          >
            新增聯絡人
          </Button>
        </div>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>施工資訊</Typography>
          {/* 地址同客戶資料 Checkbox */}
            {selectedCustomer && (
              <FormControl component="fieldset" style={{ marginTop: 0, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <Checkbox
                    checked={useCustomerAddress}
                    onChange={async (e) => {
                      setUseCustomerAddress(e.target.checked);
                      if (e.target.checked) {
                        const { data, error } = await supabase
                          .from('customer_database')
                          .select('*')
                          .eq('customer_id', selectedCustomer.customer_id)
                          .single();
                        if (error) return;
                        setProjectData(prev => ({
                          ...prev,
                          site_city: data.contact_city || "",
                          site_district: data.contact_district || "",
                          site_address: data.contact_address || ""
                        }));
                      } else {
                        setProjectData(prev => ({
                          ...prev,
                          site_city: "",
                          site_district: "",
                          site_address: ""
                        }));
                      }
                    }}
                  />
                  <Typography>地址同客戶資料</Typography>
                </div>
              </FormControl>
            )}          {/* 施工地址 */}
          <AddressSelector
            city={projectData.site_city}
            district={projectData.site_district}
            address={projectData.site_address}
            onCityChange={handleCityChange}
            onDistrictChange={handleDistrictChange}
            onAddressChange={(value) => setProjectData(prev => ({ ...prev, site_address: value }))}
            prefix="site"
            required
          />
      
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              name="start_date"
              label="開始日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.start_date}
              onChange={handleChange}
            />
            <TextField
              name="end_date"
              label="結束日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.end_date}
              onChange={handleChange}
            />
          </div>          {/* 施工項目多選 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>施工項目</Typography>
            <Autocomplete
              multiple
              options={constructionItemOptions}
              value={projectData.construction_items || []}
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
                            <AddIcon />
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
            value={projectData.construction_days || ""}
            onChange={(e) => setProjectData({ ...projectData, construction_days: e.target.value })}
          />
          <TextField
            name="construction_scope"
            label="施工範圍"
            fullWidth
            margin="normal"
            value={projectData.construction_scope || ""}
            onChange={(e) => setProjectData({ ...projectData, construction_scope: e.target.value })}
          />
        
          <TextField
            name="construction_notes"
            label="注意事項"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={projectData.construction_notes || ""}
            onChange={(e) => setProjectData({ ...projectData, construction_notes: e.target.value })}
          />

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>收款資訊</Typography>

          {/* 收款方式和收款時間 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <FormControl fullWidth>
              <InputLabel>收款方式</InputLabel>
              <Select
                name="payment_method"
                value={projectData.payment_method || ""}
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
              value={projectData.payment_date || ""}
              onChange={handleChange}
            />
          </div>

          {/* 收款金額 */}
          <TextField
            name="amount"
            label="收款金額"
            type="number"
            fullWidth
            margin="normal"
            value={projectData.amount || ""}
            onChange={handleChange}
          />

          {/* 匯款相關資訊 */}
          {projectData.payment_method === '匯款' && (
            <TextField
              name="fee"
              label="手續費"
              type="number"
              fullWidth
              margin="normal"
              value={projectData.fee || ""}
              onChange={handleChange}
            />
          )}

          {/* 支票相關資訊 */}
          {projectData.payment_method === '支票' && (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <TextField
                  name="payer"
                  label="付款人"
                  fullWidth
                  value={projectData.payer || ""}
                  onChange={handleChange}
                />
                <FormControl fullWidth>
                  <InputLabel>收款人</InputLabel>
                  <Select
                    name="payee"
                    value={projectData.payee || ""}
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
                  value={projectData.check_number || ""}
                  onChange={handleChange}
                />
                <TextField
                  name="bank_branch"
                  label="銀行分行"
                  fullWidth
                  value={projectData.bank_branch || ""}
                  onChange={handleChange}
                />
                <TextField
                  name="due_date"
                  label="到期日"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={projectData.due_date || ""}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>          <Button 
            variant="contained" 
            onClick={handleSaveProject}
            disabled={!projectData.project_name || !projectData.customer_id}
          >
            儲存
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

      {/* MapComponent is no longer rendered here directly */}
      {/* 
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <Typography variant="h6" gutterBottom>
          專案地圖位置
        </Typography>
        <MapComponent projects={filteredProjects} />
      </div>
      */}

      {/* ... (Table remains the same) ... */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "7%" }}>編號</TableCell>
              <TableCell style={{ width: "15%" }}>專案名稱</TableCell>
              <TableCell style={{ width: "15%" }}>客戶名稱</TableCell>
              <TableCell style={{ width: "27%" }}>施工地址</TableCell>
              <TableCell style={{ width: "12%" }}>
                開始日期
                <TableSortLabel
                  active={sortField === "start_date"}
                  direction={sortField === "start_date" ? sortOrder : "desc"}
                  onClick={() => {
                    if (sortField === "start_date") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortField("start_date");
                      setSortOrder("asc"); // 預設第一次點為升冪
                    }
                  }}
                  // show both arrows
                  IconComponent={TableSortLabel.defaultProps?.IconComponent || undefined}
                />
              </TableCell>
              <TableCell style={{ width: "12%" }}>
                施工狀態
                <IconButton onClick={handleStatusFilterClick}>
                  <FilterListIcon />
                </IconButton>
                <Menu
                  anchorEl={statusAnchorEl}
                  open={Boolean(statusAnchorEl)}
                  onClose={() => handleStatusFilterClose()}
                >
                  <MenuItem onClick={() => handleStatusFilterClose("")}>全部</MenuItem>
                  {constructionStatusOptions.map((status) => (
                    <MenuItem key={status} onClick={() => handleStatusFilterClose(status)}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusStyle(status, 'construction').bg,
                          color: getStatusStyle(status, 'construction').color,
                          fontWeight: 500,
                        }}
                      >
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>
              <TableCell style={{ width: "12%" }}>
                請款狀態
                <IconButton onClick={handleBillingFilterClick}>
                  <FilterListIcon />
                </IconButton>
                <Menu
                  anchorEl={billingAnchorEl}
                  open={Boolean(billingAnchorEl)}
                  onClose={() => handleBillingFilterClose()}
                >
                  <MenuItem onClick={() => handleBillingFilterClose("")}>全部</MenuItem>
                  {billingStatusOptions.map((status) => (
                    <MenuItem key={status} onClick={() => handleBillingFilterClose(status)}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusStyle(status, 'billing').bg,
                          color: getStatusStyle(status, 'billing').color,
                          fontWeight: 500,
                        }}
                      >
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedProjects.map((project, index) => (
              <TableRow 
                key={project.project_id}
                hover
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/order/${project.project_id}`)}
              >
                <TableCell style={{ width: "7%" }}>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell style={{ width: "15%" }}>{project.project_name}</TableCell>
                <TableCell style={{ width: "15%" }}>{project.customer_database?.customer_name}</TableCell>
                <TableCell style={{ width: "27%" }}>{`${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`}</TableCell>
                <TableCell style={{ width: "12%" }}>{project.start_date}</TableCell>
                <TableCell style={{ width: "12%" }}>
                  <Box
                    onClick={(e) => handleOpenStatusMenu(e, project, 'construction')}
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: getStatusStyle(project.construction_status, 'construction').bg,
                      color: getStatusStyle(project.construction_status, 'construction').color,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {project.construction_status}
                  </Box>
                </TableCell>

                <TableCell style={{ width: "12%" }}>
                  <Box
                    onClick={(e) => handleOpenStatusMenu(e, project, 'billing')}
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: getStatusStyle(project.billing_status, 'billing').bg,
                      color: getStatusStyle(project.billing_status, 'billing').color,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {project.billing_status}
                  </Box>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredAndStatusProjects.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          labelRowsPerPage="每頁顯示筆數"
        />
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseStatusMenu}
      >
        {(menuType === 'construction' ? constructionStatusOptions : billingStatusOptions).map(option => (
          <MenuItem key={option} onClick={() => updateStatus(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>



      <Dialog open={trackDialogOpen} onClose={() => setTrackDialogOpen(false)}>
        <DialogTitle>是否要繼續追蹤此專案？</DialogTitle>
        <DialogContent>
          <Typography>
            此專案已完成，是否要設定後續追蹤提醒？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackDialogOpen(false)}>否</Button>
          <Button
            variant="contained"
            onClick={() => {
              setTrackDialogOpen(false);
              // 跳轉到專案頁面並帶參數（或開啟追蹤設定 Dialog）
              navigate(`/order/${trackProject.project_id}?setTrack=1`);
            }}
          >
            是
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
