import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, ListItemText, CircularProgress, Typography, TablePagination } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { Add } from "@mui/icons-material";
import CustomerForm from '../components/CustomerForm';

const customerTypes = ["古蹟、政府機關", "一般住家", "建築師", "營造、設計公司"];
const filterOptions = ["客戶名稱", "聯絡人姓名", "聯絡手機", "地址"];

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
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // When initialCustomers changes, update customersState
  useEffect(() => {
    setCustomers(customers);
  }, [customers, setCustomers]);

  // 處理 Dialog 開關
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  // 新增客戶
  const handleSaveCustomer = async (customerFormData) => {
    try {
      const formattedData = {
        customer_type: customerFormData.customerType,
        customer_name: customerFormData.customer_name,
        contact_city: customerFormData.contact_city,
        contact_district: customerFormData.contact_district,
        contact_address: customerFormData.contact_address,
        email: customerFormData.email,
        tax_id: customerFormData.tax_id,
        invoice_title: customerFormData.invoice_title,
        notes: customerFormData.notes,
        company_phone: customerFormData.company_phone,
        fax: customerFormData.fax,
        contact1_role: customerFormData.contact1_role,
        contact1_name: customerFormData.contact1_name,
        contact1_type: customerFormData.contact1_type,
        contact1_contact: customerFormData.contact1_contact,
        contact2_role: customerFormData.contact2_role,
        contact2_name: customerFormData.contact2_name,
        contact2_type: customerFormData.contact2_type,
        contact2_contact: customerFormData.contact2_contact,
        contact3_role: customerFormData.contact3_role,
        contact3_name: customerFormData.contact3_name,
        contact3_type: customerFormData.contact3_type,
        contact3_contact: customerFormData.contact3_contact,
      };
      
      await addCustomer(formattedData);
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('新增客戶失敗，請稍後再試！');
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
          case "聯絡手機":
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

  const paginatedCustomers = filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

          <Button startIcon={<Add />} variant="contained" onClick={handleOpen} style={{ marginBottom: 10 }}>新增客戶</Button>
          <CustomerForm
            open={open}
            onClose={handleClose}
            onSave={handleSaveCustomer}
            mode="create"
            showCustomerTypeStep={true}
          />
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
        <Button variant={selectedType === "" ? "contained" : "outlined"} onClick={() => setSelectedType("")} color="secondary" sx={{ fontWeight: 600 }}>全部</Button>
        {customerTypes.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "contained" : "outlined"}
            onClick={() => setSelectedType(type)}
            color="secondary"
            sx={{ fontWeight: 600 }}
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
              <TableCell style={{ width: "13%" }}>聯絡手機</TableCell>
              <TableCell style={{ width: "35%" }}>地址</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCustomers.map((customer, index) => (
              <TableRow 
                key={customer.customer_id} 
                hover 
                style={{ cursor: "pointer" }} 
                onClick={() => navigate(`/customer/${customer.customer_id}`)}
              >
                <TableCell style={{ width: "7%" }}>{page * rowsPerPage + index + 1}</TableCell>
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
        <TablePagination
          component="div"
          count={filteredCustomers.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          labelRowsPerPage="每頁顯示筆數"
        />
      </TableContainer>
    </div>
  );
};

export default Customers;