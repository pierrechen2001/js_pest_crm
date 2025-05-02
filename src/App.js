import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CssBaseline, CircularProgress, Box, Container } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Calendar from "./pages/Calendar";
import ApiCalendar from "./pages/ApiCalendar";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NotFound from "./pages/NotFound";
import { supabase } from './lib/supabaseClient';



// 主應用組件
const App = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 獲取客戶數據
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_database')
        .select("*")
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 添加客戶
  const addCustomer = async (customerData) => {
    try {
      const { data, error } = await supabase
        .from('customer_database')
        .insert([{
          customer_type: customerData.customer_type,
          customer_name: customerData.customer_name,
          contact_person_1: customerData.contact_person_1,
          contact_phone_1: customerData.contact_phone_1,
          contact_person_2: customerData.contact_person_2,
          contact_phone_2: customerData.contact_phone_2,
          contact_city: customerData.contact_city,
          contact_district: customerData.contact_district,
          contact_address: customerData.contact_address,
          email: customerData.email,
          notes: customerData.notes,
          tax_id: customerData.tax_id,
          invoice_title: customerData.invoice_title
        }])
        .select();

      if (error) throw error;
      setCustomers(prev => [...prev, data[0]]);
      return data[0];
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  // 更新客戶
  const updateCustomer = async (customerId, updates) => {
    try {
      const { data, error } = await supabase
        .from('customer_database')
        .update(updates)
        .eq('customer_id', customerId)
        .select();

      if (error) throw error;
      setCustomers(prev => 
        prev.map(customer => 
          customer.customer_id === customerId ? data[0] : customer
        )
      );
      return data[0];
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  // 刪除客戶
  const deleteCustomer = async (customerId) => {
    try {
      const { error } = await supabase
        .from('customer_database')
        .delete()
        .eq('customer_id', customerId);

      if (error) throw error;
      setCustomers(prev => 
        prev.filter(customer => customer.customer_id !== customerId)
      );
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  const fetchProjectsByCustomerId = async (customerId) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('customer_id', customerId);
  
      if (error) throw error;
  
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  };

  // 初始加載數據
  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <Router>
      <AppContent 
        customers={customers}
        loading={loading}
        error={error}
        addCustomer={addCustomer}
        updateCustomer={updateCustomer}
        deleteCustomer={deleteCustomer}
        refetchCustomers={fetchCustomers}
        fetchProjectsByCustomerId={fetchProjectsByCustomerId}
      />
    </Router>
  );
};

// 子組件，包含需要 router hooks 的邏輯
function AppContent({ customers, loading, error, addCustomer, updateCustomer, deleteCustomer, refetchCustomers, fetchProjectsByCustomerId }) {
  // 在 Router 環境中使用 useLocation
  const location = useLocation();
  const nodeRef = useRef(null);
  
  // 檢查用戶是否已登入
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
                    isAuthenticated ? <Customers customers={customers} /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/customer/:customerId"
                  element={
                    isAuthenticated ? (
                      <CustomerDetailPage
                        customers={customers}
                        fetchProjectsByCustomerId={fetchProjectsByCustomerId}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
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

                <Route
                  path="/apicalendar"
                  element={
                    isAuthenticated ? <ApiCalendar /> : <Navigate to="/login" />
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