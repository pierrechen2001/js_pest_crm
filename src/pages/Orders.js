import React, { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { Button, TextField, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Autocomplete, Checkbox, ListItemText, ToggleButton, ToggleButtonGroup, CircularProgress, Typography, Divider, Menu, MenuItem, IconButton} from "@mui/material";
import { Add } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from 'react-router-dom';

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

export default function Orders() {
  // 狀態管理
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 篩選和排序
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const filterOptions = ["專案名稱", "客戶名稱", "施工地址"];

  const filteredProjects = (projects || [])
  .filter((project) => {
    // 搜索邏輯
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();

      if (selectedFilters.length === 0) {
        return (
          project.project_name?.toLowerCase().includes(searchLower) ||
          project.customer_database?.customer_name?.toLowerCase().includes(searchLower) ||
          `${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`
            .toLowerCase()
            .includes(searchLower)
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

      if (!matchesAnyField) return false;
    }

    return true;
  })
  .sort((a, b) => {
    if (sortOrder === "asc") {
      return new Date(a.start_date || "") - new Date(b.start_date || "");
    } else {
      return new Date(b.start_date || "") - new Date(a.start_date || "");
    }
  });

  // Dialog 控制
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
      { role: "", name: "", contactType: "", contact: "" }, // 預設一個聯絡人
    ],
  });
  
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
  // 獲取數據
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 獲取專案數據
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

        // 獲取客戶列表（用於新增專案時選擇）
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

  // 處理新增專案
  const handleSaveProject = async () => {
    try {
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
        }])
        .select();
  
      if (error) throw error;
  
      setProjects(prev => [...prev, data[0]]);
      setOpenDialog(false);
      setProjectData(getInitialProjectData());
    } catch (error) {
      console.error('Error saving project:', error);
      alert('儲存失敗，請檢查資料是否正確！'); // 添加錯誤提示
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
    const newContacts = [...projectData.contacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value,
    };
    setProjectData({ ...projectData, contacts: newContacts });
  };

  const getInitialProjectData = () => ({
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
    ],
  });

  
  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div style={{ padding: 20 }}>
      <Button 
        variant="contained" 
        startIcon={<Add />} 
        onClick={() => {
          setProjectData(getInitialProjectData());
          setSelectedCustomer(null); // 重置選擇的客戶
          setOpenDialog(true);
        }}
        style={{ marginBottom: 20 }}
      >
        新增專案
      </Button>

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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth >
        <DialogTitle>新增專案</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>基本資訊</Typography>
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customer_name}
            value={selectedCustomer}
            onChange={(event, newValue) => {
              setSelectedCustomer(newValue);
              setProjectData(prev => ({
                ...prev,
                customer_id: newValue?.customer_id || null,
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="選擇客戶" margin="normal" />
            )}
          />
          
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

          {/* 施工地址 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <Autocomplete
                options={taiwanCities}
                renderInput={(params) => <TextField {...params} label="施工縣市" fullWidth />}
                value={projectData.site_city || ""}
                onChange={(event, newValue) => handleCityChange(newValue)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Autocomplete
                options={taiwanDistricts[projectData.site_city] || []}
                renderInput={(params) => <TextField {...params} label="施工區域" fullWidth />}
                value={projectData.site_district || ""}
                onChange={(event, newValue) => handleDistrictChange(newValue)}
              />
            </div>
            <div style={{ flex: 3 }}>
              <TextField
                name="site_address"
                label="施工地址"
                fullWidth
                value={projectData.site_address}
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

      <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ width: "15%" }}>專案名稱</TableCell>
          <TableCell style={{ width: "21%" }}>客戶名稱</TableCell>
          <TableCell style={{ width: "28%" }}>施工地址</TableCell>
          <TableCell style={{ width: "12%" }}>
            開始日期
            <TableSortLabel
              active
              direction={sortOrder}
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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
                  {status}
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
                  {status}
                </MenuItem>
              ))}
            </Menu>
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {filteredProjects
          .filter((project) => {
            // 施工狀態篩選
            if (statusFilter && project.construction_status !== statusFilter) return false;

            // 請款狀態篩選
            if (billingFilter && project.billing_status !== billingFilter) return false;

            return true;
          })
          .map((project) => (
            <TableRow 
              key={project.project_id}
              hover
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/order/${project.project_id}`)}
            >
              <TableCell style={{ width: "15%" }}>{project.project_name}</TableCell>
              <TableCell style={{ width: "21%" }}>{project.customer_database?.customer_name}</TableCell>
              <TableCell style={{ width: "28%" }}>{`${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`}</TableCell>
              <TableCell style={{ width: "12%" }}>{project.start_date}</TableCell>
              <TableCell style={{ width: "12%" }}>{project.construction_status}</TableCell>
              <TableCell style={{ width: "12%" }}>{project.billing_status}</TableCell>
            </TableRow>
          ))}
      </TableBody>
      </Table>
    </div>
  );
}
