/**
 * Geocoding 工具函數
 * 用於將地址轉換為經緯度座標
 */

/**
 * 使用 Google Geocoding API 將地址轉換為經緯度
 * @param {string} address - 完整地址
 * @returns {Promise<{latitude: number, longitude: number} | null>} 經緯度座標或 null
 */
export const geocodeAddress = async (address) => {
  if (!address || !address.trim()) {
    console.warn('Geocoding: 地址為空');
    return null;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('Geocoding: Google Maps API Key 未設定');
    return null;
  }

  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(geocodeUrl);
    const result = await response.json();

    if (result.status === 'OK' && result.results && result.results[0]) {
      const location = result.results[0].geometry.location;
      console.log('Geocoding 成功:', { address, latitude: location.lat, longitude: location.lng });
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    } else {
      console.warn('Geocoding 失敗:', result.status, address);
      return null;
    }
  } catch (error) {
    console.error('Geocoding API 呼叫失敗:', error);
    return null;
  }
};

/**
 * 組合台灣地址字串
 * @param {string} city - 縣市
 * @param {string} district - 區域
 * @param {string} address - 詳細地址
 * @returns {string} 完整地址
 */
export const combineAddress = (city, district, address) => {
  return `${city || ''}${district || ''}${address || ''}`.trim();
};

/**
 * 批次 geocoding 多個地址
 * @param {Array<{id: string, address: string}>} addresses - 地址陣列
 * @param {number} delay - 每次請求間的延遲時間（毫秒），預設 200ms
 * @returns {Promise<Array<{id: string, latitude: number, longitude: number}>>} 結果陣列
 */
export const batchGeocode = async (addresses, delay = 200) => {
  const results = [];
  
  for (const item of addresses) {
    const coords = await geocodeAddress(item.address);
    if (coords) {
      results.push({
        id: item.id,
        ...coords
      });
    }
    
    // 避免超過 API 限制，加入延遲
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}; 