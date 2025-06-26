import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { geocodeAddress, combineAddress } from '../lib/geocoding';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddressSelector from '../components/AddressSelector';

import {
  IconButton,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  Checkbox
} from '@mui/material';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CustomerDetails = ({ customers, fetchProjectsByCustomerId }) => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(null);
  const [useCustomerAddress, setUseCustomerAddress] = useState(false);
  const [useCustomerContacts, setUseCustomerContacts] = useState(false);
  const [isConstructionScopeExpanded, setIsConstructionScopeExpanded] = useState(false);
  const [projectData, setProjectData] = useState({
    project_name: "",
    customer_id: customerId,
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
    ]
  });
  const theme = useTheme();

  const customer = customers.find((c) => c.customer_id === customerId);

  // 使用客戶資訊自動填入專案聯絡人
  useEffect(() => {
    if (customer) {
      // 當客戶資訊改變時，更新專案聯絡人資訊
      const contacts = [];
      
      if (customer.contact1_name) {
        contacts.push({
          role: customer.contact1_role || "",
          name: customer.contact1_name || "",
          contactType: customer.contact1_type || "",
          contact: customer.contact1_contact || ""
        });
      }
      
      if (customer.contact2_name) {
        contacts.push({
          role: customer.contact2_role || "",
          name: customer.contact2_name || "",
          contactType: customer.contact2_type || "",
          contact: customer.contact2_contact || ""
        });
      }
      
      if (customer.contact3_name) {
        contacts.push({
          role: customer.contact3_role || "",
          name: customer.contact3_name || "",
          contactType: customer.contact3_type || "",
          contact: customer.contact3_contact || ""
        });
      }
      
      if (contacts.length > 0) {
        setProjectData(prev => ({
          ...prev,
          customer_id: customerId,
          contacts: contacts
        }));
      }
    }
  }, [customer, customerId]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('project')
          .select('*')
          .eq('customer_id', customerId);
  
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [customerId, fetchProjectsByCustomerId]);

  // 處理新增專案
  const handleSaveProject = async () => {
    try {
      // 日期欄位處理：空字串轉 null
      const safeDate = (d) => d && d.length >= 10 ? d : null;
      // 數字欄位處理：空字串轉 null
      const safeInt = (n) => n === "" || n === undefined ? null : parseInt(n, 10);
      const safeFloat = (n) => n === "" || n === undefined ? null : parseFloat(n);

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
          customer_id: customerId,
          site_city: projectData.site_city,
          site_district: projectData.site_district,
          site_address: projectData.site_address,
          construction_item: projectData.construction_item,
          construction_fee: safeFloat(projectData.construction_fee),
          start_date: safeDate(projectData.start_date),
          end_date: safeDate(projectData.end_date),
          construction_days: safeInt(projectData.construction_days),
          construction_scope: projectData.construction_scope,
          project_notes: projectData.construction_notes,
          payment_method: projectData.payment_method,
          payment_date: safeDate(projectData.payment_date),
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
        .select();
  
      if (error) {
        alert("儲存失敗：" + error.message);
        console.error('Error saving project:', error);
        return;
      }
  
      setProjects(prev => [...prev, data[0]]);
      setOpenDialog(false);
      // 重置表單
      setProjectData({
        project_name: "",
        customer_id: customerId,
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
        ]
      });
      alert("專案已成功儲存！");
    } catch (error) {
      alert("儲存失敗，請稍後再試！");
      console.error('Error saving project:', error);
    }
  };

  // 處理表單變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCityChange = (newValue) => {
    setProjectData((prev) => ({
      ...prev,
      site_city: newValue,
      site_district: "", // 當縣市變更時，清空區域
    }));
  };
  
  const handleDistrictChange = (newValue) => {
    setProjectData((prev) => ({
      ...prev,
      site_district: newValue,
    }));
  };

  // 處理聯絡人更新
  const updateContact = (index, field, value) => {
    const updated = [...projectData.contacts];
    if (!updated[index]) {
      updated[index] = { role: "", name: "", contactType: "", contact: "" };
    }
    updated[index] = { ...updated[index], [field]: value };
    setProjectData({ ...projectData, contacts: updated });
  };

  // 使用地址同客戶資料
  const fillCustomerAddress = () => {
    if (customer) {
      setProjectData(prev => ({
        ...prev,
        site_city: customer.contact_city || "",
        site_district: customer.contact_district || "",
        site_address: customer.contact_address || ""
      }));
    }
  };

  const handleDeleteCustomer = async () => {
    if (window.confirm("確定要刪除此客戶嗎？此操作無法復原！")) {
      try {
        const { error } = await supabase
          .from('customer_database') // 替換為你的客戶資料表名稱
          .delete()
          .eq('customer_id', customerId);
  
        if (error) throw error;
  
        alert("客戶已成功刪除！");
        navigate('/customers'); // 刪除成功後返回客戶列表頁
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("刪除客戶失敗，請稍後再試！");
      }
    }
  };

  // 新增編輯客戶資料的函數
  const handleEditCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_database')
        .update({
          customer_name: editedCustomer.customer_name,
          contact1_role: editedCustomer.contact1_role,
          contact1_name: editedCustomer.contact1_name,
          contact1_type: editedCustomer.contact1_type,
          contact1_contact: editedCustomer.contact1_contact,
          contact2_role: editedCustomer.contact2_role,
          contact2_name: editedCustomer.contact2_name,
          contact2_type: editedCustomer.contact2_type,
          contact2_contact: editedCustomer.contact2_contact,
          contact3_role: editedCustomer.contact3_role,
          contact3_name: editedCustomer.contact3_name,
          contact3_type: editedCustomer.contact3_type,
          contact3_contact: editedCustomer.contact3_contact,
          contact_city: editedCustomer.contact_city,
          contact_district: editedCustomer.contact_district,
          contact_address: editedCustomer.contact_address,
          company_phone: editedCustomer.company_phone,
          fax: editedCustomer.fax,
          tax_id: editedCustomer.tax_id,
          invoice_title: editedCustomer.invoice_title,
          notes: editedCustomer.notes
        })
        .eq('customer_id', customerId)
        .select();

      if (error) throw error;

      // 更新本地狀態
      const updatedCustomers = customers.map(c => 
        c.customer_id === customerId ? data[0] : c
      );
      setEditedCustomer(data[0]);
      setOpenEditDialog(false);
      window.location.reload(); // 重新載入頁面以更新資料
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('更新客戶資料失敗，請稍後再試！');
    }
  };

  // 處理編輯表單變更
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理城市和區域變更
  const handleEditCityChange = (newValue) => {
    setEditedCustomer(prev => ({
      ...prev,
      contact_city: newValue,
      contact_district: "" // 當縣市變更時，清空區域
    }));
  };
  const handleEditDistrictChange = (newValue) => {
    setEditedCustomer(prev => ({
      ...prev,
      contact_district: newValue
    }));
  };

  // AddressSelector 回調函數
  const handleEditAddressChange = (addressData) => {
    setEditedCustomer(prev => ({
      ...prev,
      contact_city: addressData.city,
      contact_district: addressData.district,
      contact_address: addressData.address
    }));
  };

  const handleProjectAddressChange = (addressData) => {
    setProjectData(prev => ({
      ...prev,
      site_city: addressData.city,
      site_district: addressData.district,
      site_address: addressData.address
    }));
  };

  // 在 useEffect 中初始化 editedCustomer
  useEffect(() => {
    if (customer) {
      setEditedCustomer(customer);
    }
  }, [customer]);

  if (!customer) return <Typography color="error">無法找到該客戶</Typography>;

  const filteredProjects = projects?.filter((project) => project.customer_id === customerId) || [];

  return (
    
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 4 }}>
      {/* 頂部標題區 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => navigate('/customers')}
            sx={{ color: 'primary.main', mr: 1 }}
          >
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" color="primary.black">
            {customer.customer_name}
          </Typography>
        </Box>
          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>編輯客戶資料</DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>客戶基本資訊</Typography>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField
                  label="客戶名稱"
                  fullWidth
                  name="customer_name"
                  value={editedCustomer?.customer_name || ""}
                  onChange={handleEditChange}
                />              </div>
              <div style={{ marginBottom: "20px" }}>
                <AddressSelector
                  city={editedCustomer?.contact_city || ""}
                  district={editedCustomer?.contact_district || ""}
                  address={editedCustomer?.contact_address || ""}
                  onAddressChange={handleEditAddressChange}
                  cityLabel="縣市"
                  districtLabel="區域"
                  addressLabel="路名/詳細地址"
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField
                  label="統一編號"
                  fullWidth
                  name="tax_id"
                  value={editedCustomer?.tax_id || ""}
                  onChange={handleEditChange}
                />
                <TextField
                  label="抬頭"
                  fullWidth
                  name="invoice_title"
                  value={editedCustomer?.invoice_title || ""}
                  onChange={handleEditChange}
                />
              </div>

              <Typography variant="h6" gutterBottom>聯絡資訊</Typography>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
                <TextField
                  label="公司電話（市話）"
                  fullWidth
                  name="company_phone"
                  value={editedCustomer?.company_phone || ""}
                  onChange={handleEditChange}
                />
                <TextField
                  label="傳真號碼"
                  fullWidth
                  name="fax"
                  value={editedCustomer?.fax || ""}
                  onChange={handleEditChange}
                />
                <TextField
                  label="公司信箱"
                  fullWidth
                  name="email"
                  value={editedCustomer?.email || ""}
                  onChange={handleEditChange}
                />
              </div>

              {/* 聯絡人資訊（動態三組） */}
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                  <TextField
                    label={`聯絡人${i}職位`}
                    name={`contact${i}_role`}
                    fullWidth
                    margin="dense"
                    value={editedCustomer?.[`contact${i}_role`] || ""}
                    onChange={handleEditChange}
                  />
                  <TextField
                    label={`聯絡人${i}姓名`}
                    name={`contact${i}_name`}
                    fullWidth
                    margin="dense"
                    value={editedCustomer?.[`contact${i}_name`] || ""}
                    onChange={handleEditChange}
                  />
                  <FormControl fullWidth>
                    <InputLabel>聯絡方式類型</InputLabel>
                    <Select
                      name={`contact${i}_type`}
                      value={editedCustomer?.[`contact${i}_type`] || ""}
                      onChange={handleEditChange}
                      label="聯絡方式類型"
                    >
                      {["LineID", "市話", "電話", "信箱"].map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label={`聯絡人${i}聯絡方式`}
                    name={`contact${i}_contact`}
                    fullWidth
                    margin="dense"
                    value={editedCustomer?.[`contact${i}_contact`] || ""}
                    onChange={handleEditChange}
                  />
                </div>
              ))}

              <TextField
                label="注意事項"
                name="notes"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={editedCustomer?.notes || ""}
                onChange={handleEditChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>取消</Button>
              <Button variant="contained" onClick={handleEditCustomer}>儲存</Button>
            </DialogActions>
          </Dialog>
        <Box>
          <Button variant="contained" color="primary" sx={{ mr: 2, borderRadius: 2, textTransform: 'none', px: 3 }} onClick={() => setOpenEditDialog(true)}>編輯客戶</Button>
          <Button variant="outlined" color="error" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }} onClick={handleDeleteCustomer}>刪除客戶</Button>
        </Box>
      </Box>


