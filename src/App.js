import React, { useState, useEffect, useRef, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box, Container, Typography, Button } from "@mui/material";
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from "./components/Sidebar";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Inventory from "./pages/Inventory";
import Calendar from "./pages/Calendar";
import ApiCalendar from "./pages/ApiCalendar";
import MapComponent from './pages/Map';
import Login from "./pages/Login";
import PendingApproval from './pages/PendingApproval';
import UserApprovals from './pages/UserApprovals';
import HomePage from "./pages/HomePage";
import AboutSystem from "./pages/AboutSystem";
import { CSSTransition } from 'react-transition-group';
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NotFound from "./pages/NotFound";
import { supabase } from './lib/supabaseClient';
import theme from './theme.js'; // Assuming you have a theme.js file for MUI theme


// Protected Route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is approved
  if (user.isApproved === false && user.roles[0] !== 'admin' && location.pathname !== '/pending-approval') {
    console.log('User not approved, redirecting to pending approval page');
    return <Navigate to="/pending-approval" replace />;
  }

  // Check for required role
  if (requiredRole && user.roles[0] !== requiredRole) {
    return <Navigate to="/customers" replace />;
  }

  return children;
};

// Main App Content
const AppContent = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const location = useLocation();
  const nodeRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isInitialising, setIsInitialising] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log("User authenticated, fetching app data (customers and projects)...");
      try {
        const customerPromise = supabase.from('customer_database').select('*');
        const projectPromise = supabase.from('project').select('*, customer_database(customer_id, customer_name)');

        const [customerResponse, projectResponse] = await Promise.all([customerPromise, projectPromise]);

        if (customerResponse.error) throw customerResponse.error;
        setCustomers(customerResponse.data || []);

        if (projectResponse.error) throw projectResponse.error;
        setProjects(projectResponse.data || []);

      } catch (error) {
        console.error('Error fetching app data in App.js:', error);
        setFetchError(error.message);
      } finally {
        setIsInitialising(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchData();
      } else {
        setIsInitialising(false);
      }
    }
  }, [user, authLoading]);

  if (isInitialising) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (authError || fetchError) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1">
          {authError || fetchError}
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 3 }}
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  const addCustomer = async (customerData) => {
    try {
      const { data, error } = await supabase
        .from('customer_database')
        .insert([customerData])
        .select();

      if (error) throw error;
      setCustomers(prev => [...prev, data[0]]);
      return data[0];
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('customer_database')
        .update(updates)
        .eq('customer_id', id)
        .select();

      if (error) throw error;
      setCustomers(prev => prev.map(c => c.customer_id === id ? data[0] : c));
      return data[0];
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const { error } = await supabase
        .from('customer_database')
        .delete()
        .eq('customer_id', id);

      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.customer_id !== id));
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
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  };

  return (
    <>
      <CssBaseline />
      {location.pathname !== '/login' && (
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      )}
      
      <Box sx={{
        flexGrow: 1,
        pt: 2,
        ml: { xs: 0, sm: sidebarCollapsed ? '64px' : '240px' },
        transition: theme => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* 首頁 */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            
            <Route path="/customers" element={
              <ProtectedRoute>
                <Customers 
                  customers={customers} 
                  setCustomers={setCustomers}
                  loading={isInitialising} 
                  error={fetchError} 
                  addCustomer={addCustomer} 
                  updateCustomer={updateCustomer} 
                  deleteCustomer={deleteCustomer} 
                />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route
              path="/customer/:customerId"
              element={
                <ProtectedRoute>
                  <CustomerDetailPage
                    customers={customers}
                    fetchProjectsByCustomerId={fetchProjectsByCustomerId}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders projects={projects} customers={customers} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order/:projectId"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Navigate to="/apicalendar" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/apicalendar"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<CircularProgress />}>
                    <ApiCalendar />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapComponent projects={projects} />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}

            <Route
              path="/UserApprovals"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserApprovals />
                </ProtectedRoute>
              }
            />

            {/* 關於系統頁面 */}
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <AboutSystem />
                </ProtectedRoute>
              }
            />

            {/* Default Routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
};

export default App;