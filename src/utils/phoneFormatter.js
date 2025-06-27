// 電話號碼格式化工具函數
// 支援台灣地區手機和市話格式化，包含分機號碼處理

/**
 * 根據台灣區碼判斷市話格式
 * @param {string} phone - 清理後的電話號碼
 * @returns {object} - 包含總長度、格式模式和分組的對象
 */
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

/**
 * 格式化手機號碼
 * @param {string} cleanPhone - 清理後的電話號碼
 * @returns {string} - 格式化後的手機號碼
 */
const formatMobilePhone = (cleanPhone) => {
  // 手機號碼處理 (09開頭，10碼) - 格式: xxxx-xxx-xxx
  if (cleanPhone.length > 10) {
    // 超過10碼，自動添加分機號碼
    const phoneDigits = cleanPhone.substring(0, 10);
    const extensionDigits = cleanPhone.substring(10);
    let formattedValue = phoneDigits.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
    if (extensionDigits) {
      formattedValue += `#${extensionDigits}`;
    }
    return formattedValue;
  } else {
    // 手機號碼格式化: xxxx-xxx-xxx
    return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
  }
};

/**
 * 格式化市話號碼
 * @param {string} cleanPhone - 清理後的電話號碼
 * @returns {string} - 格式化後的市話號碼
 */
const formatLandlinePhone = (cleanPhone) => {
  const format = getPhoneFormat(cleanPhone);
  
  if (cleanPhone.length === format.totalLength) {
    // 完整號碼格式化
    if (format.groups.length === 3) {
      const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d{${format.groups[1]}})(\\d{${format.groups[2]}})`);
      return cleanPhone.replace(regex, format.pattern);
    }
  } else if (cleanPhone.length > format.totalLength) {
    // 超過標準長度，自動添加分機號碼
    const phoneDigits = cleanPhone.substring(0, format.totalLength);
    const extensionDigits = cleanPhone.substring(format.totalLength);
    
    // 格式化電話號碼部分
    let formattedValue = phoneDigits;
    if (format.groups.length === 3) {
      const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d{${format.groups[1]}})(\\d{${format.groups[2]}})`);
      formattedValue = phoneDigits.replace(regex, format.pattern);
    }
    
    // 自動添加分機號碼
    if (extensionDigits) {
      formattedValue += `#${extensionDigits}`;
    }
    return formattedValue;
  } else if (cleanPhone.length > format.groups[0]) {
    // 部分格式化
    if (cleanPhone.length <= format.groups[0] + format.groups[1]) {
      const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d+)`);
      return cleanPhone.replace(regex, "($1)$2");
    } else {
      const regex = new RegExp(`(\\d{${format.groups[0]}})(\\d{${format.groups[1]}})(\\d+)`);
      return cleanPhone.replace(regex, "($1)$2-$3");
    }
  }
  
  return cleanPhone;
};

/**
 * 主要的電話號碼格式化函數
 * @param {string} value - 原始輸入值
 * @param {string} contactType - 聯絡方式類型 ("手機", "市話", "LineID", "信箱")
 * @returns {string} - 格式化後的電話號碼
 */
export const formatPhoneNumber = (value, contactType = null) => {
  // 保留原始輸入中的#字符用於分機號碼
  const parts = value.split('#');
  const phoneNumber = parts[0];
  const extension = parts.length > 1 ? parts[1] : '';
  
  // 移除非數字字符（除了格式化符號）
  let cleanPhone = phoneNumber.replace(/[^\d]/g, "");
  let formattedValue = cleanPhone;
  
  // 判斷聯絡方式類型來決定格式化方式
  if (contactType === "手機") {
    formattedValue = formatMobilePhone(cleanPhone);
  } else if (contactType === "市話" || (!contactType && cleanPhone.startsWith("0") && !cleanPhone.startsWith("09"))) {
    formattedValue = formatLandlinePhone(cleanPhone);
  }
  
  // 處理用戶手動輸入的分機號碼
  if (extension && !formattedValue.includes('#')) {
    formattedValue += `#${extension.replace(/[^\d]/g, "")}`;
  }
  
  return formattedValue;
};

/**
 * 通用的電話號碼變更處理函數 - 用於 CustomerForm
 * @param {string} value - 輸入值
 * @param {string} field - 欄位名稱
 * @param {string} contactType - 聯絡方式類型
 * @param {function} setCustomerData - 狀態更新函數
 */
export const handleCustomerPhoneChange = (value, field, contactType, setCustomerData) => {
  const formattedValue = formatPhoneNumber(value, contactType);
  
  setCustomerData(prev => ({
    ...prev,
    [field]: formattedValue
  }));
};

/**
 * 通用的電話號碼變更處理函數 - 用於 ProjectForm
 * @param {string} value - 輸入值
 * @param {number} contactIndex - 聯絡人索引
 * @param {string} field - 欄位名稱
 * @param {string} contactType - 聯絡方式類型
 * @param {function} updateContact - 聯絡人更新函數
 */
export const handleProjectPhoneChange = (value, contactIndex, field, contactType, updateContact) => {
  const formattedValue = formatPhoneNumber(value, contactType);
  updateContact(contactIndex, field, formattedValue);
};
