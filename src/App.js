import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, Container } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Calendar from "./pages/Calendar";

function App() {
  return (
    <Router>
      <CssBaseline />
      <Sidebar />
      <Container sx={{ marginLeft: '240px', padding: '20px' }}>
        <Routes>
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
