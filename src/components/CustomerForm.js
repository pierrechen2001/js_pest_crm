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

  const customerTypes = ["古蹟、政府機關", "一般住家", "建築師", "營造、設計公司"];
  const contactTypes = ["LineID", "市話", "手機", "信箱"];

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

  // 處理電話號碼變更（支援分機號碼）
  const handlePhoneChange = (value, field) => {
    // 保留原始輸入中的#字符用於分機號碼
    const parts = value.split('#');
    const phoneNumber = parts[0];
    const extension = parts.length > 1 ? parts[1] : '';
    
    // 移除非數字字符（除了格式化符號）
    let cleanPhone = phoneNumber.replace(/[^\d]/g, "");
    let formattedValue = cleanPhone;
    
    // 台灣市話格式化規則（根據區碼對照表）
    if (cleanPhone.startsWith("0") && cleanPhone.length >= 2) {
      const getPhoneFormat = (phone) => {
        // 根據區碼判斷格式
        if (phone.startsWith("02")) {
          // 台北縣市: (02)2&3&5~8+7D → 總共10碼
          if (phone.length >= 3) {
            const thirdDigit = phone[2];
            if (['2', '3', '5', '6', '7', '8'].includes(thirdDigit)) {
              return { totalLength: 10, pattern: "($1)$2-$3", groups: [2, 4, 4] };
            }
          }
        } else if (phone.startsWith("03")) {
          if (phone.length >= 3) {
            const thirdDigit = phone[2];
            if (['2', '3', '4'].includes(thirdDigit)) {
              // 桃園縣: (03)2&3&4+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            } else if (['5', '6'].includes(thirdDigit)) {
              // 新竹縣市: (03)5&6+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            } else if (thirdDigit === '7') {
              // 苗栗縣: (037)+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [3, 3, 3] };
            } else if (thirdDigit === '9') {
              // 宜蘭縣: (03)9+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            } else if (thirdDigit === '8') {
              // 花蓮縣: (03)8+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            }
          }
        } else if (phone.startsWith("04")) {
          if (phone.length >= 3) {
            const thirdDigit = phone[2];
            if (['2', '3'].includes(thirdDigit)) {
              // 台中縣市: (04)2&3+7D → 總共10碼
              return { totalLength: 10, pattern: "($1)$2-$3", groups: [2, 4, 4] };
            } else if (['7', '8'].includes(thirdDigit)) {
              // 彰化縣: (04)7&8+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            } else if (['9'].includes(thirdDigit)) {
              // 彰化縣: (049)+7D → 總共10碼
              return { totalLength: 10, pattern: "($1)$2-$3", groups: [3, 3, 4] };
            }
          }
        } else if (phone.startsWith("05")) {
          if (phone.length >= 3) {
            const thirdDigit = phone[2];
            if (['2', '4', '5', '6', '7', '8'].includes(thirdDigit)) {
              // 雲林縣: (05)5~8+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            }
          }
        } else if (phone.startsWith("06")) {
          if (phone.length >= 3) {
            const thirdDigit = phone[2];
            if (['2', '3', '4', '5', '6', '7', '9'].includes(thirdDigit)) {
              // 台南縣: (06)2~7+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            }
          }
        } else if (phone.startsWith("07")) {
          // 高雄縣市: (07)+7D → 區碼(07) + 7碼 = 總共9碼
          return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
        } else if (phone.startsWith("089")) {
          // 台東縣: (089)+6D → 區碼(089) + 6碼 = 總共9碼
          return { totalLength: 9, pattern: "($1)$2-$3", groups: [3, 3, 3] };
        } else if (phone.startsWith("0836")) {
          // 馬祖: (0836)+5D → 區碼(0836) + 5碼 = 總共9碼
          return { totalLength: 9, pattern: "($1)$2-$3", groups: [4, 2, 3] };
        } else if (phone.startsWith("0823")) {
          // 金門: (082)3+5D → 總共9碼
          return { totalLength: 9, pattern: "($1)$2-$3", groups: [3, 3, 3] };
        } else if (phone.startsWith("08266")) {
          // 烏坵: (0826)6+4D → 總共9碼
          return { totalLength: 9, pattern: "($1)$2-$3", groups: [4, 2, 3] };
        } else if (phone.startsWith("08")) {
          if (phone.length >= 3) {
            const thirdDigit = phone[2];
            if (['7', '8'].includes(thirdDigit)) {
              // 屏東縣: (08)7&8+6D → 總共9碼
              return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
            }
          }
        }
        
        // 預設格式 (如果無法識別區碼)
        return { totalLength: 9, pattern: "($1)$2-$3", groups: [2, 3, 4] };
      };

      const format = getPhoneFormat(cleanPhone);
      
      if (cleanPhone.length === format.totalLength) {
        // 完整號碼格式化
        if (format.groups.length === 3) {
          const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d{${format.groups[1]}})(\\d{${format.groups[2]}})`);
          formattedValue = cleanPhone.replace(regex, format.pattern);
        }
      } else if (cleanPhone.length > format.totalLength) {
        // 超過標準長度，自動添加分機號碼
        const phoneDigits = cleanPhone.substring(0, format.totalLength);
        const extensionDigits = cleanPhone.substring(format.totalLength);
        
        // 格式化電話號碼部分
        if (format.groups.length === 3) {
          const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d{${format.groups[1]}})(\\d{${format.groups[2]}})`);
          formattedValue = phoneDigits.replace(regex, format.pattern);
        }
        
        // 自動添加分機號碼
        if (extensionDigits) {
          formattedValue += `#${extensionDigits}`;
        }
      } else if (cleanPhone.length > format.groups[0]) {
        // 部分格式化
        if (cleanPhone.length <= format.groups[0] + format.groups[1]) {
          const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d+)`);
          formattedValue = cleanPhone.replace(regex, "($1)$2");
        } else {
          const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d{${format.groups[1]}})(\\d+)`);
          formattedValue = cleanPhone.replace(regex, "($1)$2-$3");
        }
      }
    } else {
      // 手機號碼處理 (09開頭，10碼)
      if (cleanPhone.startsWith("09") && cleanPhone.length > 10) {
        const phoneDigits = cleanPhone.substring(0, 10);
        const extensionDigits = cleanPhone.substring(10);
        
        // 格式化手機號碼
        formattedValue = phoneDigits.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
        
        // 自動添加分機號碼
        if (extensionDigits) {
          formattedValue += `#${extensionDigits}`;
        }
      } else if (cleanPhone.startsWith("09") && cleanPhone.length === 10) {
        // 完整手機號碼格式化
        formattedValue = cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
      } else if (cleanPhone.startsWith("09") && cleanPhone.length > 4) {
        // 部分手機號碼格式化
        if (cleanPhone.length <= 7) {
          formattedValue = cleanPhone.replace(/(\d{4})(\d+)/, "$1-$2");
        } else {
          formattedValue = cleanPhone.replace(/(\d{4})(\d{3})(\d+)/, "$1-$2-$3");
        }
      }
    }
    
    // 處理用戶手動輸入的分機號碼
    if (extension && !formattedValue.includes('#')) {
      formattedValue += `#${extension.replace(/[^\d]/g, "")}`;
    }
    
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

  // 取得電話標籤
  const getPhoneLabel = () => {
    return selectedCustomerType === "一般住家" ? "市話" : "公司電話（市話）";
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
              {customerTypes.map((type) => (
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
                    {contactTypes.map((type) => (
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
                      // 使用 handlePhoneChange 處理市話和手機格式化
                      handlePhoneChange(e.target.value, `contact${i}_contact`);
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
