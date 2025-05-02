// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

// const CustomerDetails = ({ customers, fetchProjectsByCustomerId }) => {
//   const { customerId } = useParams(); // 獲取路由參數
//   const [projects, setProjects] = useState([]);
//   const customer = customers.find((c) => c.customer_id === customerId);
  
//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const data = await fetchProjectsByCustomerId(customerId);
//         setProjects(data);
//       } catch (error) {
//         console.error("Error fetching projects:", error);
//       }
//     };

//     fetchProjects();
//   }, [customerId, fetchProjectsByCustomerId]);

//   if (!customer) return <Typography color="error">無法找到該客戶</Typography>;
//   const filteredProjects = projects?.filter((project) => project.customer_id === customerId) || [];

//   // 根據 customerId 過濾出對應的專案
//   return (
//     <div style={{ padding: 20 }}>
//       <Typography variant="h4" gutterBottom>
//         {customer.customer_name} 詳細資訊
//       </Typography>
//       <Typography variant="h6">聯絡資訊</Typography>
//       <Typography>聯絡人 1: {customer.contact_person_1} ({customer.contact_phone_1})</Typography>
//       <Typography>聯絡人 2: {customer.contact_person_2} ({customer.contact_phone_2})</Typography>
//       <Typography>地址: {`${customer.contact_city}${customer.contact_district}${customer.contact_address}`}</Typography>
//       <Typography>統一編號: {customer.tax_id}</Typography>
//       <Typography>抬頭: {customer.invoice_title}</Typography>
//       <Typography>備註: {customer.notes}</Typography>

//       <Typography variant="h6" style={{ marginTop: 20 }}>對應專案</Typography>
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>專案名稱</TableCell>
//               <TableCell>施工地址</TableCell>
//               <TableCell>開始日期</TableCell>
//               <TableCell>施工狀態</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredProjects.length > 0 ? (
//               filteredProjects.map((project) => (
//                 <TableRow key={project.project_id}>
//                   <TableCell>{project.project_name}</TableCell>
//                   <TableCell>{`${project.site_city}${project.site_district}${project.site_address}`}</TableCell>
//                   <TableCell>{project.start_date}</TableCell>
//                   <TableCell>{project.construction_status}</TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={4} align="center">
//                   無專案資料
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </div>
//   );
// };

// export default CustomerDetails;

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Divider } from "@mui/material";

// const CustomerDetails = ({ customers, fetchProjectsByCustomerId }) => {
//   const { customerId } = useParams(); // 獲取路由參數
//   const [projects, setProjects] = useState([]);
//   const customer = customers.find((c) => c.customer_id === customerId);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const data = await fetchProjectsByCustomerId(customerId);
//         setProjects(data);
//       } catch (error) {
//         console.error("Error fetching projects:", error);
//       }
//     };

//     fetchProjects();
//   }, [customerId, fetchProjectsByCustomerId]);

//   if (!customer) return <Typography color="error">無法找到該客戶</Typography>;

//   const filteredProjects = projects?.filter((project) => project.customer_id === customerId) || [];

//   return (
//     <Box sx={{ padding: 4 }}>
//       {/* 客戶詳細資訊區塊 */}
//       <Box sx={{ marginBottom: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           {customer.customer_name} 詳細資訊
//         </Typography>
//         <Divider sx={{ marginBottom: 2 }} />
//         <Typography variant="h6" gutterBottom>
//           聯絡資訊
//         </Typography>
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography>聯絡人 1:</Typography>
//             <Typography>{customer.contact_person_1 || "無"} ({customer.contact_phone_1 || "無"})</Typography>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography>聯絡人 2:</Typography>
//             <Typography>{customer.contact_person_2 || "無"} ({customer.contact_phone_2 || "無"})</Typography>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography>地址:</Typography>
//             <Typography>{`${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`}</Typography>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography>統一編號:</Typography>
//             <Typography>{customer.tax_id || "無"}</Typography>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography>抬頭:</Typography>
//             <Typography>{customer.invoice_title || "無"}</Typography>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography>備註:</Typography>
//             <Typography>{customer.notes || "無"}</Typography>
//           </Box>
//         </Box>
//       </Box>

//       {/* 對應專案區塊 */}
//       <Box>
//         <Typography variant="h6" gutterBottom>
//           對應專案
//         </Typography>
//         <Divider sx={{ marginBottom: 2 }} />
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>專案名稱</TableCell>
//                 <TableCell>施工地址</TableCell>
//                 <TableCell>開始日期</TableCell>
//                 <TableCell>施工狀態</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredProjects.length > 0 ? (
//                 filteredProjects.map((project) => (
//                   <TableRow key={project.project_id}>
//                     <TableCell>{project.project_name}</TableCell>
//                     <TableCell>{`${project.site_city}${project.site_district}${project.site_address}`}</TableCell>
//                     <TableCell>{project.start_date}</TableCell>
//                     <TableCell>{project.construction_status}</TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={4} align="center">
//                     無專案資料
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Box>
//     </Box>
//   );
// };

