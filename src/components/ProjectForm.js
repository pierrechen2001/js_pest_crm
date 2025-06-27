import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Checkbox,
  Box,
  Paper,
  Autocomplete,
  Chip,
  InputAdornment,
  IconButton,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddressSelector from './AddressSelector';
import { supabase } from '../lib/supabaseClient';
import { geocodeAddress, combineAddress } from '../lib/geocoding';
import { CONSTRUCTION_ITEM_OPTIONS } from '../utils/constants';
import { formatPhoneNumber } from '../utils/phoneFormatter';

const ProjectForm = ({
  open,
  onClose,
  onSave,
  customers = [],
  preSelectedCustomer = null, // 預選客戶（CustomerDetailPage 使用）
  showCustomerSearch = true, // 是否顯示客戶搜尋（Orders 頁面使用）
  mode = 'create', // 'create' 或 'edit'
  projectToEdit = null // 編輯模式時的專案資料
}) => {
  // 初始化專案資料
  const getInitialProjectData = () => {
    if (mode === 'edit' && projectToEdit) {
      // 編輯模式：使用傳入的專案資料
      return {
        project_name: projectToEdit.project_name || "",
        customer_id: projectToEdit.customer_id || null,
        site_city: projectToEdit.site_city || "",
        site_district: projectToEdit.site_district || "",
        site_address: projectToEdit.site_address || "",
        construction_item: projectToEdit.construction_item || "",
        construction_items: projectToEdit.construction_item ? projectToEdit.construction_item.split(", ").filter(Boolean) : [],
        quote_date: projectToEdit.quote_date || "",
        expected_start_date: projectToEdit.expected_start_date || "",
        construction_days: projectToEdit.construction_days || "",
        construction_scope: projectToEdit.construction_scope || "",
        construction_notes: projectToEdit.project_notes || "",
        payment_method: projectToEdit.payment_method || "",
        payment_date: projectToEdit.payment_date || "",
        construction_status: projectToEdit.construction_status || "未開始",
        billing_status: projectToEdit.billing_status || "未請款",
        contacts: [
          { 
            role: projectToEdit.contact1_role || "", 
            name: projectToEdit.contact1_name || "", 
            contactType: projectToEdit.contact1_type || "", 
            contact: projectToEdit.contact1_contact || "" 
          },
          { 
            role: projectToEdit.contact2_role || "", 
            name: projectToEdit.contact2_name || "", 
            contactType: projectToEdit.contact2_type || "", 
            contact: projectToEdit.contact2_contact || "" 
          },
          { 
            role: projectToEdit.contact3_role || "", 
            name: projectToEdit.contact3_name || "", 
            contactType: projectToEdit.contact3_type || "", 
            contact: projectToEdit.contact3_contact || "" 
          },
        ],
        amount: projectToEdit.amount || "",
        fee: projectToEdit.fee || "",
        payer: projectToEdit.payer || "",
        payee: projectToEdit.payee || "",
        check_number: projectToEdit.check_number || "",
        bank_branch: projectToEdit.bank_branch || "",
        due_date: projectToEdit.due_date || ""
      };
    } else {
      // 創建模式：使用預設值
      return {
        project_name: "",
        customer_id: preSelectedCustomer?.customer_id || null,
        site_city: "",
        site_district: "",
        site_address: "",
        construction_item: "",
        construction_items: [],
        quote_date: "",
        expected_start_date: "",
        construction_days: "",
        construction_scope: "",
        construction_notes: "",
        payment_method: "",
        payment_date: "",
        construction_status: "未開始",
        billing_status: "未請款",
        contacts: [
          { role: "", name: "", contactType: "", contact: "" },
        ],
        amount: "",
        fee: "",
        payer: "",
        payee: "",
        check_number: "",
        bank_branch: "",
        due_date: ""
      };
    }
  };

  const [projectData, setProjectData] = useState(getInitialProjectData());
  const [selectedCustomer, setSelectedCustomer] = useState(preSelectedCustomer);
  const [useCustomerAddress, setUseCustomerAddress] = useState(false);
  const [useCustomerContacts, setUseCustomerContacts] = useState(false);
  const [isConstructionScopeExpanded, setIsConstructionScopeExpanded] = useState(false);

  // 客戶搜尋相關
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerFilters, setCustomerFilters] = useState([]);
  const customerFilterOptions = ["客戶名稱", "聯絡人姓名", "手機", "地址"];

  // 施工項目相關
  const [constructionItemOptions, setConstructionItemOptions] = useState(CONSTRUCTION_ITEM_OPTIONS);
  const [newConstructionItem, setNewConstructionItem] = useState("");
  const [constructionItemDialogOpen, setConstructionItemDialogOpen] = useState(false);

  // 初始化時設置資料
  useEffect(() => {
    if (open) {
      setProjectData(getInitialProjectData());
      if (mode === 'edit' && projectToEdit) {
        setSelectedCustomer(customers.find(c => c.customer_id === projectToEdit.customer_id) || null);
      } else {
        setSelectedCustomer(preSelectedCustomer);
      }
      setUseCustomerAddress(false);
      setUseCustomerContacts(false);
      setCustomerSearchQuery("");
      setCustomerFilters([]);
    }
  }, [open, preSelectedCustomer, projectToEdit, mode]);

  // 當選擇客戶改變時，自動填入聯絡人資訊
  useEffect(() => {
    if (selectedCustomer && useCustomerContacts) {
      const contacts = [];
      if (selectedCustomer.contact1_name) {
        contacts.push({
          role: selectedCustomer.contact1_role || "",
          name: selectedCustomer.contact1_name || "",
          contactType: selectedCustomer.contact1_type || "",
          contact: selectedCustomer.contact1_contact || ""
        });
      }
      if (selectedCustomer.contact2_name) {
        contacts.push({
          role: selectedCustomer.contact2_role || "",
          name: selectedCustomer.contact2_name || "",
          contactType: selectedCustomer.contact2_type || "",
          contact: selectedCustomer.contact2_contact || ""
        });
      }
      if (selectedCustomer.contact3_name) {
        contacts.push({
          role: selectedCustomer.contact3_role || "",
          name: selectedCustomer.contact3_name || "",
          contactType: selectedCustomer.contact3_type || "",
          contact: selectedCustomer.contact3_contact || ""
        });
      }
      setProjectData(prev => ({
        ...prev,
        contacts: contacts.length > 0 ? contacts : [{ role: "", name: "", contactType: "", contact: "" }]
      }));
    }
  }, [selectedCustomer, useCustomerContacts]);

  // 處理基本欄位變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理聯絡人更新
  const updateContact = (index, field, value) => {
    const updated = [...projectData.contacts];
    if (!updated[index]) {
      updated[index] = { role: "", name: "", contactType: "", contact: "" };
    }
    updated[index] = { ...updated[index], [field]: value };
    setProjectData({ ...projectData, contacts: updated });
  };

  // 處理電話號碼變更 - 使用共用電話格式化邏輯
  const handlePhoneChange = (value, contactIndex, field, contactType) => {
    const formattedValue = formatPhoneNumber(value, contactType);
    updateContact(contactIndex, field, formattedValue);
  };

  // 處理施工項目選擇
  const handleConstructionItemChange = (event, newValue) => {
    setProjectData(prev => ({
      ...prev,
      construction_items: newValue || [],
      construction_item: (newValue || []).join(", ")
    }));
  };

  // 新增自定義施工項目
  const handleAddConstructionItem = () => {
    if (newConstructionItem.trim() && !constructionItemOptions.includes(newConstructionItem.trim())) {
      const newItem = newConstructionItem.trim();
      setConstructionItemOptions(prev => [...prev, newItem]);
      setProjectData(prev => ({
        ...prev,
        construction_items: [...(prev.construction_items || []), newItem],
        construction_item: [...(prev.construction_items || []), newItem].join(", ")
      }));
      setNewConstructionItem("");
      setConstructionItemDialogOpen(false);
    }
  };

  // 刪除施工項目
  const handleRemoveConstructionItem = (itemToRemove) => {
    setProjectData(prev => {
      const updatedItems = prev.construction_items.filter(item => item !== itemToRemove);
      return {
        ...prev,
        construction_items: updatedItems,
        construction_item: updatedItems.join(", ")
      };
    });
  };

  // 處理儲存
  const handleSaveProject = async () => {
    try {
      // 日期欄位處理：空字串轉 null
      const safeDate = (d) => d && d.length >= 10 ? d : null;
      // 數字欄位處理：空字串轉 0（收款相關欄位）或 null（其他欄位）
      const safeInt = (n) => n === "" || n === undefined ? null : parseInt(n, 10);
      const safeFloat = (n) => n === "" || n === undefined ? 0 : parseFloat(n);
      const safeFloatOrNull = (n) => n === "" || n === undefined ? null : parseFloat(n);
      // 字串欄位處理：空字串轉 null（特定欄位）
      const safeString = (s) => s === "" || s === undefined ? null : s;

      // 1. 組合完整地址並進行 geocoding
      const fullAddress = combineAddress(projectData.site_city, projectData.site_district, projectData.site_address);
      const coords = await geocodeAddress(fullAddress);
      const latitude = coords?.latitude || null;
      const longitude = coords?.longitude || null;

      // 準備資料
      const projectUpdateData = {
        project_name: projectData.project_name,
        customer_id: projectData.customer_id,
        site_city: projectData.site_city,
        site_district: projectData.site_district,
        site_address: projectData.site_address,
        construction_item: projectData.construction_item,
        quote_date: safeDate(projectData.quote_date),
        expected_start_date: safeDate(projectData.expected_start_date),
        construction_days: safeInt(projectData.construction_days),
        construction_scope: projectData.construction_scope,
        project_notes: projectData.construction_notes,
        payment_method: projectData.payment_method,
        payment_date: safeDate(projectData.payment_date),
        amount: safeFloat(projectData.amount),
        fee: safeFloat(projectData.fee),
        payer: safeString(projectData.payer),
        payee: safeString(projectData.payee),
        check_number: safeString(projectData.check_number),
        bank_branch: safeString(projectData.bank_branch),
        due_date: safeDate(projectData.due_date),
        construction_status: projectData.construction_status,
        billing_status: projectData.billing_status,
        contact1_role: projectData.contacts[0]?.role || "",
        contact1_name: projectData.contacts[0]?.name || "",
        contact1_type: projectData.contacts[0]?.contactType || "",
        contact1_contact: projectData.contacts[0]?.contact || "",
        contact2_role: projectData.contacts[1]?.role || "",
        contact2_name: projectData.contacts[1]?.name || "",
        contact2_type: projectData.contacts[1]?.contactType || "",
        contact2_contact: projectData.contacts[1]?.contact || "",
        contact3_role: projectData.contacts[2]?.role || "",
        contact3_name: projectData.contacts[2]?.name || "",
        contact3_type: projectData.contacts[2]?.contactType || "",
        contact3_contact: projectData.contacts[2]?.contact || "",
        latitude: latitude,
        longitude: longitude
      };

      let data, error;

      if (mode === 'edit' && projectToEdit) {
        // 編輯模式：更新現有專案
        const { data: updateData, error: updateError } = await supabase
          .from('project')
          .update(projectUpdateData)
          .eq('project_id', projectToEdit.project_id)
          .select();
        
        data = updateData;
        error = updateError;
      } else {
        // 創建模式：插入新專案
        const { data: insertData, error: insertError } = await supabase
          .from('project')
          .insert([projectUpdateData])
          .select();
        
        data = insertData;
        error = insertError;
      }

      if (error) {
        alert("儲存失敗：" + error.message);
        console.error('Error saving project:', error);
        return;
      }

      // 呼叫父組件的保存處理函數
      if (onSave) {
        onSave(data[0]);
      }

      onClose();
      alert(`專案已成功${mode === 'edit' ? '更新' : '儲存'}！`);
    } catch (error) {
      alert("儲存失敗，請稍後再試！");
      console.error('Error saving project:', error);
    }
  };

  // 篩選客戶列表
  const getFilteredCustomers = () => {
    return [...(customers || [])].filter((customer) => {
      if (customerSearchQuery.trim() !== "") {
        const searchLower = customerSearchQuery.toLowerCase();

        if (customerFilters.length === 0) {
          return (
            customer.customer_name?.toLowerCase().includes(searchLower) ||
            `${customer.contact1_name || ""}${customer.contact2_name || ""}${customer.contact3_name || ""}`
              .toLowerCase()
              .includes(searchLower) ||
            `${customer.contact1_contact || ""}${customer.contact2_contact || ""}${customer.contact3_contact || ""}`
              .toLowerCase()
              .includes(searchLower) ||
            `${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`
              .toLowerCase()
              .includes(searchLower)
          );
        }

        const matchesAnyField = customerFilters.some((filter) => {
          switch (filter) {
            case "客戶名稱":
              return customer.customer_name?.toLowerCase().includes(searchLower);
            case "聯絡人姓名":
              return `${customer.contact1_name || ""}${customer.contact2_name || ""}${customer.contact3_name || ""}`
                .toLowerCase()
                .includes(searchLower);
            case "手機":
              return `${customer.contact1_contact || ""}${customer.contact2_contact || ""}${customer.contact3_contact || ""}`
                .toLowerCase()
                .includes(searchLower);
            case "地址":
              return `${customer.contact_city || ""}${customer.contact_district || ""}${customer.contact_address || ""}`
                .toLowerCase()
                .includes(searchLower);
            default:
              return false;
          }
        });

        if (!matchesAnyField) return false;
      }

      return true;
    }).sort((a, b) => 
      new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{mode === 'edit' ? '編輯專案' : '新增專案'}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>基本資訊</Typography>
          
          {/* 客戶搜尋與選擇 - 只在 Orders 頁面顯示 */}
          {showCustomerSearch && (
            <>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: 20 }}>
                <TextField
                  label="搜尋客戶"
                  fullWidth
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                />
                <FormControl style={{ minWidth: 200 }}>
                  <InputLabel>篩選條件</InputLabel>
                  <Select
                    multiple
                    value={customerFilters}
                    onChange={(e) => setCustomerFilters(e.target.value)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {customerFilterOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={customerFilters.indexOf(option) > -1} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* 客戶選擇列表 */}
              <div style={{ marginBottom: 20 }}>
                <Typography variant="subtitle1" gutterBottom>
                  選擇客戶 {selectedCustomer && `(已選擇: ${selectedCustomer.customer_name})`}
                </Typography>
                
                {selectedCustomer ? (
                  <Paper 
                    elevation={1} 
                    style={{ 
                      border: '2px solid #1976d2',
                      borderRadius: 4
                    }}
                  >
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#e3f2fd'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {selectedCustomer.customer_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                            聯絡人: {[selectedCustomer.contact1_name, selectedCustomer.contact2_name, selectedCustomer.contact3_name]
                              .filter(Boolean).join(', ') || '無'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                            手機: {[selectedCustomer.contact1_contact, selectedCustomer.contact2_contact, selectedCustomer.contact3_contact]
                              .filter(Boolean).join(', ') || '無'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            地址: {`${selectedCustomer.contact_city || ''}${selectedCustomer.contact_district || ''}${selectedCustomer.contact_address || ''}` || '無'}
                          </Typography>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ 
                            backgroundColor: '#1976d2', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: 24, 
                            height: 24, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '14px'
                          }}>
                            ✓
                          </div>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedCustomer(null);
                              setProjectData(prev => ({
                                ...prev,
                                customer_id: null,
                              }));
                              setUseCustomerAddress(false);
                              setUseCustomerContacts(false);
                            }}
                            style={{ minWidth: 'auto', padding: '4px 8px' }}
                          >
                            重選
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Paper>
                ) : (
                  <Paper 
                    elevation={1} 
                    style={{ 
                      maxHeight: 200, 
                      overflow: 'auto', 
                      border: '1px solid #e0e0e0',
                      borderRadius: 4
                    }}
                  >
                    {(() => {
                      const filteredCustomers = getFilteredCustomers();

                      if (filteredCustomers.length === 0) {
                        return (
                          <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                            {customerSearchQuery.trim() !== "" || customerFilters.length > 0 
                              ? "沒有符合篩選條件的客戶" 
                              : "請輸入搜尋條件或選擇篩選條件"}
                          </div>
                        );
                      }

                      return filteredCustomers.map((customer) => (
                        <div
                          key={customer.customer_id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setProjectData(prev => ({
                              ...prev,
                              customer_id: customer.customer_id,
                            }));
                            setUseCustomerAddress(false);
                            setUseCustomerContacts(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f0f0f0',
                            cursor: 'pointer',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                {customer.customer_name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                                聯絡人: {[customer.contact1_name, customer.contact2_name, customer.contact3_name]
                                  .filter(Boolean).join(', ') || '無'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                                手機: {[customer.contact1_contact, customer.contact2_contact, customer.contact3_contact]
                                  .filter(Boolean).join(', ') || '無'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                地址: {`${customer.contact_city || ''}${customer.contact_district || ''}${customer.contact_address || ''}` || '無'}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </Paper>
                )}
              </div>
            </>
          )}

          <TextField
            name="project_name"
            label="專案名稱"
            fullWidth
            margin="normal"
            value={projectData.project_name}
            onChange={handleChange}
            required
          />
          
          <Typography variant="h6" gutterBottom>聯絡人資訊</Typography>
          {selectedCustomer && (
            <FormControl component="fieldset" sx={{ mb: 1 }}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  checked={useCustomerContacts}
                  onChange={(e) => {
                    setUseCustomerContacts(e.target.checked);
                    if (!e.target.checked) {
                      setProjectData(prev => ({
                        ...prev,
                        contacts: [{ role: "", name: "", contactType: "", contact: "" }]
                      }));
                    }
                  }}
                />
                <Typography>聯絡資訊同客戶資料</Typography>
              </Box>
            </FormControl>
          )}

          {projectData.contacts.map((contact, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px"}}>
              <TextField
                label="職位"
                fullWidth
                value={contact.role || ""}
                onChange={(e) => updateContact(index, "role", e.target.value)}
              />
              <TextField
                label="名字"
                fullWidth
                value={contact.name || ""}
                onChange={(e) => updateContact(index, "name", e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>聯絡方式類型</InputLabel>
                <Select
                  value={contact.contactType || ""}
                  onChange={(e) => updateContact(index, "contactType", e.target.value)}
                >
                  {["手機", "市話", "LineID", "信箱"].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={contact.contactType || "聯絡方式"}
                fullWidth
                value={contact.contact || ""}
                onChange={(e) => {
                  const contactType = contact.contactType;
                  if (contactType === "市話" || contactType === "手機") {
                    // 使用 handlePhoneChange 處理市話和手機格式化，傳入聯絡方式類型
                    handlePhoneChange(e.target.value, index, "contact", contactType);
                  } else {
                    // 其他類型（LineID、信箱）直接儲存
                    updateContact(index, "contact", e.target.value);
                  }
                }}
              />
              {index > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    const updatedContacts = projectData.contacts.filter((_, i) => i !== index);
                    setProjectData({ ...projectData, contacts: updatedContacts });
                  }}
                >
                  刪除
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outlined"
            onClick={() => {
              const updatedContacts = [
                ...projectData.contacts,
                { role: "", name: "", contactType: "", contact: "" }
              ];
              setProjectData({ ...projectData, contacts: updatedContacts });
            }}
            disabled={projectData.contacts.length >= 3}
          >
            新增聯絡人
          </Button>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>施工資訊</Typography>
          {selectedCustomer && (
            <FormControl component="fieldset" style={{ marginTop: 0, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={useCustomerAddress}
                  onChange={(e) => {
                    setUseCustomerAddress(e.target.checked);
                    if (e.target.checked && selectedCustomer) {
                      setProjectData(prev => ({
                        ...prev,
                        site_city: selectedCustomer.contact_city || "",
                        site_district: selectedCustomer.contact_district || "",
                        site_address: selectedCustomer.contact_address || ""
                      }));
                    } else {
                      setProjectData(prev => ({
                        ...prev,
                        site_city: "",
                        site_district: "",
                        site_address: ""
                      }));
                    }
                  }}
                />
                <Typography>地址同客戶資料</Typography>
              </div>
            </FormControl>
          )}

          <div style={{ marginBottom: "10px" }}>
            <AddressSelector
              city={projectData.site_city || ""}
              district={projectData.site_district || ""}
              address={projectData.site_address || ""}
              onCityChange={(newCity) => {
                setProjectData(prev => ({
                  ...prev,
                  site_city: newCity,
                  site_district: "" // 清空區域當城市改變時
                }));
              }}
              onDistrictChange={(newDistrict) => {
                setProjectData(prev => ({
                  ...prev,
                  site_district: newDistrict
                }));
              }}
              onAddressChange={(newAddress) => {
                setProjectData(prev => ({
                  ...prev,
                  site_address: newAddress
                }));
              }}
              cityLabel="施工縣市"
              districtLabel="施工區域"
              addressLabel="施工地址"
            />
          </div>
      
          {/* 第一行：估價日期、預計進場日期 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              name="quote_date"
              label="估價日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.quote_date || ""}
              onChange={handleChange}
            />
            <TextField
              name="expected_start_date"
              label="預計進場日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.expected_start_date || ""}
              onChange={handleChange}
            />
          </div>

          {/* 第二行：施工天數、施工項目 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <TextField
                name="construction_days"
                label="施工天數"
                type="number"
                fullWidth
                value={projectData.construction_days || ""}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Box>
                <Autocomplete
                  multiple
                  options={constructionItemOptions}
                  value={projectData.construction_items || []}
                  onChange={handleConstructionItemChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option}
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        onDelete={() => handleRemoveConstructionItem(option)}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="施工項目"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setConstructionItemDialogOpen(true)}
                                size="small"
                              >
                                <AddIcon />
                              </IconButton>
                            </InputAdornment>
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </div>
          </div>



          <Box sx={{ position: 'relative' }}>
            <TextField
              name="construction_scope"
              label="施工範圍"
              fullWidth
              margin="normal"
              multiline
              rows={isConstructionScopeExpanded ? 8 : 2}
              value={projectData.construction_scope || ""}
              onChange={handleChange}
              InputProps={{
                style: { 
                  resize: 'none',
                  overflow: isConstructionScopeExpanded ? 'auto' : 'hidden'
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  maxHeight: isConstructionScopeExpanded ? 'none' : '80px'
                }
              }}
            />
            {projectData.construction_scope && projectData.construction_scope.length > 50 && (
              <Button
                size="small"
                onClick={() => setIsConstructionScopeExpanded(!isConstructionScopeExpanded)}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  minWidth: 'auto',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                {isConstructionScopeExpanded ? '收起' : '顯示更多'}
              </Button>
            )}
          </Box>
        
          <TextField
            name="construction_notes"
            label="注意事項"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={projectData.construction_notes || ""}
            onChange={handleChange}
          />

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>收款資訊</Typography>

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <FormControl fullWidth>
              <InputLabel>收款方式</InputLabel>
              <Select
                name="payment_method"
                value={projectData.payment_method || ""}
                onChange={handleChange}
              >
                <MenuItem value="現金">現金</MenuItem>
                <MenuItem value="匯款">匯款</MenuItem>
                <MenuItem value="支票">支票</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="payment_date"
              label="結清日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.payment_date || ""}
              onChange={handleChange}
            />
          </div>

          <TextField
            name="amount"
            label="收款金額"
            type="number"
            fullWidth
            margin="normal"
            value={projectData.amount || ""}
            onChange={handleChange}
          />

          {projectData.payment_method === '匯款' && (
            <TextField
              name="fee"
              label="手續費"
              type="number"
              fullWidth
              margin="normal"
              value={projectData.fee || ""}
              onChange={handleChange}
            />
          )}

          {projectData.payment_method === '支票' && (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <TextField
                  name="payer"
                  label="付款人"
                  fullWidth
                  value={projectData.payer || ""}
                  onChange={handleChange}
                />
                <FormControl fullWidth>
                  <InputLabel>收款人</InputLabel>
                  <Select
                    name="payee"
                    value={projectData.payee || ""}
                    onChange={handleChange}
                  >
                    <MenuItem value="中星">中星</MenuItem>
                    <MenuItem value="建興">建興</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <TextField
                  name="check_number"
                  label="支票號碼"
                  fullWidth
                  value={projectData.check_number || ""}
                  onChange={handleChange}
                />
                <TextField
                  name="bank_branch"
                  label="銀行分行"
                  fullWidth
                  value={projectData.bank_branch || ""}
                  onChange={handleChange}
                />
                <TextField
                  name="due_date"
                  label="到期日"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={projectData.due_date || ""}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveProject}
            disabled={!projectData.project_name || !projectData.customer_id}
          >
            儲存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增施工項目對話框 */}
      <Dialog
        open={constructionItemDialogOpen}
        onClose={() => setConstructionItemDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>新增施工項目</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="施工項目名稱"
            fullWidth
            variant="outlined"
            value={newConstructionItem}
            onChange={(e) => setNewConstructionItem(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConstructionItemDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleAddConstructionItem}
            variant="contained"
            disabled={!newConstructionItem.trim() || constructionItemOptions.includes(newConstructionItem.trim())}
          >
            新增
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectForm;
