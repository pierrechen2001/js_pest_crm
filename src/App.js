import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CssBaseline, CircularProgress, Box, Container } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NotFound from "./pages/NotFound";

const initialCustomers = [
  { id: 1, type: "古蹟、政府機關", name: "新竹縣政府文化局", contact1: "王惠儀小姐", cellphone1: "0985915055", city: "新竹縣", district: "竹北市", road: "東平里16號" },
  { id: 2, type: "一般住家", name: "致昶有限公司", contact1: "賴先生", cellphone1: "0936226183", contact2: "賴先生-父親", cellphone2: "0932048729", Tel: "034608178", city: "桃園市", district: "平鎮區", road: "建明路一段58號" },
  { id: 3, type: "建築師", name: "承熙建築師事務所", TaxID: "26203727", contact1: "詹益榮", cellphone1: "0920616366", Tel: "0229335557", Fax: "29335517", city: "台北市", district: "文山區", road: "興隆路1段55巷27弄38號1樓" },
  { id: 4, type: "營造、設計公司", name: "逢昌營造有限公司", contact1: "小李主任（現場）", cellphone1: "0989302833", Email: "emily@daling.com.tw", city: "桃園市", district: "大溪區", road: "大溪老街（中山路8,10,12,14,16號）" },
];
const initialProjects = [
  { name: "專案 A", date: "2025-04-02", status: "進行中", billing: "已請款" },
  { name: "專案 B", date: "2025-03-30", status: "已完成", billing: "未請款" },
  { name: "專案 C", date: "2025-03-28", status: "未開始", billing: "未請款" },
];

const customersData = [
  {
    id: 1,
    type: "古蹟、政府機關",
    name: "新竹縣政府文化局",
    contact1: "王惠儀小姐", 
    cellphone1: "0985915055", 
    city: "新竹縣", 
    district: "竹北市", 
    road: "東平里16號",
    projects: [
      {
        id: 101,
        name: "竹北林家祠",
        city: "新竹縣", 
        district: "竹北市", 
        road: "東平里16號",
        item: "除蟲",
        date: "2025-04-01~2025-04-02",
        days: 2,
        price: 10000,
        billingMethod: "Line",
        billingContact: "LineID",
        paymentMethod: "轉帳",
        notes: "注意事項 A1",
      },
    ],
  },
  {
    id: 2,
    type: "一般住家", 
    name: "致昶有限公司", 
    contact1: "賴先生", 
    cellphone1: "0936226183", 
    contact2: "賴先生-父親", 
    cellphone2: "0932048729", 
    Tel: "034608178",
    projects: [
      {
        id: 201,
        name: "辦公大樓除蟲",  
        city: "桃園市", 
        district: "平鎮區", 
        road: "建明路一段58號" ,
        item: "白蟻防治",
        date: "2025-03-28~2025-03-30",
        days: 3,
        price: 12000,
        billingMethod: "Email",
        billingContact: "xxxx@gmail.com",
        paymentMethod: "轉帳",
        notes: "注意事項 B1",
      },
    ],
  },
  {
    id: 3,
    type: "建築師", 
    name: "承熙建築師事務所", 
    TaxID: "26203727", 
    contact1: "詹益榮", 
    cellphone1: "0920616366", 
    Tel: "0229335557", 
    Fax: "29335517", 
    city: "台北市", 
    district: "文山區", 
    road: "興隆路1段55巷27弄38號1樓",
    projects: [
      {
        id: 301,
        name: "承熙建築師事務所除蟲",  
        city: "新北市", 
        district: "三峽區", 
        road: "中山路18號" ,
        item: "白蟻防治",
        date: "2024-05-22~2025-05-22",
        days: 1,
        price: 1202100,
        billingMethod: "電話",
        billingContact: "侯婉珍小姐 0903-661-570",
        paymentMethod: "轉帳",
        notes: "注意事項 C1",
      },
    ],
  },
  {
    id: 4,
    type: "營造、設計公司", 
    name: "逢昌營造有限公司", 
    contact1: "李俊寬", 
    cellphone1: "0989302833", 
    Email: "emily@daling.com.tw", 
    city: "新北市", 
    district: "汐止區", 
    road: "新台五路一段77號11樓-7" ,
    projects: [
      {
        id: 301,
        name: "大溪老街",  
        city: "桃園市", 
        district: "大溪區", 
        road: "大溪老街（中山路8,10,12,14,16號）" ,
        item: "白蟻防治",
        date: "2020-11-17~2020-11-19",
        days: 3,
        price: 25515,
        billingMethod: "電話",
        billingContact: "莊小姐 8698-2100#131",
        paymentMethod: "轉帳",
        notes: "注意事項 D1",
      },
    ],
  },
];

// 主應用組件
function App() {
  return (
    <Router>
      <AppContent />
    </Router>

  );
}

// 子組件，包含需要 router hooks 的邏輯
function AppContent() {
  // 在 Router 環境中使用 useLocation
  const location = useLocation();
  const nodeRef = useRef(null);
  
  // 檢查用戶是否已登入
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初始化驗證狀態 - 程式啟動時檢查登入狀態
  useEffect(() => {
    // 清除所有驗證資訊，確保系統預設為登出狀態
    if (!localStorage.getItem("isAuthenticated")) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRoles");
    }
    
    // 檢查是否已登入
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(auth);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 登入處理
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // 登出處理
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRoles");
    setIsAuthenticated(false);
  };

  // 加載中顯示
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      
      {isAuthenticated && <Sidebar onLogout={handleLogout} />}
      
      <Container
        sx={{
          marginLeft: isAuthenticated ? "240px" : "0",
          padding: "20px",
          transition: "margin 0.3s",
          width: isAuthenticated ? "calc(100% - 240px)" : "100%",
        }}
      >
        <TransitionGroup>
          <CSSTransition
            key={location.key}
            nodeRef={nodeRef}
            classNames="fade"
            timeout={300}
          >
            <div ref={nodeRef}>
              <Routes location={location}>
                {/* 公開路由 */}
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/customers" />
                    ) : (
                      <Login onLogin={handleLogin} />
                    )
                  }
                />

                {/* 受保護的路由 */}
                <Route
                  path="/customers"
                  element={
                    isAuthenticated ? <Customers /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/orders"
                  element={
                    isAuthenticated ? <Orders /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    isAuthenticated ? <Inventory /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    isAuthenticated ? <Calendar /> : <Navigate to="/login" />
                  }
                />

                {/* 管理員路由 */}
                <Route
                  path="/user-management"
                  element={
                    isAuthenticated ? <UserManagement /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/role-management"
                  element={
                    isAuthenticated ? <RoleManagement /> : <Navigate to="/login" />
                  }
                />

                {/* 首頁重定向 */}
                <Route
                  path="/"
                  element={
                    <Navigate to={isAuthenticated ? "/customers" : "/login"} />
                  }
                />

                {/* 捕捉不存在的路由 */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </Container>
    </>
  );
}

export default App;