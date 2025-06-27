import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { geocodeAddress, combineAddress } from '../lib/geocoding';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddressSelector from '../components/AddressSelector';
import CustomerForm from '../components/CustomerForm';
import ProjectForm from '../components/ProjectForm';
import {
  IconButton,
  Box,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import { getStatusStyle } from '../utils/statusStyles';

const CustomerDetails = ({ customers, fetchProjectsByCustomerId }) => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const theme = useTheme();

  const customer = customers.find((c) => c.customer_id === customerId);

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

  // 處理專案保存成功後的回調
  const handleProjectSaved = (newProject) => {
    setProjects(prev => [...prev, newProject]);
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
  const handleEditCustomer = async (updatedData) => {
    try {
      // 轉換欄位名稱格式以符合資料庫期望
      const formattedData = {
        customer_type: updatedData.customerType,
        customer_name: updatedData.customer_name,
        contact_city: updatedData.contact_city,
        contact_district: updatedData.contact_district,
        contact_address: updatedData.contact_address,
        email: updatedData.email,
        tax_id: updatedData.tax_id,
        invoice_title: updatedData.invoice_title,
        notes: updatedData.notes,
        company_phone: updatedData.company_phone,
        fax: updatedData.fax,
        contact1_role: updatedData.contact1_role,
        contact1_name: updatedData.contact1_name,
        contact1_type: updatedData.contact1_type,
        contact1_contact: updatedData.contact1_contact,
        contact2_role: updatedData.contact2_role,
        contact2_name: updatedData.contact2_name,
        contact2_type: updatedData.contact2_type,
        contact2_contact: updatedData.contact2_contact,
        contact3_role: updatedData.contact3_role,
        contact3_name: updatedData.contact3_name,
        contact3_type: updatedData.contact3_type,
        contact3_contact: updatedData.contact3_contact,
      };

      const { error } = await supabase
        .from('customer_database')
        .update(formattedData)
        .eq('customer_id', customerId)
        .select();

      if (error) throw error;

      setOpenEditDialog(false);
      window.location.reload(); // 重新載入頁面以更新資料
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('更新客戶資料失敗，請稍後再試！');
    }
  };

  // 在 useEffect 中初始化 editedCustomer
  useEffect(() => {
    if (customer) {
      // 如果需要可以在這裡處理其他邏輯
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
          <CustomerForm
            open={openEditDialog}
            onClose={() => setOpenEditDialog(false)}
            onSave={handleEditCustomer}
            initialData={customer}
            mode="edit"
            customerType={customer?.customer_type}
          />
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
          <Typography fontWeight="bold">客戶概覽</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ flex: 1, width: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {/* 根據客戶類型顯示不同的資訊 */}
          {customer.customer_type === "一般住家" ? (
            // 一般住家只顯示基本資訊
            <>
              <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 1 }}><b>住址：</b>{`${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`}</Typography>
              <Typography sx={{ mb: 1 }}><b>市話：</b>{customer.company_phone}</Typography>
              <Typography sx={{ mb: 1 }}><b>信箱：</b>{customer.email}</Typography>
            </>
          ) : (
            // 其他類型顯示完整公司資訊
            <>
              <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 1 }}>
                <b>
                  {customer.customer_type === "建築師" ? "事務所名稱：" :
                   customer.customer_type === "古蹟、政府機關" ? "專案名稱：" :
                   "公司名稱："}
                </b>
                {customer.customer_name}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 1 }}>
                <b>
                  {customer.customer_type === "建築師" ? "事務所地址：" :
                   customer.customer_type === "古蹟、政府機關" ? "專案地址：" :
                   "公司地址："}
                </b>
                {`${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <b>
                  {customer.customer_type === "建築師" ? "事務所市話：" :
                   customer.customer_type === "古蹟、政府機關" ? "市話：" :
                   "公司市話："}
                </b>
                {customer.company_phone}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <b>
                  {customer.customer_type === "建築師" ? "事務所信箱：" :
                   customer.customer_type === "古蹟、政府機關" ? "專案信箱：" :
                   "公司信箱："}
                </b>
                {customer.email}
              </Typography>
              <Typography sx={{ mb: 1 }}><b>傳真：</b>{customer.fax}</Typography>
              <Typography sx={{ mb: 1 }}><b>統一編號：</b>{customer.tax_id}</Typography>
              <Typography sx={{ mb: 1 }}><b>抬頭：</b>{customer.invoice_title}</Typography>
            </>
          )}
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
                    <TableCell>{project.quote_date}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusStyle(project.construction_status, 'construction').bg,
                          color: getStatusStyle(project.construction_status, 'construction').color,
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
                          backgroundColor: getStatusStyle(project.billing_status, 'billing').bg,
                          color: getStatusStyle(project.billing_status, 'billing').color,
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
      <ProjectForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleProjectSaved}
        customers={[]}
        preSelectedCustomer={customer}
        showCustomerSearch={false}
        mode="create"
      />
    </Box>
  );
};

export default CustomerDetails;
