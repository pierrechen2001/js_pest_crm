import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  useTheme
} from '@mui/material';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


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
  "桃園市": [
    "桃園區", "中壢區", "平鎮區", "八德區", "楊梅區", "大溪區", "龜山區", 
    "龍潭區", "大園區", "觀音區", "新屋區", "復興區"
  ],
  "台中市": [
    "中區", "東區", "南區", "西區", "北區", "西屯區", "南屯區", "北屯區", 
    "大甲區", "大里區", "太平區", "南區", "西區", "潭子區", "清水區", "梧棲區", 
    "龍井區", "沙鹿區", "大肚區", "和平區"
  ],
  "台南市": [
    "中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", 
    "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", 
    "關廟區", "龍崎區", "官田區", "麻豆區", "佳里區", "西港區", "七股區", 
    "將軍區", "學甲區", "北門區", "新市區", "鹽水區", "白河區", 
    "東山區", "六甲區", "下營區", "柳營區", "鹽水區", "南化區"
  ],
  "高雄市": [
    "楠梓區", "左營區", "鼓山區", "三民區", "鹽埕區", "新興區", "前金區", 
    "苓雅區", "前鎮區", "小港區", "鳳山區", "林園區", "大寮區", "大樹區", 
    "旗山區", "美濃區", "六龜區", "甲仙區", "杉林區", "內門區", "茂林區", 
    "桃源區", "高雄市區"
  ],
  "基隆市": [
    "中正區", "七堵區", "暖暖區", "仁愛區", "信義區", "中山區", "安樂區", 
    "北區", "南區"
  ],
  "新竹市": [
    "東區", "北區", "香山區"
  ],
  "新竹縣": [
    "竹北市", "湖口鄉", "新豐鄉", "關西鎮", "芎林鄉", "寶山鄉", "竹東鎮", 
    "五峰鄉", "橫山鄉", "尖石鄉", "北埔鄉", "峨眉鄉"
  ],
  "苗栗縣": [
    "苗栗市", "三灣鄉", "獅潭鄉", "後龍鎮", "通霄鎮", "南庄鄉", "獅潭鄉", 
    "大湖鄉", "公館鄉", "銅鑼鄉", "三義鄉", "西湖鄉", "卓蘭鎮"
  ],
  "屏東縣": [
    "屏東市", "三地門鄉", "霧台鄉", "瑪家鄉", "九如鄉", "里港鄉", "高樹鄉", "鹽埔鄉", "長治鄉", 
    "麟洛鄉", "竹田鄉", "內埔鄉", "萬丹鄉", "潮州鄉", "東港鄉", "南州鄉", "佳冬鄉", "新園鄉", 
    "枋寮鄉", "枋山鄉", "春日鄉", "獅子鄉", "車城鄉", "恆春鄉", "滿州鄉"
  ],
  "台東縣": [
    "台東市", "綠島鄉", "蘭嶼鄉", "延平鄉", "卑南鄉", "鹿野鄉", "關山鄉", "海端鄉", "池上鄉", 
    "東河鄉", "成功鄉", "長濱鄉", "太麻里鄉"
  ],
  "澎湖縣": [
    "馬公市", "西嶼鄉", "望安鄉", "赫哲鄉", "金門縣"
  ],
  "嘉義市": ["東區", "西區"],
  "彰化縣": [
    "彰化市", "員林市", "和美鎮", "鹿港鎮", "溪湖鎮", "二林鎮", "田中鎮", "北斗鎮",
    "花壇鄉", "芬園鄉", "大村鄉", "埔鹽鄉", "埔心鄉", "永靖鄉", "社頭鄉", "二水鄉",
    "田尾鄉", "埤頭鄉", "芳苑鄉", "大城鄉", "竹塘鄉", "溪州鄉"
  ],
  "南投縣": [
    "南投市", "埔里鎮", "草屯鎮", "竹山鎮", "集集鎮", "名間鄉", "鹿谷鄉", "中寮鄉",
    "魚池鄉", "國姓鄉", "水里鄉", "信義鄉", "仁愛鄉"
  ],
  "雲林縣": [
    "斗六市", "斗南鎮", "虎尾鎮", "西螺鎮", "土庫鎮", "北港鎮", "古坑鄉", "大埤鄉",
    "莿桐鄉", "林內鄉", "二崙鄉", "崙背鄉", "麥寮鄉", "東勢鄉", "褒忠鄉", "臺西鄉",
    "元長鄉", "四湖鄉", "口湖鄉", "水林鄉"
  ],
  "宜蘭縣": [
    "宜蘭市", "羅東鎮", "蘇澳鎮", "頭城鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "冬山鄉",
    "五結鄉", "三星鄉", "大同鄉", "南澳鄉"
  ],
  "花蓮縣": [
    "花蓮市", "鳳林鎮", "玉里鎮", "新城鄉", "吉安鄉", "壽豐鄉", "光復鄉", "豐濱鄉",
    "瑞穗鄉", "萬榮鄉", "卓溪鄉", "富里鄉"
  ],
  "金門縣": [
    "金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"
  ],
  "連江縣": [
    "南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"
  ],
};

const CustomerDetails = ({ customers, fetchProjectsByCustomerId }) => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(null);
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
    contact1_role: "",
    contact1_name: "",
    contact1_type: "",
    contact1_contact: "",
    contact2_role: "",
    contact2_name: "",
    contact2_type: "",
    contact2_contact: ""
  });
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

  // 處理新增專案
  const handleSaveProject = async () => {
    try {
      const { data, error } = await supabase
        .from('project')
        .insert([{
          project_name: projectData.project_name,
          customer_id: customerId,
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
          contact1_role: projectData.contact1_role,
          contact1_name: projectData.contact1_name,
          contact1_type: projectData.contact1_type,
          contact1_contact: projectData.contact1_contact,
          contact2_role: projectData.contact2_role,
          contact2_name: projectData.contact2_name,
          contact2_type: projectData.contact2_type,
          contact2_contact: projectData.contact2_contact
        }])
        .select();
  
      if (error) throw error;
  
      setProjects(prev => [...prev, data[0]]);
      setOpenDialog(false);
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
        contact1_role: "",
        contact1_name: "",
        contact1_type: "",
        contact1_contact: "",
        contact2_role: "",
        contact2_name: "",
        contact2_type: "",
        contact2_contact: ""
      });
    } catch (error) {
      console.error('Error saving project:', error);
      // 可以添加錯誤提示
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
        defaultExpanded={false}
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
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
        defaultExpanded={false}
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
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
          flex: 1,
          width: '100%',
          display: 'flex',
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
    </Box>
  );
};

export default CustomerDetails;
