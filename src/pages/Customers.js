import React, { useState } from "react";
import { 
  Typography, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Grid
} from "@mui/material";

// 客戶資料
const customersData = [
  { id: 1, type: "古蹟、政府機關", name: "新竹縣政府文化局-竹北林家祠", contact: "王惠儀小姐", cellphone: "0985915055", city: "新竹縣", district: "竹北市", road: "東平里16號" },
  { id: 2, type: "一般住家", name: "致昶有限公司", contact: "賴先生", cellphone: "0936226183", city: "桃園市", district: "平鎮區", road: "建明路一段58號" },
  { id: 3, type: "建築師", name: "承熙建築師事務所", contact: "詹益榮建築師", cellphone: "0920616366", city: "台北市", district: "文山區", road: "興隆路1段55巷27弄38號1樓" },
  { id: 4, type: "營造、設計公司", name: "逢昌營造有限公司", contact: "小李主任（現場）", cellphone: "0989302833", city: "桃園市", district: "大溪區", road: "大溪老街（中山路8,10,12,14,16號）" },
];

// 縣市與區域對應資料
const cityDistricts = {
  "台北市": ["中正區", "大安區", "信義區"],
  "新北市": ["板橋區", "新莊區", "淡水區"],
  "台中市": ["西屯區", "北區", "南屯區"],
  "嘉義市": ["東區", "西區"],
  "桃園市": ["平鎮區", "大溪區"],
  "新竹縣": ["竹北市", "竹東鎮", "新埔鎮", "關西鎮", "湖口鄉", "新豐鄉", "峨眉鄉", "寶山鄉", "北埔鄉", "芎林鄉", "橫山鄉", "尖石鄉", "五峰鄉"]
};

// 客戶類型選單
const customerTypes = ["古蹟、政府機關", "一般住家", "建築師", "營造、設計公司"];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState(""); // 搜尋關鍵字
  const [selectedCity, setSelectedCity] = useState(""); // 選擇的縣市
  const [selectedDistrict, setSelectedDistrict] = useState(""); // 選擇的區域
  const [selectedType, setSelectedType] = useState(""); // 選擇的客戶類型

  // 篩選客戶資料
  const filteredCustomers = customersData.filter((customer) =>
    (selectedCity === "" || customer.city === selectedCity) &&
    (selectedDistrict === "" || customer.district === selectedDistrict) &&
    (selectedType === "" || customer.type === selectedType) &&
    (customer.name.includes(searchTerm) || 
     customer.contact.includes(searchTerm) || 
     customer.cellphone.includes(searchTerm) ||
     customer.road.includes(searchTerm))
  );

  return (
    <div style={{ padding: "20px" }}>
      {/* 標題 */}
      <Typography variant="h4" gutterBottom>
        客戶管理
      </Typography>

      <Grid container spacing={2}>
        {/* 客戶類型篩選 */}
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>選擇客戶類型</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">全部</MenuItem>
              {customerTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 縣市篩選 */}
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>選擇縣市</InputLabel>
            <Select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict(""); // 變更縣市時，清空區域選擇
              }}
            >
              <MenuItem value="">全部</MenuItem>
              {Object.keys(cityDistricts).map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 區域篩選 */}
        <Grid item xs={4}>
          <FormControl fullWidth disabled={!selectedCity}>
            <InputLabel>選擇區域</InputLabel>
            <Select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <MenuItem value="">全部</MenuItem>
              {selectedCity &&
                cityDistricts[selectedCity].map((district) => (
                  <MenuItem key={district} value={district}>{district}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* 搜尋欄位 */}
      <TextField
        label="搜尋客戶 / 聯絡人 / 電話 / 地址"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 新增客戶按鈕 */}
      <Button variant="contained" color="primary" style={{ marginBottom: "10px" }}>
        新增客戶
      </Button>

      {/* 客戶清單表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>客戶分類</TableCell>
              <TableCell>客戶名</TableCell>
              <TableCell>聯絡人</TableCell>
              <TableCell>聯絡人手機</TableCell>
              <TableCell>縣市</TableCell>
              <TableCell>區域</TableCell>
              <TableCell>地點</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.type}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.contact}</TableCell>
                  <TableCell>{customer.cellphone}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>{customer.district}</TableCell>
                  <TableCell>{customer.road}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} style={{ textAlign: "center", color: "gray" }}>
                  沒有符合的客戶
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Customers;