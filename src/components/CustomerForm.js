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
  MenuItem
} from '@mui/material';
import AddressSelector from './AddressSelector';
import { CUSTOMER_TYPES, CONTACT_TYPES, getCustomerTypeLabel } from '../utils/constants';
import { handleCustomerPhoneChange, formatPhoneNumber } from '../utils/phoneFormatter';

const CustomerForm = ({
  open,
  onClose,
  onSave,
  initialData = null,
  mode = 'create', // 'create' 或 'edit'
  customerType = null,
  showCustomerTypeStep = false
}) => {
  const [step, setStep] = useState(showCustomerTypeStep ? 1 : 2);
  const [selectedCustomerType, setSelectedCustomerType] = useState(customerType || '');
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    contact_city: '',
    contact_district: '',
    contact_address: '',
    tax_id: '',
    invoice_title: '',
    company_phone: '',
    fax: '',
    email: '',
    contact1_role: '',
    contact1_name: '',
    contact1_type: '',
    contact1_contact: '',
    contact2_role: '',
    contact2_name: '',
    contact2_type: '',
    contact2_contact: '',
    contact3_role: '',
    contact3_name: '',
    contact3_type: '',
    contact3_contact: '',
    notes: ''
  });

  // 初始化資料
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setCustomerData(initialData);
      // 在編輯模式下，從 initialData 中設置客戶類型
      if (initialData.customer_type) {
        setSelectedCustomerType(initialData.customer_type);
      }
    } else if (mode === 'create') {
      // 重置為空白資料
      setCustomerData({
        customer_name: '',
        contact_city: '',
        contact_district: '',
        contact_address: '',
        tax_id: '',
        invoice_title: '',
        company_phone: '',
        fax: '',
        email: '',
        contact1_role: '',
        contact1_name: '',
        contact1_type: '',
        contact1_contact: '',
        contact2_role: '',
        contact2_name: '',
        contact2_type: '',
        contact2_contact: '',
        contact3_role: '',
        contact3_name: '',
        contact3_type: '',
        contact3_contact: '',
        notes: ''
      });
    }
    if (customerType) {
      setSelectedCustomerType(customerType);
    }
  }, [mode, initialData, customerType, open]);

  // 處理基本欄位變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理聯絡人變更
  const handleContactChange = (contactIndex, field, value) => {
    const fieldName = `contact${contactIndex}_${field}`;
    setCustomerData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 處理電話號碼變更
  const handlePhoneChange = (value, field, contactType = null) => {
    const formattedValue = formatPhoneNumber(value, contactType);
    setCustomerData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // 處理下一步
  const handleNextStep = () => {
    setStep(2);
  };

  // 表單驗證函數
  const validateForm = () => {
    const errors = [];

    // 必填欄位驗證
    if (!customerData.customer_name?.trim()) {
      errors.push('客戶名稱為必填欄位');
    }

    if (!selectedCustomerType) {
      errors.push('請選擇客戶類型');
    }

    // 地址驗證
    if (!customerData.contact_city?.trim()) {
      errors.push('請選擇城市');
    }
    if (!customerData.contact_district?.trim()) {
      errors.push('請選擇區域');
    }
    if (!customerData.contact_address?.trim()) {
      errors.push('請填寫詳細地址');
    }

    // 公司相關欄位驗證（非一般住家）
    if (shouldShowCompanyFields()) {
      if (customerData.tax_id?.trim()) {
        // 統一編號格式驗證（8位數字）
        if (!/^\d{8}$/.test(customerData.tax_id.trim())) {
          errors.push('統一編號格式錯誤（應為8位數字）');
        }
      }
    }

    // 電話號碼格式驗證已移除 - 允許任何格式

    // 信箱格式驗證
    if (customerData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email.trim())) {
        errors.push('信箱格式錯誤');
      }
    }

    // 聯絡人資訊驗證
    [1, 2, 3].forEach(i => {
      const role = customerData[`contact${i}_role`]?.trim();
      const name = customerData[`contact${i}_name`]?.trim();
      const type = customerData[`contact${i}_type`];
      const contact = customerData[`contact${i}_contact`]?.trim();

      // 如果有填寫任一聯絡人欄位，則其他欄位也需要填寫
      if (role || name || type || contact) {
        if (!name) {
          errors.push(`聯絡人${i}姓名為必填`);
        }
        if (!type) {
          errors.push(`聯絡人${i}聯絡方式類型為必填`);
        }
        if (!contact) {
          errors.push(`聯絡人${i}聯絡方式為必填`);
        } else {
          // 聯絡方式格式驗證已移除 - 允許任何格式（除了信箱）
          if (type === '信箱') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contact)) {
              errors.push(`聯絡人${i}的信箱格式錯誤`);
            }
          }
        }
      }
    });

    return errors;
  };

  // 處理儲存
  const handleSave = () => {
    // 驗證表單
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      // 顯示驗證錯誤
      const errorMessage = '請修正以下問題：\n\n' + validationErrors.map((error, index) => `${index + 1}. ${error}`).join('\n');
      alert(errorMessage);
      return;
    }

    // 如果驗證通過，準備儲存資料
    const dataToSave = {
      ...customerData,
      customerType: selectedCustomerType
    };
    
    // 呼叫父組件的儲存函數
    try {
      onSave(dataToSave);
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗，請稍後再試或聯絡系統管理員');
    }
  };

  // 處理關閉
  const handleClose = () => {
    setStep(showCustomerTypeStep ? 1 : 2);
    setSelectedCustomerType(customerType || '');
    onClose();
  };

  const getPhoneLabel = () => {
    return selectedCustomerType === "一般住家" ? "市話" : "公司市話";
  };

  // 是否顯示公司相關欄位
  const shouldShowCompanyFields = () => {
    return selectedCustomerType !== "一般住家";
  };

  // 取得地址標籤
  const getAddressLabel = () => {
    switch (selectedCustomerType) {
      case "一般住家":
        return "住址";
      case "建築師":
        return "事務所地址";
      case "古蹟、政府機關":
        return "專案地址";
      case "營造、設計公司":
        return "公司地址";
      default:
        return "地址";
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === 'create' ? '新增客戶' : '編輯客戶資料'}
      </DialogTitle>
      <DialogContent>
        {/* 步驟1：選擇客戶類型 */}
        {step === 1 && (
          <FormControl fullWidth>
            <InputLabel>選擇客戶類型</InputLabel>
            <Select 
              value={selectedCustomerType} 
              onChange={(e) => setSelectedCustomerType(e.target.value)}
            >
              {CUSTOMER_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* 步驟2：填寫客戶資料 */}
        {step === 2 && (
          <div>
            {/* 客戶基本資訊 */}
            <Typography variant="h6" gutterBottom>客戶基本資訊</Typography>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <TextField
                label="客戶名稱"
                fullWidth
                name="customer_name"
                value={customerData.customer_name || ""}
                onChange={handleChange}
              />
            </div>

            {/* 地址選擇器 */}
            <div style={{ marginBottom: "20px" }}>
              <Typography variant="subtitle1" gutterBottom>
                {getAddressLabel()}
              </Typography>
              <AddressSelector
                city={customerData.contact_city || ""}
                district={customerData.contact_district || ""}
                address={customerData.contact_address || ""}
                onCityChange={(newCity) => {
                  setCustomerData(prev => ({
                    ...prev,
                    contact_city: newCity,
                    contact_district: "" // 清空區域當城市改變時
                  }));
                }}
                onDistrictChange={(newDistrict) => {
                  setCustomerData(prev => ({
                    ...prev,
                    contact_district: newDistrict
                  }));
                }}
                onAddressChange={(newAddress) => {
                  setCustomerData(prev => ({
                    ...prev,
                    contact_address: newAddress
                  }));
                }}
                prefix="contact"
                cityLabel="縣市"
                districtLabel="區域"
                addressLabel="詳細地址"
              />
            </div>

            {/* 統編與抬頭（僅非一般住家顯示） */}
            {shouldShowCompanyFields() && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField
                  label="統一編號"
                  fullWidth
                  name="tax_id"
                  value={customerData.tax_id || ""}
                  onChange={handleChange}
                />
                <TextField
                  label="抬頭"
                  fullWidth
                  name="invoice_title"
                  value={customerData.invoice_title || ""}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* 聯絡資訊 */}
            <Typography variant="h6" gutterBottom>聯絡資訊</Typography>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
              <TextField
                label={getPhoneLabel()}
                fullWidth
                value={customerData.company_phone || ""}
                onChange={(e) => handlePhoneChange(e.target.value, 'company_phone')}
              />
              {/* 非一般住家才顯示傳真與公司信箱 */}
              {shouldShowCompanyFields() && (
                <>
                  <TextField
                    label="傳真號碼"
                    fullWidth
                    value={customerData.fax || ""}
                    onChange={(e) => handlePhoneChange(e.target.value, 'fax')}
                  />
                </>
              )}
            </div>
            
            {/* 信箱（一般住家顯示個人信箱，其他顯示公司信箱） */}
            <div style={{ marginBottom: "20px" }}>
              <TextField
                label={selectedCustomerType === "一般住家" ? "信箱" : "公司信箱"}
                fullWidth
                name="email"
                value={customerData.email || ""}
                onChange={handleChange}
              />
            </div>

            {/* 聯絡人資訊 */}
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <TextField
                  label={`聯絡人${i}職位`}
                  fullWidth
                  margin="dense"
                  value={customerData[`contact${i}_role`] || ""}
                  onChange={(e) => handleContactChange(i, 'role', e.target.value)}
                />
                <TextField
                  label={`聯絡人${i}姓名`}
                  fullWidth
                  margin="dense"
                  value={customerData[`contact${i}_name`] || ""}
                  onChange={(e) => handleContactChange(i, 'name', e.target.value)}
                />
                <FormControl fullWidth>
                  <InputLabel>聯絡方式類型</InputLabel>
                  <Select
                    value={customerData[`contact${i}_type`] || ""}
                    onChange={(e) => {
                      handleContactChange(i, 'type', e.target.value);
                      handleContactChange(i, 'contact', ''); // 清空聯絡方式
                    }}
                    label="聯絡方式類型"
                  >
                    {CONTACT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label={`聯絡人${i}聯絡方式`}
                  fullWidth
                  margin="dense"
                  value={customerData[`contact${i}_contact`] || ""}
                  onChange={(e) => {
                    const contactType = customerData[`contact${i}_type`];
                    if (contactType === "市話" || contactType === "手機") {
                      // 使用 handlePhoneChange 處理市話和手機格式化，傳入聯絡方式類型
                      handlePhoneChange(e.target.value, `contact${i}_contact`, contactType);
                    } else {
                      // 其他類型（LineID、信箱）直接儲存
                      handleContactChange(i, 'contact', e.target.value);
                    }
                  }}
                />
              </div>
            ))}

            {/* 注意事項 */}
            <TextField
              label="注意事項"
              name="notes"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={customerData.notes || ""}
              onChange={handleChange}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        {step === 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNextStep} 
            disabled={!selectedCustomerType}
          >
            下一步
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={!customerData.customer_name}
          >
            儲存
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomerForm;
