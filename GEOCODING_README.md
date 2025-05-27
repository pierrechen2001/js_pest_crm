# Geocoding 功能說明

## 概述

本系統已整合 Google Geocoding API，可以自動將專案地址轉換為經緯度座標並儲存到資料庫中。這樣可以避免在地圖搜尋時重複呼叫 geocoding API，節省成本並提升效能。

## 功能特色

### 1. 自動 Geocoding
- 新增專案時自動呼叫 Google Geocoding API
- 將地址轉換為經緯度並儲存到資料庫
- 支援台灣地址格式（縣市 + 區域 + 詳細地址）

### 2. 批次更新
- 提供批次更新功能，為現有專案補上經緯度
- 只處理缺少經緯度的專案
- 自動跳過地址不完整的專案

### 3. 地圖優化
- 地圖優先使用資料庫中的經緯度
- 只有在缺少座標時才即時呼叫 geocoding API
- 即時更新並儲存新取得的座標

## 檔案結構

```
src/
├── lib/
│   ├── geocoding.js          # Geocoding 工具函數
│   └── batchGeocoding.js     # 批次更新功能
├── pages/
│   ├── GeocodingManagement.js # Geocoding 管理頁面
│   ├── Orders.js             # 已整合 geocoding
│   ├── CustomerDetailPage.js # 已整合 geocoding
│   └── Map.js                # 已優化使用資料庫座標
└── supabase_schema.md        # 已更新包含經緯度欄位
```

## 資料庫 Schema

專案資料表已包含以下欄位：
```sql
latitude double precision null,
longitude double precision null,
```

## 使用方式

### 1. 新增專案
在 `Orders.js` 或 `CustomerDetailPage.js` 新增專案時，系統會自動：
1. 組合完整地址（縣市 + 區域 + 詳細地址）
2. 呼叫 Google Geocoding API
3. 將經緯度儲存到資料庫

### 2. 批次更新現有專案
訪問 Geocoding 管理頁面（需要在路由中加入）：
```javascript
// 在 App.js 中加入路由
import GeocodingManagement from './pages/GeocodingManagement';

// 在路由中加入
<Route path="/geocoding-management" element={<GeocodingManagement />} />
```

### 3. 地圖搜尋
在 `Map.js` 中，系統會：
1. 優先使用資料庫中的經緯度
2. 如果缺少座標，即時呼叫 geocoding API
3. 將新取得的座標儲存到資料庫

## API 配置

確保在 `.env` 檔案中設定 Google Maps API Key：
```
REACT_APP_GOOGLE_API_KEY=your_google_maps_api_key_here
```

## 工具函數

### geocoding.js
- `geocodeAddress(address)`: 將地址轉換為經緯度
- `combineAddress(city, district, address)`: 組合台灣地址
- `batchGeocode(addresses, delay)`: 批次處理多個地址

### batchGeocoding.js
- `batchUpdateProjectCoordinates()`: 批次更新專案經緯度
- `checkMissingCoordinates()`: 檢查缺少經緯度的專案

## 成本控制

### 1. 避免重複呼叫
- 新增專案時只呼叫一次 geocoding API
- 地圖搜尋優先使用資料庫座標
- 批次更新有延遲機制避免超過 API 限制

### 2. 錯誤處理
- 地址不完整時跳過 geocoding
- API 呼叫失敗時不影響專案建立
- 詳細的錯誤日誌記錄

### 3. 效能優化
- 使用資料庫查詢代替 API 呼叫
- 批次處理時加入延遲避免超過限制
- 只處理真正需要的專案

## 監控與維護

### 1. 檢查缺少座標的專案
```javascript
import { checkMissingCoordinates } from './lib/batchGeocoding';

const result = await checkMissingCoordinates();
console.log(`缺少座標的專案數量: ${result.count}`);
```

### 2. 批次更新
```javascript
import { batchUpdateProjectCoordinates } from './lib/batchGeocoding';

const result = await batchUpdateProjectCoordinates();
console.log(`更新結果: 成功 ${result.success}, 失敗 ${result.failed}`);
```

## 注意事項

1. **API 限制**: Google Geocoding API 有使用限制，建議監控使用量
2. **地址品質**: 確保地址資料完整性以提高 geocoding 成功率
3. **錯誤處理**: geocoding 失敗不會影響專案的正常建立
4. **延遲機制**: 批次更新時有 200ms 延遲以避免超過 API 限制

## 未來改進

1. 加入地址驗證功能
2. 支援更多地址格式
3. 加入 geocoding 快取機制
4. 提供 geocoding 統計報表 