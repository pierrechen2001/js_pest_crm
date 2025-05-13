import React, { useState, useEffect, useRef, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CssBaseline, CircularProgress, Box, Container, Typography, Button } from "@mui/material";
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
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import PendingApproval from './pages/PendingApproval';
import UserApprovals from './pages/UserApprovals';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NotFound from "./pages/NotFound";
import { supabase } from './lib/supabaseClient';

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
  if (!user.isApproved && user.roles[0] !== 'admin' && location.pathname !== '/pending-approval') {
    console.log('User not approved, redirecting to pending approval page');
    return <Navigate to="/pending-approval" replace />;
  }

  // Check for required role
  if (requiredRole && !hasRole(requiredRole)) {
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
      {user && <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />}
      
      <Container
        sx={{
          marginLeft: user ? (sidebarCollapsed ? "64px" : "240px") : "0",
          padding: "20px",
          transition: "margin 0.3s",
          width: user ? (sidebarCollapsed ? "calc(100% - 64px)" : "calc(100% - 240px)") : "100%",
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
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/customers" />} />

                {/* Protected Routes */}
                <Route
                  path="/customers"
                  element={
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
                  }
                />

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
                  path="/user-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/role-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <RoleManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/user-approvals"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UserApprovals />
                    </ProtectedRoute>
                  }
                />

                {/* Public Routes */}
                <Route path="/pending-approval" element={<PendingApproval />} />

                {/* Default Routes */}
                <Route path="/" element={<Navigate to={user ? "/customers" : "/login"} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </Container>
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;