<Card
  sx={{
    width: '100%',
    mb: 4,
    borderRadius: 2,
    p: 3,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  }}
>
  <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
    客戶資訊
  </Typography>
  <Divider sx={{ mb: 2 }} />

  <Grid container spacing={2} wrap="nowrap" sx={{ width: '100%' }}>
    {/* 公司資料 */}
    <Grid item xs={12} md={4} sx={{
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,         // ✅ 防止內容把欄位撐寬
      flexBasis: 0,        // ✅ 保證三欄等寬
      flexGrow: 1,         // ✅ 撐滿整排空間
    }}>
      <Accordion
        defaultExpanded={true}
        sx={{

          width: '100%',
          display: 'block',
          flexDirection: 'column',
          '& .MuiAccordionSummary-content': {
            margin: 0,
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">公司資訊</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ flex: 1, width: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 1 }}><b>公司名稱：</b>{customer.customer_name}</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 1 }}><b>公司地址：</b>{`${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`}</Typography>
          <Typography sx={{ mb: 1 }}><b>公司電話：</b>{customer.company_phone}</Typography>
          <Typography sx={{ mb: 1 }}><b>傳真：</b>{customer.fax}</Typography>
          <Typography sx={{ mb: 1 }}><b>統一編號：</b>{customer.tax_id}</Typography>
          <Typography sx={{ mb: 1 }}><b>抬頭：</b>{customer.invoice_title}</Typography>
        </AccordionDetails>
      </Accordion>
    </Grid>

    {/* 聯絡人資料 */}
   <Grid item xs={12} md={4} sx={{
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,         // ✅ 防止內容把欄位撐寬
      flexBasis: 0,        // ✅ 保證三欄等寬
      flexGrow: 1,         // ✅ 撐滿整排空間
    }}>
      <Accordion
        defaultExpanded={true}
        sx={{

          width: '100%',
          display: 'block',
          flexDirection: 'column',
          '& .MuiAccordionSummary-content': {
            margin: 0,
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">聯絡人資訊</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ flex: 1, width: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {[1, 2, 3].map(i => {
            const name = customer[`contact${i}_name`];
            if (!name) return null;
            return (
              <Typography sx={{ mb: 1 }} key={i}>
                <b>{customer[`contact${i}_role`] ? customer[`contact${i}_role`] + '：' : ''}</b>
                {name}
                {customer[`contact${i}_type`] && <span style={{ color: '#888', marginLeft: 8 }}>{customer[`contact${i}_type`]}：</span>}
                {customer[`contact${i}_contact`] && <span style={{ marginLeft: 8 }}>{customer[`contact${i}_contact`]}</span>}
              </Typography>
            );
          })}
        </AccordionDetails>
      </Accordion>
    </Grid>

    {/* 注意事項 */}
    <Grid item xs={12} md={4} sx={{
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,         // ✅ 防止內容把欄位撐寬
      flexBasis: 0,        // ✅ 保證三欄等寬
      flexGrow: 1,         // ✅ 撐滿整排空間
    }}>
      <Accordion
        defaultExpanded={false}
        sx={{

          width: '100%',
          display: 'block',
          flexDirection: 'column',
          '& .MuiAccordionSummary-content': {
            margin: 0,
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">注意事項</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ flex: 1, width: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {customer.notes || '（無）'}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Grid>
  </Grid>
</Card>



      {/* 專案資訊卡片 */}
      <Card sx={{ borderRadius: 2, p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" color="primary">對應專案</Typography>
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }} onClick={() => setOpenDialog(true)}>新增專案</Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {filteredProjects.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>目前無專案資料</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>專案名稱</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>施工地址</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>開始日期</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>施工狀態</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>請款狀態</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project, index) => (
                  <TableRow 
                    key={project.project_id || index}
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                    onClick={() => navigate(`/order/${project.project_id}`)}
                  >
                    <TableCell>{project.project_name}</TableCell>
                    <TableCell>{`${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`}</TableCell>
                    <TableCell>{project.start_date}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: project.construction_status === '未開始' ? theme.palette.grey[200] :
                                         project.construction_status === '進行中' ? theme.palette.info.light :
                                         project.construction_status === '已完成' ? theme.palette.success.light :
                                         theme.palette.warning.light,
                          color: project.construction_status === '未開始' ? theme.palette.grey[700] :
                                 project.construction_status === '進行中' ? theme.palette.info.dark :
                                 project.construction_status === '已完成' ? theme.palette.success.dark :
                                 theme.palette.warning.dark,
                        }}
                      >
                        {project.construction_status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: project.billing_status === '未請款' ? theme.palette.grey[200] :
                                         project.billing_status === '已請款' ? theme.palette.info.light :
                                         project.billing_status === '已收款' ? theme.palette.success.light :
                                         theme.palette.warning.light,
                          color: project.billing_status === '未請款' ? theme.palette.grey[700] :
                                 project.billing_status === '已請款' ? theme.palette.info.dark :
                                 project.billing_status === '已收款' ? theme.palette.success.dark :
                                 theme.palette.warning.dark,
                        }}
                      >
                        {project.billing_status}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      
      {/* 新增專案對話框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>新增專案</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>基本資訊</Typography>
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
              <FormControl component="fieldset" sx={{ mb: 1 }}>
                <Box display="flex" alignItems="center">
                  <Checkbox
                    checked={useCustomerContacts}
                    onChange={(e) => {
                      setUseCustomerContacts(e.target.checked);
                      if (e.target.checked && customer) {
                        // 同步聯絡人
                        const contacts = [];
                        if (customer.contact1_name) {
                          contacts.push({
                            role: customer.contact1_role || "",
                            name: customer.contact1_name || "",
                            contactType: customer.contact1_type || "",
                            contact: customer.contact1_contact || ""
                          });
                        }
                        if (customer.contact2_name) {
                          contacts.push({
                            role: customer.contact2_role || "",
                            name: customer.contact2_name || "",
                            contactType: customer.contact2_type || "",
                            contact: customer.contact2_contact || ""
                          });
                        }
                        if (customer.contact3_name) {
                          contacts.push({
                            role: customer.contact3_role || "",
                            name: customer.contact3_name || "",
                            contactType: customer.contact3_type || "",
                            contact: customer.contact3_contact || ""
                          });
                        }
                        setProjectData(prev => ({
                          ...prev,
                          contacts: contacts.length > 0 ? contacts : [{ role: "", name: "", contactType: "", contact: "" }]
                        }));
                      } else {
                        // 清空聯絡人
                        setProjectData(prev => ({
                          ...prev,
                          contacts: [{ role: "", name: "", contactType: "", contact: "" }]
                        }));
                      }
                    }}
                  />
                  <Typography>聯絡資訊同客戶資料</Typography>
                </Box>
              </FormControl>
                {projectData.contacts.map((contact, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px"}}>
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

                    updateContact(index, "contact", formattedValue);
                  }}
                />
                {index > 0 && (
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
                )}
              </div>
            ))}
            
            <Button
              variant="outlined"
              onClick={() => {
                const updatedContacts = [
                  ...projectData.contacts,
                  { role: "", name: "", contactType: "", contact: "" }
                ];
                setProjectData({ ...projectData, contacts: updatedContacts });
              }}
              disabled={projectData.contacts.length >= 3}
            >
              新增聯絡人
            </Button>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>施工資訊</Typography>
          <FormControl component="fieldset" style={{ marginTop: 0, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={useCustomerAddress}
                    onChange={(e) => {
                      setUseCustomerAddress(e.target.checked);
                      if (e.target.checked && customer) {
                        setProjectData(prev => ({
                          ...prev,
                          site_city: customer.contact_city || "",
                          site_district: customer.contact_district || "",
                          site_address: customer.contact_address || ""
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
                </div>              </FormControl>
          {/* 施工地址 */}
          <div style={{ marginBottom: "10px" }}>
            <AddressSelector
              city={projectData.site_city || ""}
              district={projectData.site_district || ""}
              address={projectData.site_address || ""}
              onAddressChange={handleProjectAddressChange}
              cityLabel="施工縣市"
              districtLabel="施工區域"
              addressLabel="施工地址"
            />
          </div>
      
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              name="start_date"
              label="開始日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.start_date || ""}
              onChange={handleChange}
            />
            <TextField
              name="end_date"
              label="結束日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.end_date || ""}
              onChange={handleChange}
            />
          </div>

          {/* 施工天數、施工範圍、注意事項 */}
          <TextField
            name="construction_days"
            label="施工天數"
            type="number"
            fullWidth
            margin="normal"
            value={projectData.construction_days || ""}
            onChange={handleChange}
          />
          <Box sx={{ position: 'relative' }}>
            <TextField
              name="construction_scope"
              label="施工範圍"
              fullWidth
              margin="normal"
              multiline
              rows={isConstructionScopeExpanded ? 8 : 2}
              value={projectData.construction_scope || ""}
              onChange={handleChange}
              InputProps={{
                style: { 
                  resize: 'none',
                  overflow: isConstructionScopeExpanded ? 'auto' : 'hidden'
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  maxHeight: isConstructionScopeExpanded ? 'none' : '80px'
                }
              }}
            />
            {projectData.construction_scope && projectData.construction_scope.length > 50 && (
              <Button
                size="small"
                onClick={() => setIsConstructionScopeExpanded(!isConstructionScopeExpanded)}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  minWidth: 'auto',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                {isConstructionScopeExpanded ? '收起' : '顯示更多'}
              </Button>
            )}
          </Box>
        
          <TextField
            name="construction_notes"
            label="注意事項"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={projectData.construction_notes || ""}
            onChange={handleChange}
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
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveProject}
            disabled={!projectData.project_name}
          >
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetails;
