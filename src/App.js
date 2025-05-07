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
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NotFound from "./pages/NotFound";
import { supabase } from './lib/supabaseClient';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, hasRole, loading } = useAuth();

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

  // if (requiredRole && !hasRole(requiredRole)) {
  //   return <Navigate to="/customers" replace />;
  // }

  return children;
};

// Main App Content
const AppContent = () => {
  const { user, loading, error: authError } = useAuth();
  const location = useLocation();
  const nodeRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customers only when needed
  useEffect(() => {
    const fetchCustomers = async () => {
      // Don't fetch if we're not on a page that needs customers data
      if (!user || !location.pathname.includes('/customer')) {
        return;
      }

      try {
        setLoadingCustomers(true);
        console.log("Fetching customers data...");
        
        const { data, error } = await supabase
          .from('customer_database')
          .select('*');

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError(error.message);
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (user && !loading) {
      fetchCustomers();
    }
  }, [user, loading, location.pathname]);

  // Display a loading indicator if the auth state is still initializing
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Display any auth errors
  if (authError) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Authentication Error
        </Typography>
        <Typography variant="body1">
          {authError}
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

  // Customer CRUD operations
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
      {user && <Sidebar />}
      
      <Container
        sx={{
          marginLeft: user ? "240px" : "0",
          padding: "20px",
          transition: "margin 0.3s",
          width: user ? "calc(100% - 240px)" : "100%",
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
                        loading={loadingCustomers} 
                        error={error} 
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
                      <Orders />
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
                      <Calendar />
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
                      <MapComponent />
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