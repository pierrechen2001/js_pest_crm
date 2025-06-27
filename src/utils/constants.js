// 共用常數定義文件
// 用於客戶管理和專案管理系統的常數

// 客戶類型選項
export const CUSTOMER_TYPES = [
  "古蹟、政府機關",
  "一般住家", 
  "建築師",
  "營造、設計公司"
];

// 聯絡方式類型選項
export const CONTACT_TYPES = [
  "手機",
  "市話",
  "LineID",
  "信箱"
];

// 施工項目選項
export const CONSTRUCTION_ITEM_OPTIONS = [
  "餌站安裝",
  "餌站檢測",
  "白蟻防治",
  "餌站埋設",
  "木料藥劑噴塗",
  "藥劑",
  "害蟲驅除",
  "老鼠餌站",
  "空間消毒",
  "調查費用",
  "鼠害防治工程",
  "外牆清洗",
  "外牆去漆",
  "門窗框去漆",
  "屋樑支撐工程",
  "牆身止潮帶",
  "外牆防護工程",
  "除鏽",
  "其他"
];

// 客戶類型相關的標籤映射
export const CUSTOMER_TYPE_LABELS = {
  "古蹟、政府機關": {
    nameLabel: "專案名稱",
    addressLabel: "專案地址", 
    phoneLabel: "市話",
    emailLabel: "專案信箱",
    cityLabel: "專案縣市",
    districtLabel: "專案區域",
    detailAddressLabel: "專案詳細地址"
  },
  "一般住家": {
    nameLabel: "客戶名稱",
    addressLabel: "住家地址",
    phoneLabel: "市話", 
    emailLabel: "信箱",
    cityLabel: "縣市",
    districtLabel: "區域",
    detailAddressLabel: "詳細地址"
  },
  "建築師": {
    nameLabel: "事務所名稱",
    addressLabel: "事務所地址",
    phoneLabel: "事務所市話",
    emailLabel: "事務所信箱",
    cityLabel: "事務所縣市",
    districtLabel: "事務所區域", 
    detailAddressLabel: "事務所詳細地址"
  },
  "營造、設計公司": {
    nameLabel: "公司名稱",
    addressLabel: "公司地址",
    phoneLabel: "公司市話",
    emailLabel: "公司信箱",
    cityLabel: "公司縣市",
    districtLabel: "公司區域",
    detailAddressLabel: "公司詳細地址"
  }
};

// 根據客戶類型獲取標籤
export const getCustomerTypeLabel = (customerType, labelType) => {
  return CUSTOMER_TYPE_LABELS[customerType]?.[labelType] || CUSTOMER_TYPE_LABELS["一般住家"][labelType];
};
