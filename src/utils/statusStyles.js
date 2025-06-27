// 狀態樣式工具函數
// 用於專案狀態和請款狀態的顏色配置

/**
 * 根據狀態類型和狀態值獲取對應的樣式
 * @param {string} status - 狀態值
 * @param {string} type - 狀態類型 ('construction' 或 'billing')
 * @returns {object} - 包含背景顏色和文字顏色的樣式對象
 */
export const getStatusStyle = (status, type) => {
  if (type === 'construction') {
    switch (status) {
      case '未開始':
        return { bg: 'rgba(128, 128, 128, 0.1)', color: 'gray' };
      case '進行中':
        return { bg: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' };
      case '已完成':
        return { bg: 'rgba(76, 175, 80, 0.1)', color: 'green' };
      case '延遲':
        return { bg: 'rgba(244, 67, 54, 0.1)', color: 'red' };
      case '已估價':
        return { bg: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' };
      case '取消':
        return { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' };
      default:
        return { bg: 'rgba(0,0,0,0.05)', color: 'black' };
    }
  }
  if (type === 'billing') {
    switch (status) {
      case '未請款':
        return { bg: 'rgba(128, 128, 128, 0.1)', color: 'gray' };
      case '部分請款':
        return { bg: 'rgba(255, 152, 0, 0.1)', color: '#f57c00' };
      case '已結清':
        return { bg: 'rgba(76, 175, 80, 0.1)', color: 'green' };
      case '取消':
        return { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' };
      default:
        return { bg: 'rgba(0,0,0,0.05)', color: 'black' };
    }
  }
  return { bg: 'rgba(0,0,0,0.05)', color: 'black' };
};

// 狀態選項常數
export const constructionStatusOptions = ["未開始", "進行中", "已完成", "延遲", "已估價", "取消"];
export const billingStatusOptions = ["未請款", "部分請款", "已結清", "取消"];
