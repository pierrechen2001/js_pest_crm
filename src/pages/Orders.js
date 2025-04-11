import { useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TextField, IconButton, Menu, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Typography, Divider } from "@mui/material";
import { FilterList, Add } from "@mui/icons-material";

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


const projects = [
  { name: "專案 A", date: "2025-04-02", status: "進行中", billing: "已請款" },
  { name: "專案 B", date: "2025-03-30", status: "已完成", billing: "未請款" },
  { name: "專案 C", date: "2025-03-28", status: "未開始", billing: "未請款" },
];

const customers = ["客戶 A", "客戶 B", "客戶 C"];

const statusIcons = {
  "未開始": "⏳", 
  "進行中": "🚀", 
  "已完成": "✅"
};

const billingIcons = {
  "未請款": "💰", 
  "已請款": "✔️"
};

export default function ProjectTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [anchorElStatus, setAnchorElStatus] = useState(null);
  const [anchorElBilling, setAnchorElBilling] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [projectDetails, setProjectDetails] = useState({ location: "", item: "", days: "", price: "", billingMethod: "", paymentMethod: "", accountant: "", contact: "", notes: "" });

  const filteredProjects = projects.filter(p => 
    p.name.includes(search) && 
    (statusFilter ? p.status === statusFilter : true) && 
    (billingFilter ? p.billing === billingFilter : true)
  ).sort((a, b) => sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

  return (
    <div>
      <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>新增專案</Button>
      <TextField 
        label="搜尋專案" 
        variant="outlined" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>專案名稱</TableCell>
            <TableCell>
              施作日期
              <TableSortLabel
                active
                direction={sortOrder}
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              />
            </TableCell>
            <TableCell>
              施作狀態
              <IconButton onClick={(e) => setAnchorElStatus(e.currentTarget)}> <FilterList /> </IconButton>
              <Menu anchorEl={anchorElStatus} open={Boolean(anchorElStatus)} onClose={() => setAnchorElStatus(null)}>
                {Object.keys(statusIcons).map((status) => (
                  <MenuItem key={status} onClick={() => { setStatusFilter(status); setAnchorElStatus(null); }}>
                    {statusIcons[status]} {status}
                  </MenuItem>
                ))}
                <MenuItem onClick={() => { setStatusFilter(""); setAnchorElStatus(null); }}>❌ 清除篩選</MenuItem>
              </Menu>
            </TableCell>
            <TableCell>
              請款狀態
              <IconButton onClick={(e) => setAnchorElBilling(e.currentTarget)}> <FilterList /> </IconButton>
              <Menu anchorEl={anchorElBilling} open={Boolean(anchorElBilling)} onClose={() => setAnchorElBilling(null)}>
                {Object.keys(billingIcons).map((billing) => (
                  <MenuItem key={billing} onClick={() => { setBillingFilter(billing); setAnchorElBilling(null); }}>
                    {billingIcons[billing]} {billing}
                  </MenuItem>
                ))}
                <MenuItem onClick={() => { setBillingFilter(""); setAnchorElBilling(null); }}>❌ 清除篩選</MenuItem>
              </Menu>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProjects.map((p, index) => (
            <TableRow key={index}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.date}</TableCell>
              <TableCell>{statusIcons[p.status]} {p.status}</TableCell>
              <TableCell>{billingIcons[p.billing]} {p.billing}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>新增專案</DialogTitle>
        <DialogContent>
          {/* <Typography variant="h6">客戶資訊</Typography>
          <Autocomplete options={customers} value={selectedCustomer} onChange={(event, newValue) => setSelectedCustomer(newValue)} renderInput={(params) => <TextField {...params} label="選擇客戶" variant="outlined" fullWidth margin="dense" />} /> */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">施工細節</Typography>
          {/* <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <Autocomplete
              options={taiwanCities}
              renderInput={(params) => <TextField {...params} label="縣市" fullWidth />}
              value={customerData.city || ""}
              onChange={(event, newValue)}
            />
            <Autocomplete
              options={taiwanDistricts[customerData.city] || []} // 根據選擇的 city 提供區域選項
              renderInput={(params) => <TextField {...params} label="區域" fullWidth />}
              value={customerData.district || ""}
              onChange={(event, newValue) => setCustomerData({ ...customerData, district: newValue })}
            />  */}
            <TextField label="地址" fullWidth name="road" />
          {/* </div> */}
          <TextField label="施工項目" fullWidth margin="dense" />
          <TextField label="施工天數" fullWidth margin="dense" type="number" />
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">金流資訊</Typography>
          <TextField label="定價" fullWidth margin="dense" />
          <TextField label="請款方式" fullWidth margin="dense" />
          <TextField label="收款方式" fullWidth margin="dense" />
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField label="收款人" fullWidth name="contact3"/>
            <TextField label="收款人電話" fullWidth name="cellphone3"/>
          </div>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">其他</Typography>
          <TextField label="注意事項" fullWidth margin="dense" multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button variant="contained" color="primary">新增</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// import { useState } from "react";
// import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TextField, IconButton, Menu, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Typography, Divider, DatePicker } from "@mui/material";
// import { FilterList, Add } from "@mui/icons-material";

// // Sample project data and customer list passed down as props
// export default function ProjectTable({ projects, setProjects, customers }) {
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [billingFilter, setBillingFilter] = useState("");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [projectDetails, setProjectDetails] = useState({
//     name: "",
//     location: "",
//     item: "",
//     startDate: null,
//     endDate: null,
//     price: "",
//     billingMethod: "",
//     paymentMethod: "",
//     accountant: "",
//     contact: "",
//     notes: "",
//     projectstatus: "",
//     billingstatus: "",
//   });

//   const handleDateChange = (name, value) => {
//     setProjectDetails((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCustomerData(prevState => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSaveProject = () => {
//     const newProject = {
//       name: `專案 ${projects.length + 1}`,
//       date: new Date().toISOString().split("T")[0],
//       projectstatus: "未開始",
//       billingstatus: "未請款",
//       details: projectDetails,
//     };
//     console.log(`新增專案，客戶：${selectedCustomer.name}, 施工細節：${JSON.stringify(customerData)}`);
//     setProjects([...projects, newProject]);
//     setOpenDialog(false);
//   };

//   const filteredProjects = projects.filter(p => 
//     p.name.includes(search) && 
//     (statusFilter ? p.projectstatus === statusFilter : true) && 
//     (billingFilter ? p.billingstatus === billingFilter : true)
//   ).sort((a, b) => sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

//   return (
//     <div>
//       <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>新增專案</Button>
//       <TextField 
//         label="搜尋專案" 
//         variant="outlined" 
//         value={search} 
//         onChange={(e) => setSearch(e.target.value)}
//         fullWidth
//         margin="normal"
//       />
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>專案名稱</TableCell>
//             <TableCell>
//               施作日期
//               <TableSortLabel
//                 active
//                 direction={sortOrder}
//                 onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
//               />
//             </TableCell>
//             <TableCell>施作狀態</TableCell>
//             <TableCell>請款狀態</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {filteredProjects.map((p, index) => (
//             <TableRow key={index}>
//               <TableCell>{p.name}</TableCell>
//               <TableCell>{p.date}</TableCell>
//               <TableCell>{p.projectstatus}</TableCell>
//               <TableCell>{p.billingstatus}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>新增專案</DialogTitle>
//         <DialogContent>
//           <Typography variant="h6">客戶資訊</Typography>
//           <Autocomplete
//             options={customers}
//             value={selectedCustomer}
//             onChange={(event, newValue) => setSelectedCustomer(newValue)}
//             renderInput={(params) => <TextField {...params} label="選擇客戶" variant="outlined" fullWidth margin="dense" />}
//           />
//           <Divider sx={{ my: 2 }} />
//           Add more project details fields here
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>取消</Button>
//           <Button variant="contained" color="primary" onClick={handleSaveProject}>新增</Button>
//         </DialogActions>
//       </Dialog>/ 

//       <Button variant="contained" onClick={() => setOpenDialog(true)}>
//         新增專案
//       </Button>

//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>新增專案</DialogTitle>
//         <DialogContent>
//           <Autocomplete
//             options={customers}
//             getOptionLabel={(option) => option.name}
//             value={selectedCustomer}
//             onChange={(event, newValue) => setSelectedCustomer(newValue)}
//             renderInput={(params) => <TextField {...params} label="選擇客戶" fullWidth />}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>取消</Button>
//           <Button variant="contained" color="primary" onClick={handleSaveProject}>
//             儲存
//           </Button>
//         </DialogActions>
//       </Dialog>

//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { TextField, Autocomplete, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Typography } from "@mui/material";
// const taiwanCities = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"];
// const taiwanDistricts = {
//   "台北市": [
//     "松山區", "信義區", "大安區", "中山區", "中正區", "大同區", "萬華區", 
//     "文山區", "南港區", "內湖區", "士林區", "北投區"
//   ],
//   "新北市": [
//     "板橋區", "新莊區", "中和區", "永和區", "土城區", "樹林區", "三重區", 
//     "蘆洲區", "汐止區", "淡水區", "林口區", "三峽區", "鶯歌區", "金山區", 
//     "萬里區", "八里區", "瑞芳區", "平溪區", "雙溪區", "貢寮區", "石門區"
//   ],
//   "桃園市": [
//     "桃園區", "中壢區", "平鎮區", "八德區", "楊梅區", "大溪區", "龜山區", 
//     "龍潭區", "大園區", "觀音區", "新屋區", "復興區"
//   ],
//   "台中市": [
//     "中區", "東區", "南區", "西區", "北區", "西屯區", "南屯區", "北屯區", 
//     "大甲區", "大里區", "太平區", "南區", "西區", "潭子區", "清水區", "梧棲區", 
//     "龍井區", "沙鹿區", "大肚區", "和平區"
//   ],
//   "台南市": [
//     "中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", 
//     "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", 
//     "關廟區", "龍崎區", "官田區", "麻豆區", "佳里區", "西港區", "七股區", 
//     "將軍區", "學甲區", "北門區", "新市區", "鹽水區", "白河區", 
//     "東山區", "六甲區", "下營區", "柳營區", "鹽水區", "南化區"
//   ],
//   "高雄市": [
//     "楠梓區", "左營區", "鼓山區", "三民區", "鹽埕區", "新興區", "前金區", 
//     "苓雅區", "前鎮區", "小港區", "鳳山區", "林園區", "大寮區", "大樹區", 
//     "旗山區", "美濃區", "六龜區", "甲仙區", "杉林區", "內門區", "茂林區", 
//     "桃源區", "高雄市區"
//   ],
//   "基隆市": [
//     "中正區", "七堵區", "暖暖區", "仁愛區", "信義區", "中山區", "安樂區", 
//     "北區", "南區"
//   ],
//   "新竹市": [
//     "東區", "北區", "香山區"
//   ],
//   "新竹縣": [
//     "竹北市", "湖口鄉", "新豐鄉", "關西鎮", "芎林鄉", "寶山鄉", "竹東鎮", 
//     "五峰鄉", "橫山鄉", "尖石鄉", "北埔鄉", "峨眉鄉"
//   ],
//   "苗栗縣": [
//     "苗栗市", "三灣鄉", "獅潭鄉", "後龍鎮", "通霄鎮", "南庄鄉", "獅潭鄉", 
//     "大湖鄉", "公館鄉", "銅鑼鄉", "三義鄉", "西湖鄉", "卓蘭鎮"
//   ],
//   "屏東縣": [
//     "屏東市", "三地門鄉", "霧台鄉", "瑪家鄉", "九如鄉", "里港鄉", "高樹鄉", "鹽埔鄉", "長治鄉", 
//     "麟洛鄉", "竹田鄉", "內埔鄉", "萬丹鄉", "潮州鄉", "東港鄉", "南州鄉", "佳冬鄉", "新園鄉", 
//     "枋寮鄉", "枋山鄉", "春日鄉", "獅子鄉", "車城鄉", "恆春鄉", "滿州鄉"
//   ],
//   "台東縣": [
//     "台東市", "綠島鄉", "蘭嶼鄉", "延平鄉", "卑南鄉", "鹿野鄉", "關山鄉", "海端鄉", "池上鄉", 
//     "東河鄉", "成功鄉", "長濱鄉", "太麻里鄉"
//   ],
//   "澎湖縣": [
//     "馬公市", "西嶼鄉", "望安鄉", "赫哲鄉", "金門縣"
//   ],
//   "嘉義市": ["東區", "西區"],
//   "彰化縣": [
//     "彰化市", "員林市", "和美鎮", "鹿港鎮", "溪湖鎮", "二林鎮", "田中鎮", "北斗鎮",
//     "花壇鄉", "芬園鄉", "大村鄉", "埔鹽鄉", "埔心鄉", "永靖鄉", "社頭鄉", "二水鄉",
//     "田尾鄉", "埤頭鄉", "芳苑鄉", "大城鄉", "竹塘鄉", "溪州鄉"
//   ],
//   "南投縣": [
//     "南投市", "埔里鎮", "草屯鎮", "竹山鎮", "集集鎮", "名間鄉", "鹿谷鄉", "中寮鄉",
//     "魚池鄉", "國姓鄉", "水里鄉", "信義鄉", "仁愛鄉"
//   ],
//   "雲林縣": [
//     "斗六市", "斗南鎮", "虎尾鎮", "西螺鎮", "土庫鎮", "北港鎮", "古坑鄉", "大埤鄉",
//     "莿桐鄉", "林內鄉", "二崙鄉", "崙背鄉", "麥寮鄉", "東勢鄉", "褒忠鄉", "臺西鄉",
//     "元長鄉", "四湖鄉", "口湖鄉", "水林鄉"
//   ],
//   "宜蘭縣": [
//     "宜蘭市", "羅東鎮", "蘇澳鎮", "頭城鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "冬山鄉",
//     "五結鄉", "三星鄉", "大同鄉", "南澳鄉"
//   ],
//   "花蓮縣": [
//     "花蓮市", "鳳林鎮", "玉里鎮", "新城鄉", "吉安鄉", "壽豐鄉", "光復鄉", "豐濱鄉",
//     "瑞穗鄉", "萬榮鄉", "卓溪鄉", "富里鄉"
//   ],
//   "金門縣": [
//     "金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"
//   ],
//   "連江縣": [
//     "南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"
//   ],
// };

// export default function Order({ customers }) {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [customerData, setCustomerData] = useState({
//     city: "",
//     district: "",
//     road: "",
//     item: "",
//     days: "",
//     price: "",
//     billingMethod: "",
//     paymentMethod: "",
//     contact3: "",
//     cellphone3: "",
//     notes: "",
//   });

//   const handleSaveProject = () => {
//     // 儲存專案資料，這裡可以選擇將選擇的客戶資料一起傳送
//     console.log(`新增專案，客戶：${selectedCustomer.name}, 施工細節：${JSON.stringify(customerData)}`);
//     setOpenDialog(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCustomerData(prevState => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   return (
//     <div>
//       <Button variant="contained" onClick={() => setOpenDialog(true)}>
//         新增專案
//       </Button>

//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>新增專案</DialogTitle>
//         <DialogContent>
//           {/* 客戶選擇 */}
//           <Autocomplete
//             options={customers}
//             getOptionLabel={(option) => option.name}
//             value={selectedCustomer}
//             onChange={(event, newValue) => setSelectedCustomer(newValue)}
//             renderInput={(params) => <TextField {...params} label="選擇客戶" fullWidth />}
//           />
          
//           {/* 施工細節 */}
//           <Divider sx={{ my: 2 }} />
//           <Typography variant="h6">施工細節</Typography>
//           <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//             <Autocomplete
//               options={taiwanCities}
//               renderInput={(params) => <TextField {...params} label="縣市" fullWidth />}
//               value={customerData.city || ""}
//               onChange={(event, newValue) => setCustomerData({ ...customerData, city: newValue })}
//             />
//             <Autocomplete
//               options={taiwanDistricts[customerData.city] || []} // 根據選擇的 city 提供區域選項
//               renderInput={(params) => <TextField {...params} label="區域" fullWidth />}
//               value={customerData.district || ""}
//               onChange={(event, newValue) => setCustomerData({ ...customerData, district: newValue })}
//             />
//             <TextField
//               label="地址"
//               fullWidth
//               name="road"
//               value={customerData.road || ""}
//               onChange={handleChange}
//             />
//           </div>
//           <TextField
//             label="施工項目"
//             fullWidth
//             margin="dense"
//             name="item"
//             value={customerData.item || ""}
//             onChange={handleChange}
//           />
//           <TextField
//             label="施工天數"
//             fullWidth
//             margin="dense"
//             type="number"
//             name="days"
//             value={customerData.days || ""}
//             onChange={handleChange}
//           />

//           {/* 金流資訊 */}
//           <Divider sx={{ my: 2 }} />
//           <Typography variant="h6">金流資訊</Typography>
//           <TextField
//             label="定價"
//             fullWidth
//             margin="dense"
//             name="price"
//             value={customerData.price || ""}
//             onChange={handleChange}
//           />
//           <TextField
//             label="請款方式"
//             fullWidth
//             margin="dense"
//             name="billingMethod"
//             value={customerData.billingMethod || ""}
//             onChange={handleChange}
//           />
//           <TextField
//             label="收款方式"
//             fullWidth
//             margin="dense"
//             name="paymentMethod"
//             value={customerData.paymentMethod || ""}
//             onChange={handleChange}
//           />
//           <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//             <TextField
//               label="收款人"
//               fullWidth
//               name="contact3"
//               value={customerData.contact3 || ""}
//               onChange={handleChange}
//             />
//             <TextField
//               label="收款人電話"
//               fullWidth
//               name="cellphone3"
//               value={customerData.cellphone3 || ""}
//               onChange={handleChange}
//             />
//           </div>

//           {/* 其他 */}
//           <Divider sx={{ my: 2 }} />
//           <Typography variant="h6">其他</Typography>
//           <TextField
//             label="注意事項"
//             fullWidth
//             margin="dense"
//             multiline
//             rows={3}
//             name="notes"
//             value={customerData.notes || ""}
//             onChange={handleChange}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>取消</Button>
//           <Button variant="contained" color="primary" onClick={handleSaveProject}>
//             儲存
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }


// const Order = ({ customersData, setCustomersData }) => {
//   const { customerId } = useParams(); // 從 URL 獲取 customerId
//   const navigate = useNavigate();
//   const [customerData, setCustomerData] = useState(null);
//   const [projectData, setProjectData] = useState({
//     name: "",
//     city: "",
//     district: "",
//     road: "",
//     item: "",
//     days: 0,
//     price: 0,
//     billingMethod: "",
//     billingContact: "",
//     paymentMethod: "",
//     notes: "",
//     date: new Date().toISOString().split("T")[0], // 預設為今天的日期
//   });

//   // 找到對應客戶資料
//   useEffect(() => {
//     if (Array.isArray(customersData) && customersData.length > 0) {
//       const customer = customersData.find((customer) => customer.id === parseInt(customerId));
//       if (customer) {
//         setCustomerData(customer);
//       } else {
//         // 如果找不到該客戶，跳轉回首頁
//         navigate("/");
//       }
//     }
//   }, [customerId, customersData, navigate]);

//   const handleSaveProject = () => {
//     const newProject = {
//       id: new Date().getTime(), // 使用時間戳作為專案 ID
//       ...projectData,
//     };

//     setCustomersData((prevCustomersData) => {
//       return prevCustomersData.map((customer) => {
//         if (customer.id === parseInt(customerId)) {
//           return {
//             ...customer,
//             projects: [...customer.projects, newProject],
//           };
//         }
//         return customer;
//       });
//     });

//     navigate("/"); // 保存後跳轉回專案列表頁
//   };

//   if (!customerData) {
//     return <div>Loading...</div>; // 若客戶資料尚未載入，顯示 Loading
//   }

//   return (
//     <div>
//       <Dialog open={true} onClose={() => navigate("/")}>
//         <DialogTitle>新增專案 - {customerData.name}</DialogTitle>
//         <DialogContent>
//           <Typography variant="h6">施工細節</Typography>
//           <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//             <Autocomplete
//               options={taiwanCities}
//               renderInput={(params) => <TextField {...params} label="縣市" fullWidth />}
//               value={projectData.location || ""}
//               onChange={(event, newValue) => setProjectData({ ...projectData, location: newValue })}
//             />
//             <Autocomplete
//               options={taiwanDistricts[projectData.location] || []} // 根據選擇的 city 提供區域選項
//               renderInput={(params) => <TextField {...params} label="區域" fullWidth />}
//               value={projectData.district || ""}
//               onChange={(event, newValue) => setProjectData({ ...projectData, district: newValue })}
//             />
//           </div>
//           <TextField
//             label="地址"
//             fullWidth
//             value={projectData.address || ""}
//             onChange={(e) => setProjectData({ ...projectData, address: e.target.value })}
//             margin="dense"
//           />
//           <TextField
//             label="施工項目"
//             fullWidth
//             value={projectData.item || ""}
//             onChange={(e) => setProjectData({ ...projectData, item: e.target.value })}
//             margin="dense"
//           />
//           <TextField
//             label="施工天數"
//             fullWidth
//             value={projectData.days || ""}
//             onChange={(e) => setProjectData({ ...projectData, days: e.target.value })}
//             margin="dense"
//             type="number"
//           />
//           <Divider sx={{ my: 2 }} />
//           <Typography variant="h6">金流資訊</Typography>
//           <TextField
//             label="定價"
//             fullWidth
//             value={projectData.price || ""}
//             onChange={(e) => setProjectData({ ...projectData, price: e.target.value })}
//             margin="dense"
//             type="number"
//           />
//           <TextField
//             label="請款方式"
//             fullWidth
//             value={projectData.billingMethod || ""}
//             onChange={(e) => setProjectData({ ...projectData, billingMethod: e.target.value })}
//             margin="dense"
//           />
//           <TextField
//             label="收款方式"
//             fullWidth
//             value={projectData.paymentMethod || ""}
//             onChange={(e) => setProjectData({ ...projectData, paymentMethod: e.target.value })}
//             margin="dense"
//           />
//           <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//             <TextField
//               label="收款人"
//               fullWidth
//               value={projectData.contact3 || ""}
//               onChange={(e) => setProjectData({ ...projectData, contact3: e.target.value })}
//               margin="dense"
//             />
//             <TextField
//               label="收款人電話"
//               fullWidth
//               value={projectData.cellphone3 || ""}
//               onChange={(e) => setProjectData({ ...projectData, cellphone3: e.target.value })}
//               margin="dense"
//             />
//           </div>
//           <Divider sx={{ my: 2 }} />
//           <Typography variant="h6">其他</Typography>
//           <TextField
//             label="注意事項"
//             fullWidth
//             value={projectData.notes || ""}
//             onChange={(e) => setProjectData({ ...projectData, notes: e.target.value })}
//             margin="dense"
//             multiline
//             rows={3}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => navigate("/")}>取消</Button>
//           <Button variant="contained" color="primary" onClick={handleSaveProject}>新增</Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// return (
//   <div>
//     <Dialog open={true} onClose={() => navigate("/")}>
//       <DialogTitle>新增專案 - {customerData.name}</DialogTitle>
//       <DialogContent>
//         {/* 顯示現有的訂單資料 */}
//         <Typography variant="h6">現有訂單</Typography>
//         {customerData.projects && customerData.projects.length > 0 ? (
//           <ul>
//             {customerData.projects.map((project) => (
//               <li key={project.id}>
//                 <Typography variant="body1">
//                   <strong>專案名稱:</strong> {project.name}
//                   <br />
//                   <strong>施工地點:</strong> {project.location}, {project.district}
//                   <br />
//                   <strong>施工項目:</strong> {project.item}
//                   <br />
//                   <strong>施工天數:</strong> {project.days} 天
//                   <br />
//                   <strong>定價:</strong> {project.price} 元
//                   <br />
//                   <strong>請款方式:</strong> {project.billingMethod}
//                   <br />
//                   <strong>收款方式:</strong> {project.paymentMethod}
//                   <br />
//                   <strong>收款人:</strong> {project.contact3}
//                   <br />
//                   <strong>收款人電話:</strong> {project.cellphone3}
//                   <br />
//                   <strong>注意事項:</strong> {project.notes}
//                 </Typography>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <Typography variant="body1">目前無任何訂單。</Typography>
//         )}

//         <Divider sx={{ my: 2 }} />
//         <Typography variant="h6">新增專案</Typography>
//         <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//           <Autocomplete
//             options={taiwanCities}
//             renderInput={(params) => <TextField {...params} label="縣市" fullWidth />}
//             value={projectData.location || ""}
//             onChange={(event, newValue) => setProjectData({ ...projectData, location: newValue })}
//           />
//           <Autocomplete
//             options={taiwanDistricts[projectData.location] || []} // 根據選擇的 city 提供區域選項
//             renderInput={(params) => <TextField {...params} label="區域" fullWidth />}
//             value={projectData.district || ""}
//             onChange={(event, newValue) => setProjectData({ ...projectData, district: newValue })}
//           />
//         </div>
//         <TextField
//           label="地址"
//           fullWidth
//           value={projectData.address || ""}
//           onChange={(e) => setProjectData({ ...projectData, address: e.target.value })}
//           margin="dense"
//         />
//         <TextField
//           label="施工項目"
//           fullWidth
//           value={projectData.item || ""}
//           onChange={(e) => setProjectData({ ...projectData, item: e.target.value })}
//           margin="dense"
//         />
//         <TextField
//           label="施工天數"
//           fullWidth
//           value={projectData.days || ""}
//           onChange={(e) => setProjectData({ ...projectData, days: e.target.value })}
//           margin="dense"
//           type="number"
//         />
//         <Divider sx={{ my: 2 }} />
//         <Typography variant="h6">金流資訊</Typography>
//         <TextField
//           label="定價"
//           fullWidth
//           value={projectData.price || ""}
//           onChange={(e) => setProjectData({ ...projectData, price: e.target.value })}
//           margin="dense"
//           type="number"
//         />
//         <TextField
//           label="請款方式"
//           fullWidth
//           value={projectData.billingMethod || ""}
//           onChange={(e) => setProjectData({ ...projectData, billingMethod: e.target.value })}
//           margin="dense"
//         />
//         <TextField
//           label="收款方式"
//           fullWidth
//           value={projectData.paymentMethod || ""}
//           onChange={(e) => setProjectData({ ...projectData, paymentMethod: e.target.value })}
//           margin="dense"
//         />
//         <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//           <TextField
//             label="收款人"
//             fullWidth
//             value={projectData.contact3 || ""}
//             onChange={(e) => setProjectData({ ...projectData, contact3: e.target.value })}
//             margin="dense"
//           />
//           <TextField
//             label="收款人電話"
//             fullWidth
//             value={projectData.cellphone3 || ""}
//             onChange={(e) => setProjectData({ ...projectData, cellphone3: e.target.value })}
//             margin="dense"
//           />
//         </div>
//         <Divider sx={{ my: 2 }} />
//         <Typography variant="h6">其他</Typography>
//         <TextField
//           label="注意事項"
//           fullWidth
//           value={projectData.notes || ""}
//           onChange={(e) => setProjectData({ ...projectData, notes: e.target.value })}
//           margin="dense"
//           multiline
//           rows={3}
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={() => navigate("/")}>取消</Button>
//         <Button variant="contained" color="primary" onClick={handleSaveProject}>新增</Button>
//       </DialogActions>
//     </Dialog>
//   </div>
// );
// };


// export default Order;