// export default CustomerDetails;

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams } from 'react-router-dom';
import {
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
  Divider
} from '@mui/material';

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
  const { customerId } = useParams(); // 從 URL 拿 customerId
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [projectData, setProjectData] = useState({
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
      {
        name: "",
        title: "",
        contactType: "",
        contactValue: "",
      },
      {
        name: "",
        title: "",
        contactType: "",
        contactValue: "",
      },
    ],
  });

  const customer = customers.find((c) => c.customer_id === customerId);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await fetchProjectsByCustomerId(customerId);
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [customerId, fetchProjectsByCustomerId]);

  // 處理新增專案
  const handleSaveProject = async () => {
    try {
      const allContacts = [
        {
          role: projectData.contacts[0]?.role || "",
          name: projectData.contacts[0]?.name || "",
          contactType: projectData.contacts[0]?.contactType || "",
          contact: projectData.contacts[0]?.contact || "",
        },
        {
          role: projectData.contacts[1]?.role || "",
          name: projectData.contacts[1]?.name || "",
          contactType: projectData.contacts[1]?.contactType || "",
          contact: projectData.contacts[1]?.contact || "",
        },
        ...projectData.additionalContacts.map(contact => ({
          role: contact.role || "",
          name: contact.name || "",
          contactType: contact.contactType || "",
          contact: contact.contact || "",
        })),
      ];

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
          construction_days: projectData.construction_days, // 新增施工天數
          construction_scope: projectData.construction_scope, // 新增施工範圍
          construction_notes: projectData.construction_notes, // 新增注意事項
          payment_method: projectData.payment_method, // 新增收款方式
          payment_date: projectData.payment_date, // 新增收款日期
          construction_status: projectData.construction_status,
          billing_status: projectData.billing_status,
          contacts: allContacts,
        }])
        .select();
  
      if (error) throw error;
  
      setProjects(prev => [...prev, data[0]]);
      setOpenDialog(false);
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
        contacts: [ // 初始兩位聯絡人
          { name: "", title: "", contactType: "", contactValue: "" },
          { name: "", title: "", contactType: "", contactValue: "" }
        ]
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
  
  const updateContact = (index, field, value) => {
    const updatedContacts = [...projectData.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setProjectData({ ...projectData, contacts: updatedContacts });
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

  if (!customer) return <Typography color="error">無法找到該客戶</Typography>;

  const filteredProjects = projects?.filter((project) => project.customer_id === customerId) || [];

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {customer.customer_name}
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>聯絡資訊</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>聯絡人 1：{customer.contact_person_1 }</Typography>
              <Typography>聯絡人 2：{customer.contact_person_2 }</Typography>
              <Typography>地址：{`${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`}</Typography>
              </Grid>
            <Grid item xs={12} md={6}>
              <Typography>手機1：{customer.contact_phone_1}</Typography>
              <Typography>手機2：{customer.contact_phone_2}</Typography>
            </Grid>
          </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
              <Typography>電話（公）：{customer.contact_number_1}</Typography>
              <Typography>傳真號碼：{customer.tax_idID}</Typography>
              <Typography>統一編號：{customer.tax_id}</Typography>
              <Typography>抬頭：{customer.title}</Typography>
              <Typography>注意事項：{customer.notes}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 專案資訊卡片 */}
<Card>
  <CardContent>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6" gutterBottom>對應專案</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpenDialog(true)}
      >
        新增專案
      </Button>
    </Box>

    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth >
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
          />

          <Typography variant="h6" gutterBottom>聯絡人資訊</Typography>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
            {/* 預設聯絡人 1 */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <FormControl fullWidth>
                <InputLabel>職位</InputLabel>
                <Select
                  value={projectData.contacts[0]?.role || ""}
                  onChange={(e) => updateContact(0, "role", e.target.value)}
                >
                  {["工地聯絡人", "會計", "設計師", "採購", "監造"].map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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

            {/* 預設聯絡人 2 */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <FormControl fullWidth>
                <InputLabel>職位</InputLabel>
                <Select
                  value={projectData.contacts[1]?.role || ""}
                  onChange={(e) => updateContact(1, "role", e.target.value)}
                >
                  {["工地聯絡人", "會計", "設計師", "採購", "監造"].map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="名字"
                fullWidth
                value={projectData.contacts[1]?.name || ""}
                onChange={(e) => updateContact(1, "name", e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>聯絡方式類型</InputLabel>
                <Select
                  value={projectData.contacts[1]?.contactType || ""}
                  onChange={(e) => updateContact(1, "contactType", e.target.value)}
                >
                  {["電話", "市話", "LineID", "Email"].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={projectData.contacts[1]?.contactType || "聯絡方式"}
                fullWidth
                value={projectData.contacts[1]?.contact || ""}
                onChange={(e) => {
                  let formattedValue = e.target.value;

                  // 自動格式化電話號碼
                  if (projectData.contacts[1]?.contactType === "電話") {
                    formattedValue = formattedValue
                      .replace(/[^\d]/g, "")
                      .replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                  } else if (projectData.contacts[1]?.contactType === "市話") {
                    formattedValue = formattedValue
                      .replace(/[^\d]/g, "")
                      .replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                  }

                  const newContacts = [...projectData.contacts];
                  newContacts[1] = { ...newContacts[1], contact: formattedValue };
                  setProjectData({ ...projectData, contacts: newContacts });

                }}
              />
            </div>

            {/* 動態新增聯絡人 */}
            {projectData.additionalContacts?.map((contact, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <FormControl fullWidth>
                  <InputLabel>角色</InputLabel>
                  <Select
                    value={contact.role || ""}
                    onChange={(e) => {
                      const updatedContacts = [...projectData.additionalContacts];
                      updatedContacts[index].role = e.target.value;
                      setProjectData({ ...projectData, additionalContacts: updatedContacts });
                    }}
                  >
                    {["工地聯絡人", "會計", "設計師", "採購", "監造"].map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="名字"
                  fullWidth
                  value={contact.name || ""}
                  onChange={(e) => {
                    const updatedContacts = [...projectData.additionalContacts];
                    updatedContacts[index].name = e.target.value;
                    setProjectData({ ...projectData, additionalContacts: updatedContacts });
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel>聯絡方式類型</InputLabel>
                  <Select
                    value={contact.contactType || ""}
                    onChange={(e) => {
                      const updatedContacts = [...projectData.additionalContacts];
                      updatedContacts[index].contactType = e.target.value;
                      updatedContacts[index].contact = ""; // 清空聯絡方式
                      setProjectData({ ...projectData, additionalContacts: updatedContacts });
                    }}
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
                    const updatedContacts = [...projectData.additionalContacts];
                    let formattedValue = e.target.value;

                    // 自動格式化電話號碼
                    if (contact.contactType === "電話") {
                      formattedValue = formattedValue
                        .replace(/[^\d]/g, "")
                        .replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                    } else if (contact.contactType === "市話") {
                      formattedValue = formattedValue
                        .replace(/[^\d]/g, "")
                        .replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                    }

                    updatedContacts[index].contact = formattedValue;
                    setProjectData({ ...projectData, additionalContacts: updatedContacts });
                  }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    const updatedContacts = projectData.additionalContacts.filter((_, i) => i !== index);
                    setProjectData({ ...projectData, additionalContacts: updatedContacts });
                  }}
                >
                  刪除
                </Button>
              </div>
            ))}
            <Button
              variant="outlined"
              onClick={() => {
                const updatedContacts = [...(projectData.additionalContacts || []), { role: "", name: "", contactType: "", contact: "" }];
                setProjectData({ ...projectData, additionalContacts: updatedContacts });
              }}
            >
              新增聯絡人
            </Button>
          </div>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>施工資訊</Typography>

          {/* 施工地址 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
            <Autocomplete
              options={taiwanCities}
              renderInput={(params) => <TextField {...params} label="施工縣市" fullWidth />}
              value={projectData.site_city || ""}
              onChange={(event, newValue) => handleCityChange(newValue)}
            />
            <Autocomplete
              options={taiwanDistricts[projectData.site_city] || []}
              renderInput={(params) => <TextField {...params} label="施工區域" fullWidth />}
              value={projectData.site_district || ""}
              onChange={(event, newValue) => handleDistrictChange(newValue)}
            />
            <TextField
            name="site_address"
            label="施工地址"
            fullWidth
            value={projectData.site_address}
            onChange={handleChange}
          />
          </div>
      
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
          </div>

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

          <TextField
            name="construction_fee"
            label="施工金額"
            type="number"
            fullWidth
            margin="normal"
            value={projectData.construction_fee}
            onChange={handleChange}
          />
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <TextField
            name="payment_method"
            label="收款方式"
            fullWidth
            value={projectData.payment_method || ""}
            onChange={(e) => setProjectData({ ...projectData, payment_method: e.target.value })}
          />
          <TextField
            name="payment_date"
            label="收款日期"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={projectData.payment_date || ""}
            onChange={(e) => setProjectData({ ...projectData, payment_date: e.target.value })}
          />
          </div>
        </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>取消</Button>
        <Button 
          variant="contained" 
          onClick={handleSaveProject}
          disabled={!projectData.project_name || !projectData.customer_id}
        >
          儲存
        </Button>
      </DialogActions>
    </Dialog>

    {filteredProjects.length === 0 ? (
      <Typography color="text.secondary">目前無專案資料</Typography>
    ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>專案名稱</TableCell>
              <TableCell>施工地址</TableCell>
              <TableCell>開始日期</TableCell>
              <TableCell>施工狀態</TableCell>
              <TableCell>請款狀態</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project, index) => (
              <TableRow key={index}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{`${project.site_city}${project.site_district}${project.site_address}`}</TableCell>
                <TableCell>{project.start_date}</TableCell>
                <TableCell>{project.construction_status}</TableCell>
                <TableCell>{project.billing_status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </CardContent>
</Card>
    </Box>
  );
};

export default CustomerDetails;
