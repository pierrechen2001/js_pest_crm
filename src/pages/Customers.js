import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Autocomplete, Checkbox, ListItemText, CircularProgress, Typography, TablePagination } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { Add } from "@mui/icons-material";
import AddressSelector from '../components/AddressSelector';

const customerTypes = ["古蹟、政府機關", "一般住家", "建築師", "營造、設計公司"];
const filterOptions = ["客戶名稱", "聯絡人姓名", "聯絡電話", "地址"];

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
  const [step, setStep] = useState(1);  // Make sure step is properly initialized
  const [newCustomerType, setNewCustomerType] = useState("");
  const initialCustomerData = {
    customerTypes: "",
    customer_name: null,
    contact_city: "",
    contact_district: "",
    contact_address: "",
    email: "",
    taxid: "",
    start_date: "",
    end_date: "",
    invoice_title: "",
    notes: "",
    company_phone: "",
    fax: "",
    contacts: [
      { role: "", name: "", contactType: "", contact: "" },
    ],
  };
  
  const [customerData, setCustomerData] = useState(initialCustomerData);  
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // When initialCustomers changes, update customersState
  useEffect(() => {
    setCustomers(customers);
  }, [customers, setCustomers]);

  // 處理 Dialog 開關
  const handleOpen = () => {
    setStep(1);
    setNewCustomerType("");
    setCustomerData(initialCustomerData);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleNextStep = () => setStep(2);  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  // AddressSelector 回調函數
  const handleAddressChange = (addressData) => {
    setCustomerData(prev => ({
      ...prev,
      city: addressData.city,
      district: addressData.district,
      road: addressData.address
    }));
  };

  // 新增客戶
  const handleSaveCustomer = async () => {
    try {
      await addCustomer({
        customer_type: newCustomerType,
        customer_name: customerData.name,
        contact_city: customerData.city,
        contact_district: customerData.district,
        contact_address: customerData.road,
        email: customerData.email,
        tax_id: customerData.taxid,
        invoice_title: customerData.Title,
        notes: customerData.notes,
        company_phone: customerData.company_phone,
        fax: customerData.fax,
        contact1_role: customerData.contacts[0]?.role || "",
        contact1_name: customerData.contacts[0]?.name || "",
        contact1_type: customerData.contacts[0]?.contactType || "",
        contact1_contact: customerData.contacts[0]?.contact || "",
        contact2_role: customerData.contacts[1]?.role || "",
        contact2_name: customerData.contacts[1]?.name || "",
        contact2_type: customerData.contacts[1]?.contactType || "",
        contact2_contact: customerData.contacts[1]?.contact || "",
        contact3_role: customerData.contacts[2]?.role || "",
        contact3_name: customerData.contacts[2]?.name || "",
        contact3_type: customerData.contacts[2]?.contactType || "",
        contact3_contact: customerData.contacts[2]?.contact || "",
      });
      handleClose();
      // 新增成功後重置表單
      setNewCustomerType("");
      setCustomerData(initialCustomerData);
      setStep(1);
    } catch (error) {
      console.error('Error saving customer:', error);
      // 可以在此處添加錯誤提示
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
          case "聯絡電話":
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
          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>新增客戶</DialogTitle>
            <DialogContent>
              {step === 1 && (
                <FormControl fullWidth>
                  <InputLabel>選擇客戶類型</InputLabel>
                  <Select value={newCustomerType} onChange={(e) => setNewCustomerType(e.target.value)}>
                    {customerTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {step === 2 && (
            <div>
              {/* 客戶資訊 */}
              <Typography variant="h6" gutterBottom>客戶基本資訊</Typography>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField 
                    label="客戶名稱" 
                    fullWidth 
                    name="name" 
                    value={customerData.name || ""} 
                    onChange={handleChange} 
                  />                  </div>
              <div style={{ marginBottom: "20px" }}>
                <AddressSelector
                  city={customerData.city || ""}
                  district={customerData.district || ""}
                  address={customerData.road || ""}
                  onAddressChange={handleAddressChange}
                  cityLabel={
                    newCustomerType === "一般住家" ? "住址" :
                    newCustomerType === "建築師" ? "事務所地址" :
                    newCustomerType === "古蹟、政府機關" ? "專案地址" :
                    "公司地址"
                  }
                  districtLabel="區域"
                  addressLabel="路名/詳細地址"
                />
              </div>

              {/* 統編與抬頭（僅非一般住家顯示） */}
              {newCustomerType !== "一般住家" && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <TextField 
                    label="統一編號" 
                    fullWidth 
                    name="TaxID" 
                    value={customerData.TaxID || ""} 
                    onChange={handleChange} 
                  />
                  <TextField 
                    label="抬頭" 
                    fullWidth 
                    name="Title" 
                    value={customerData.Title || ""} 
                    onChange={handleChange} 
                  />
                </div>
              )}

              {/* 聯絡資訊 */}
              <Typography variant="h6" gutterBottom>聯絡資訊</Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                {/* 公司電話/市話、傳真、信箱（僅非一般住家顯示） */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <TextField
                    label={newCustomerType === "一般住家" ? "市話" : "公司電話（市話）"}
                    fullWidth
                    value={customerData.company_phone || ""}
                    onChange={(e) => {
                      let formattedValue = e.target.value.replace(/[^\d]/g, "");
                      if (formattedValue.length === 10 && formattedValue.startsWith("0")) {
                        // 市話格式 (02)1234-5678
                        formattedValue = formattedValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                      }
                      setCustomerData({ ...customerData, company_phone: formattedValue });
                    }}
                  />
                  {/* 非一般住家才顯示傳真與公司信箱 */}
                  {newCustomerType !== "一般住家" && (
                    <>
                      <TextField
                        label="傳真號碼"
                        fullWidth
                        value={customerData.fax || ""}
                        onChange={(e) => {
                          let formattedValue = e.target.value.replace(/[^\d]/g, "");
                          if (formattedValue.length === 10 && formattedValue.startsWith("0")) {
                            formattedValue = formattedValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                          }
                          setCustomerData({ ...customerData, fax: formattedValue });
                        }}
                      />
                      <TextField
                        label="公司信箱"
                        fullWidth
                        value={customerData.email || ""}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      />
                    </>
                  )}
                </div>

                {/* 預設聯絡人 1 */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <TextField
                    label="職位"
                    fullWidth
                    value={customerData.contacts[0]?.role || ""}
                    onChange={(e) => {
                      const updatedContacts = [...customerData.contacts];
                      updatedContacts[0].role = e.target.value;
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                  />
                  <TextField
                    label="名字"
                    fullWidth
                    value={customerData.contacts[0]?.name || ""}
                    onChange={(e) => {
                      const updatedContacts = [...customerData.contacts];
                      updatedContacts[0].name = e.target.value;
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>聯絡方式類型</InputLabel>
                    <Select
                      value={customerData.contacts[0]?.contactType || ""}
                      onChange={(e) => {
                        const updatedContacts = [...customerData.contacts];
                        updatedContacts[0] = { ...updatedContacts[0], contactType: e.target.value, contact: "" };
                        setCustomerData({ ...customerData, contacts: updatedContacts });
                      }}
                    >
                      {["LineID", "市話", "手機", "信箱"].map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label={customerData.contacts[0]?.contactType || "聯絡方式"}
                    fullWidth
                    value={customerData.contacts[0]?.contact || ""}
                    onChange={(e) => {
                      let formattedValue = e.target.value;
                      const contactType = customerData.contacts[0]?.contactType;
                      if (contactType === "市話") {
                        formattedValue = formattedValue.replace(/[^\d]/g, "").replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                      } else if (contactType === "手機") {
                        formattedValue = formattedValue.replace(/[^\d]/g, "").replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                      }
                      const updatedContacts = [...customerData.contacts];
                      updatedContacts[0].contact = formattedValue;
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                  />
                </div>

                {/* 其他聯絡人 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                  {customerData.contacts?.map((contact, index) => {
                    if (index === 0) return null;
                    return (
                      <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <TextField
                          label="職位"
                          fullWidth
                          value={contact.role || ""}
                          onChange={(e) => {
                            const updatedContacts = [...customerData.contacts];
                            updatedContacts[index].role = e.target.value;
                            setCustomerData({ ...customerData, contacts: updatedContacts });
                          }}
                        />
                        <TextField
                          label="名字"
                          fullWidth
                          value={contact.name || ""}
                          onChange={(e) => {
                            const updatedContacts = [...customerData.contacts];
                            updatedContacts[index].name = e.target.value;
                            setCustomerData({ ...customerData, contacts: updatedContacts });
                          }}
                        />
                        <FormControl fullWidth>
                          <InputLabel>聯絡方式類型</InputLabel>
                          <Select
                            value={contact.contactType || ""}
                            onChange={(e) => {
                              const updatedContacts = [...customerData.contacts];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                contactType: e.target.value,
                                contact: "",
                              };
                              setCustomerData({ ...customerData, contacts: updatedContacts });
                            }}
                          >
                            {["LineID", "市話", "手機", "信箱"].map((type) => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label={contact.contactType || "聯絡方式"}
                          fullWidth
                          value={contact.contact || ""}
                          onChange={(e) => {
                            let formattedValue = e.target.value;
                            if (contact.contactType === "市話") {
                              formattedValue = formattedValue.replace(/[^\d]/g, "").replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
                            } else if (contact.contactType === "手機") {
                              formattedValue = formattedValue.replace(/[^\d]/g, "").replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
                            }
                            const updatedContacts = [...customerData.contacts];
                            updatedContacts[index].contact = formattedValue;
                            setCustomerData({ ...customerData, contacts: updatedContacts });
                          }}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            const updatedContacts = customerData.contacts.filter((_, i) => i !== index);
                            setCustomerData({ ...customerData, contacts: updatedContacts });
                          }}
                        >
                          刪除
                        </Button>
                      </div>
                    );
                  })}

                  <Button
                    variant="outlined"
                    onClick={() => {
                      const updatedContacts = [
                        ...(customerData.contacts || []),
                        { role: "", name: "", contactType: "", contact: "" },
                      ];
                      setCustomerData({ ...customerData, contacts: updatedContacts });
                    }}
                    disabled={(customerData.contacts || []).length >= 3}
                  >
                    新增聯絡人
                  </Button>
                </div>


                  <TextField
                    label="注意事項"
                    fullWidth
                    multiline
                    rows={2}
                    value={customerData.notes || ""}
                    onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                    style={{ marginBottom: "20px" }}
                  />
              </div>
            </div>
          )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>取消</Button>
              {step === 1 ? (
                <Button variant="contained" onClick={handleNextStep} disabled={!newCustomerType}>下一步</Button>
              ) : (
                <Button variant="contained" onClick={handleSaveCustomer} disabled={!customerData.name}>儲存</Button>
              )}
            </DialogActions>
          </Dialog>
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
              <TableCell style={{ width: "13%" }}>聯絡電話</TableCell>
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