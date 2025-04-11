import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { CssBaseline, Container } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Calendar from "./pages/Calendar";
import CustomerDetailPage from "./pages/CustomerDetailPage";

const initialCustomers = [
  { id: 1, type: "古蹟、政府機關", name: "新竹縣政府文化局", contact1: "王惠儀小姐", cellphone1: "0985915055", city: "新竹縣", district: "竹北市", road: "東平里16號" },
  { id: 2, type: "一般住家", name: "致昶有限公司", contact1: "賴先生", cellphone1: "0936226183", contact2: "賴先生-父親", cellphone2: "0932048729", Tel: "034608178", city: "桃園市", district: "平鎮區", road: "建明路一段58號" },
  { id: 3, type: "建築師", name: "承熙建築師事務所", TaxID: "26203727", contact1: "詹益榮", cellphone1: "0920616366", Tel: "0229335557", Fax: "29335517", city: "台北市", district: "文山區", road: "興隆路1段55巷27弄38號1樓" },
  { id: 4, type: "營造、設計公司", name: "逢昌營造有限公司", contact1: "小李主任（現場）", cellphone1: "0989302833", Email: "emily@daling.com.tw", city: "桃園市", district: "大溪區", road: "大溪老街（中山路8,10,12,14,16號）" },
];
// const initialProjects = [
//   { name: "專案 A", date: "2025-04-02", status: "進行中", billing: "已請款" },
//   { name: "專案 B", date: "2025-03-30", status: "已完成", billing: "未請款" },
//   { name: "專案 C", date: "2025-03-28", status: "未開始", billing: "未請款" },
// ];

// const customersData = [
//   {
//     id: 1,
//     type: "古蹟、政府機關",
//     name: "新竹縣政府文化局",
//     contact1: "王惠儀小姐", 
//     cellphone1: "0985915055", 
//     city: "新竹縣", 
//     district: "竹北市", 
//     road: "東平里16號",
//     projects: [
//       {
//         id: 101,
//         name: "竹北林家祠",
//         city: "新竹縣", 
//         district: "竹北市", 
//         road: "東平里16號",
//         item: "除蟲",
//         date: "2025-04-01~2025-04-02",
//         days: 2,
//         price: 10000,
//         billingMethod: "Line",
//         billingContact: "LineID",
//         paymentMethod: "轉帳",
//         notes: "注意事項 A1",
//       },
//     ],
//   },
//   {
//     id: 2,
//     type: "一般住家", 
//     name: "致昶有限公司", 
//     contact1: "賴先生", 
//     cellphone1: "0936226183", 
//     contact2: "賴先生-父親", 
//     cellphone2: "0932048729", 
//     Tel: "034608178",
//     projects: [
//       {
//         id: 201,
//         name: "辦公大樓除蟲",  
//         city: "桃園市", 
//         district: "平鎮區", 
//         road: "建明路一段58號" ,
//         item: "白蟻防治",
//         date: "2025-03-28~2025-03-30",
//         days: 3,
//         price: 12000,
//         billingMethod: "Email",
//         billingContact: "xxxx@gmail.com",
//         paymentMethod: "轉帳",
//         notes: "注意事項 B1",
//       },
//     ],
//   },
//   {
//     id: 3,
//     type: "建築師", 
//     name: "承熙建築師事務所", 
//     TaxID: "26203727", 
//     contact1: "詹益榮", 
//     cellphone1: "0920616366", 
//     Tel: "0229335557", 
//     Fax: "29335517", 
//     city: "台北市", 
//     district: "文山區", 
//     road: "興隆路1段55巷27弄38號1樓",
//     projects: [
//       {
//         id: 301,
//         name: "承熙建築師事務所除蟲",  
//         city: "新北市", 
//         district: "三峽區", 
//         road: "中山路18號" ,
//         item: "白蟻防治",
//         date: "2024-05-22~2025-05-22",
//         days: 1,
//         price: 1202100,
//         billingMethod: "電話",
//         billingContact: "侯婉珍小姐 0903-661-570",
//         paymentMethod: "轉帳",
//         notes: "注意事項 C1",
//       },
//     ],
//   },
//   {
//     id: 4,
//     type: "營造、設計公司", 
//     name: "逢昌營造有限公司", 
//     contact1: "李俊寬", 
//     cellphone1: "0989302833", 
//     Email: "emily@daling.com.tw", 
//     city: "新北市", 
//     district: "汐止區", 
//     road: "新台五路一段77號11樓-7" ,
//     projects: [
//       {
//         id: 301,
//         name: "大溪老街",  
//         city: "桃園市", 
//         district: "大溪區", 
//         road: "大溪老街（中山路8,10,12,14,16號）" ,
//         item: "白蟻防治",
//         date: "2020-11-17~2020-11-19",
//         days: 3,
//         price: 25515,
//         billingMethod: "電話",
//         billingContact: "莊小姐 8698-2100#131",
//         paymentMethod: "轉帳",
//         notes: "注意事項 D1",
//       },
//     ],
//   },
// ];


const App = () => {
  const [customers, setCustomers] = useState(initialCustomers); // Use state to store customers
  // const [projects, setProjects] = useState(initialProjects); // Use state to store projects
  // const [customersData, setCustomersData] = useState(customersData); // Use state to store customers data
  return (
    <>
      <CssBaseline />
      <Sidebar />
      <Container sx={{ marginLeft: '100px', padding: '20px' }}>
        <Routes>
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/" element={<Customers customers={customers} />} />
          {/* 根據 ID 渲染詳細頁面 */}
          <Route path="/customer/:id" element={<CustomerDetailPage customers={customers} setCustomers={setCustomers}/>} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
