import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Autocomplete, Checkbox, ListItemText, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';


const customerTypes = ["古蹟、政府機關", "一般住家", "建築師", "營造、設計公司"];
const filterOptions = ["客戶名稱", "聯絡人姓名", "聯絡電話", "地址"];
// const ownershipOptions = ["營造", "設計公司", "直接面對業主"];
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

const Customers = ({ 
  customers, 
  setCustomers,
  loading, 
  error, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer 
}) => {
  const navigate = useNavigate();
  
  // Use state to store customers, selected type, search text, and dialog status
  const [selectedType, setSelectedType] = useState("");
  // const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  
  // Dialog-related state
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);  // Make sure step is properly initialized
  const [newCustomerType, setNewCustomerType] = useState("");
  const initialCustomerData = {
    customerTypes: "",
    customer_name: null,
    contact_city: "",
    contact_district: "",
    contact_address: "",
    email: "",
    taxid: "",
    start_date: "",
    end_date: "",
    invoice_title: "",
    notes: "",
    company_phone: "",
    fax: "",
    contacts: [
      { role: "", name: "", contactType: "", contact: "" },
    ],
  };
  
  const [customerData, setCustomerData] = useState(initialCustomerData);  
  

  // When initialCustomers changes, update customersState
  useEffect(() => {
    setCustomers(customers);
  }, [customers, setCustomers]);

  // 處理 Dialog 開關
  const handleOpen = () => {
    setStep(1);
    setNewCustomerType("");
    setCustomerData(initialCustomerData);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleNextStep = () => setStep(2);
  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  // 新增客戶
  const handleSaveCustomer = async () => {
    try {
      await addCustomer({
        customer_type: newCustomerType,
        customer_name: customerData.name,
        contact_city: customerData.city,
        contact_district: customerData.district,
        contact_address: customerData.road,
        email: customerData.email,
        tax_id: customerData.taxid,
        invoice_title: customerData.Title,
        notes: customerData.notes,
        company_phone: customerData.company_phone,
        fax: customerData.fax,
        contact1_role: customerData.contacts[0]?.role || "",
        contact1_name: customerData.contacts[0]?.name || "",
        contact1_type: customerData.contacts[0]?.contactType || "",
        contact1_contact: customerData.contacts[0]?.contact || "",
        contact2_role: customerData.contacts[1]?.role || "",
        contact2_name: customerData.contacts[1]?.name || "",
        contact2_type: customerData.contacts[1]?.contactType || "",
        contact2_contact: customerData.contacts[1]?.contact || "",
        contact3_role: customerData.contacts[2]?.role || "",
        contact3_name: customerData.contacts[2]?.name || "",
        contact3_type: customerData.contacts[2]?.contactType || "",
        contact3_contact: customerData.contacts[2]?.contact || "",
      });
      handleClose();
      // 新增成功後重置表單
      setNewCustomerType("");
      setCustomerData(initialCustomerData);
      setStep(1);
    } catch (error) {
      console.error('Error saving customer:', error);
      // 可以在此處添加錯誤提示
    }
  };

  const filteredCustomers = customers
  .filter((customer) => {
    // 選擇特定類型的客戶
    if (selectedType && customer.customer_type !== selectedType) return false;

    // 搜索邏輯
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();

      // 如果沒有選擇篩選條件，搜尋所有欄位
      if (selectedFilters.length === 0) {
        return (
          customer.customer_name?.toLowerCase().includes(searchLower) ||
          customer.contact1_name?.toLowerCase().includes(searchLower) ||
          customer.contact1_contact?.includes(searchLower) ||
          customer.contact2_name?.toLowerCase().includes(searchLower) ||
          customer.contact2_contact?.includes(searchLower) ||
          `${customer.contact_city}${customer.contact_district}${customer.contact_address}`
            .toLowerCase()
            .includes(searchLower)
        );
      }
      
      // 檢查是否符合任何選中的篩選條件
      const matchesAnyField = selectedFilters.some((filter) => {
        switch (filter) {
          case "客戶名稱":
            return customer.customer_name?.toLowerCase().includes(searchLower);
          case "聯絡人姓名":
            return (
              customer.contact1_name?.toLowerCase().includes(searchLower) ||
              customer.contact2_name?.toLowerCase().includes(searchLower) ||
              customer.contact3_name?.toLowerCase().includes(searchLower)
            );
          case "聯絡電話":
            return (
              customer.contact1_contact?.includes(searchLower) ||
              customer.contact2_contact?.includes(searchLower) ||
              customer.contact3_contact?.includes(searchLower) ||
              customer.company_phone?.includes(searchLower)
            );
          case "地址":
            return `${customer.contact_city}${customer.contact_district}${customer.contact_address}`
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
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div style={{ padding: 20 }}>

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
            客戶管理
          </Typography>

          <Button variant="contained" onClick={handleOpen} style={{ marginBottom: 10 }}>新增客戶</Button>
          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>新增客戶</DialogTitle>
            <DialogContent>
              {step === 1 && (
                <FormControl fullWidth>
                  <InputLabel>選擇客戶類型</InputLabel>
                  <Select value={newCustomerType} onChange={(e) => setNewCustomerType(e.target.value)}>
                    {customerTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {step === 2 && (
            <div>
              {/* 客戶資訊 */}
              <Typography variant="h6" gutterBottom>客戶基本資訊</Typography>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField 
                    label="客戶名稱" 
                    fullWidth 
                    name="name" 
                    value={customerData.name || ""} 
                    onChange={handleChange} 
                  />
                  </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <Autocomplete
                    options={taiwanCities}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label={
                          newCustomerType === "一般住家" ? "地址" :
                          newCustomerType === "建築師" ? "事務所地址" :
                          newCustomerType === "古蹟、政府機關" ? "專案地址" :
                          "公司地址"
                        } 
                        fullWidth 
                      />
                    )}
                    value={customerData.city || ""}
                    onChange={(event, newValue) => setCustomerData({ ...customerData, city: newValue })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Autocomplete
                    options={taiwanDistricts[customerData.city] || []}
                    renderInput={(params) => <TextField {...params} label="區域" fullWidth />}
                    value={customerData.district || ""}
                    onChange={(event, newValue) => setCustomerData({ ...customerData, district: newValue })}
                  />
                </div>
                <div style={{ flex: 3 }}>
                  <TextField 
                    label="路名/詳細地址" 
                    fullWidth 
                    name="road" 
                    value={customerData.road || ""} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              {/* 統編與抬頭（僅非一般住家顯示） */}
              {newCustomerType !== "一般住家" && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <TextField 
                    label="統一編號" 
                    fullWidth 
                    name="TaxID" 
                    value={customerData.TaxID || ""} 
                    onChange={handleChange} 
                  />
                  <TextField 
                    label="抬頭" 
                    fullWidth 
                    name="Title" 
                    value={customerData.Title || ""} 
                    onChange={handleChange} 
                  />
                </div>
              )}

              {/* 聯絡資訊 */}
              <Typography variant="h6" gutterBottom>聯絡資訊</Typography>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                {/* 公司電話與傳真號碼 */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <TextField
                    label="公司電話（市話）"
                    fullWidth
                    value={customerData.company_phone || ""}
                    onChange={(e) => {
                      let formattedValue = e.target.value.replace(/[^\d]/g, "").replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                      setCustomerData({ ...customerData, company_phone: formattedValue });
                    }}
                  />
                  <TextField
                    label="傳真號碼"
                    fullWidth
                    value={customerData.fax || ""}
                    onChange={(e) => {
                      let formattedValue = e.target.value.replace(/[^\d]/g, "").replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                      setCustomerData({ ...customerData, fax: formattedValue });
                    }}
                  />
                  <TextField
                    label="公司信箱"
                    fullWidth
                    value={customerData.email || ""}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  />
                </div>      

                {/* 預設聯絡人 1 */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <TextField
                    label="職位"
                    fullWidth
                    value={customerData.contacts[0]?.role || ""}
                    onChange={(e) => {
                      const updatedContacts = [...customerData.contacts];
                      updatedContacts[0].role = e.target.value;
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                  />
                  <TextField
                    label="名字"
                    fullWidth
                    value={customerData.contacts[0]?.name || ""}
                    onChange={(e) => {
                      const updatedContacts = [...customerData.contacts];
                      updatedContacts[0].name = e.target.value;
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>聯絡方式類型</InputLabel>
                    <Select
                      value={customerData.contacts[0]?.contactType || ""}
                      onChange={(e) => {
                        const updatedContacts = [...customerData.contacts];
                        updatedContacts[0] = { ...updatedContacts[0], contactType: e.target.value, contact: "" };
                        setCustomerData({ ...customerData, contacts: updatedContacts });
                      }}
                    >
                      {["LineID", "市話", "電話", "信箱"].map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label={customerData.contacts[0]?.contactType || "聯絡方式"}
                    fullWidth
                    value={customerData.contacts[0]?.contact || ""}
                    onChange={(e) => {
                      let formattedValue = e.target.value;
                      const contactType = customerData.contacts[0]?.contactType;

                      if (contactType === "市話") {
                        formattedValue = formattedValue.replace(/[^\d]/g, "").replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                      } else if (contactType === "電話") {
                        formattedValue = formattedValue.replace(/[^\d]/g, "").replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                      }

                      const updatedContacts = [...customerData.contacts];
                      updatedContacts[0].contact = formattedValue;
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                  />
                </div>


                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                {customerData.contacts?.map((contact, index) => {
                      if (index === 0) return null; // 跳過預設聯絡人
                      return (
                  <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <TextField
                        label="職位"
                        fullWidth
                        value={contact.role || ""}
                        onChange={(e) => {
                          const updatedContacts = [...customerData.contacts];
                          updatedContacts[index].role = e.target.value;
                          setCustomerData({ ...customerData, contacts: updatedContacts });
                        }}
                      />
                      <TextField
                        label="名字"
                        fullWidth
                        value={contact.name || ""}
                        onChange={(e) => {
                          const updatedContacts = [...customerData.contacts];
                          updatedContacts[index].name = e.target.value;
                          setCustomerData({ ...customerData, contacts: updatedContacts });
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel>聯絡方式類型</InputLabel>
                        <Select
                          value={contact.contactType || ""}
                          onChange={(e) => {
                            const updatedContacts = [...customerData.contacts];
                            updatedContacts[index] = {
                              ...updatedContacts[index],
                              contactType: e.target.value,
                              contact: "", // 清空原本輸入
                            };
                            setCustomerData({ ...customerData, contacts: updatedContacts });
                          }}
                        >
                          {["LineID", "市話", "電話", "信箱"].map((type) => (
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
                          if (contact.contactType === "市話") {
                            formattedValue = formattedValue
                              .replace(/[^\d]/g, "")
                              .replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                          } else if (contact.contactType === "電話") {
                            formattedValue = formattedValue
                              .replace(/[^\d]/g, "")
                              .replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                          }

                          const updatedContacts = [...customerData.contacts];
                          updatedContacts[index].contact = formattedValue;
                          setCustomerData({ ...customerData, contacts: updatedContacts });
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const updatedContacts = customerData.contacts.filter((_, i) => i !== index);
                          setCustomerData({ ...customerData, contacts: updatedContacts });
                        }}
                      >
                        刪除
                      </Button>
                    </div>
                  )})}

                  <Button
                    variant="outlined"
                    onClick={() => {
                      const updatedContacts = [
                        ...(customerData.contacts || []),
                        { role: "", name: "", contactType: "", contact: "" },
                      ];
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                    disabled={(customerData.contacts || []).length >= 3}
                  >
                    新增聯絡人
                  </Button>
                </div>


                  <TextField
                    label="注意事項"
                    fullWidth
                    multiline
                    rows={2}
                    value={customerData.notes || ""}
                    onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                    style={{ marginBottom: "20px" }}
                  />
              </div>
            </div>
          )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>取消</Button>
              {step === 1 ? (
                <Button variant="contained" onClick={handleNextStep} disabled={!newCustomerType}>下一步</Button>
              ) : (
                <Button variant="contained" onClick={handleSaveCustomer} disabled={!customerData.name}>儲存</Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>


        {/* 右側：插圖 */}
        <Box
          component="img"
          src="/customer-page.svg"
          alt="客戶管理圖"
          sx={{
            height: 200,
            maxWidth: '100%',
          }}
        />

      </Paper>
      </Box>

      {/* 客戶類型篩選按鈕 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: 10 }}>
        <Button variant={selectedType === "" ? "contained" : "outlined"} onClick={() => setSelectedType("")} color="primary">全部</Button>
        {customerTypes.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "contained" : "outlined"}
            onClick={() => setSelectedType(type)}
            color="primary"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* 搜尋與篩選條件 */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: 20 }}>
        <TextField
          label="搜尋客戶"
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
      



      {/* 客戶列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "7%" }}>列數</TableCell>
              <TableCell style={{ width: "12%" }}>客戶分類</TableCell>
              <TableCell style={{ width: "20%" }}>客戶名稱</TableCell>
              <TableCell style={{ width: "13%" }}>聯絡人</TableCell>
              <TableCell style={{ width: "13%" }}>聯絡電話</TableCell>
              <TableCell style={{ width: "35%" }}>地址</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer, index) => (
              <TableRow 
                key={customer.customer_id} 
                hover 
                style={{ cursor: "pointer" }} 
                onClick={() => navigate(`/customer/${customer.customer_id}`)}
              >
                <TableCell style={{ width: "7%" }}>{index + 1}</TableCell>
                <TableCell style={{ width: "12%" }}>{customer.customer_type}</TableCell>
                <TableCell style={{ width: "20%" }}>{customer.customer_name}</TableCell>
                <TableCell style={{ width: "13%" }}>
                  {customer.contact1_name && <div>{customer.contact1_name}</div>}
                  {customer.contact2_name && <div>{customer.contact2_name}</div>}
                  {customer.contact3_name && <div>{customer.contact3_name}</div>}
                </TableCell>
                <TableCell style={{ width: "13%" }}>
                  {customer.contact1_contact && <div>{customer.contact1_contact}</div>}
                  {customer.contact2_contact && <div>{customer.contact2_contact}</div>}
                  {customer.contact3_contact && <div>{customer.contact3_contact}</div>}
                </TableCell>
                <TableCell style={{ width: "35%" }}>
                  {`${customer.contact_city}${customer.contact_district}${customer.contact_address}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Customers;