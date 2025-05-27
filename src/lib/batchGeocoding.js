import { supabase } from './supabaseClient';
import { geocodeAddress, combineAddress } from './geocoding';

/**
 * 批次更新現有專案的經緯度
 * 只處理沒有經緯度資料的專案
 */
export const batchUpdateProjectCoordinates = async () => {
  try {
    console.log('開始批次更新專案經緯度...');
    
    // 1. 取得所有沒有經緯度的專案
    const { data: projects, error: fetchError } = await supabase
      .from('project')
      .select('project_id, site_city, site_district, site_address, project_name')
      .or('latitude.is.null,longitude.is.null')
      .not('site_city', 'is', null)
      .not('site_address', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!projects || projects.length === 0) {
      console.log('沒有需要更新的專案');
      return { success: 0, failed: 0, total: 0 };
    }

    console.log(`找到 ${projects.length} 個需要更新經緯度的專案`);

    let successCount = 0;
    let failedCount = 0;

    // 2. 逐一處理每個專案
    for (const project of projects) {
      try {
        const fullAddress = combineAddress(
          project.site_city,
          project.site_district,
          project.site_address
        );

        if (!fullAddress.trim()) {
          console.warn(`專案 ${project.project_name} 地址為空，跳過`);
          failedCount++;
          continue;
        }

        // 3. 呼叫 geocoding API
        const coords = await geocodeAddress(fullAddress);

        if (coords) {
          // 4. 更新資料庫
          const { error: updateError } = await supabase
            .from('project')
            .update({
              latitude: coords.latitude,
              longitude: coords.longitude
            })
            .eq('project_id', project.project_id);

          if (updateError) {
            console.error(`更新專案 ${project.project_name} 失敗:`, updateError);
            failedCount++;
          } else {
            console.log(`成功更新專案 ${project.project_name} 的經緯度`);
            successCount++;
          }
        } else {
          console.warn(`專案 ${project.project_name} geocoding 失敗`);
          failedCount++;
        }

        // 5. 避免超過 API 限制，加入延遲
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`處理專案 ${project.project_name} 時發生錯誤:`, error);
        failedCount++;
      }
    }

    const result = {
      success: successCount,
      failed: failedCount,
      total: projects.length
    };

    console.log('批次更新完成:', result);
    return result;

  } catch (error) {
    console.error('批次更新專案經緯度失敗:', error);
    throw error;
  }
};

/**
 * 檢查有多少專案缺少經緯度資料
 */
export const checkMissingCoordinates = async () => {
  try {
    const { data, error } = await supabase
      .from('project')
      .select('project_id, project_name, site_city, site_district, site_address')
      .or('latitude.is.null,longitude.is.null')
      .not('site_city', 'is', null)
      .not('site_address', 'is', null);

    if (error) {
      throw error;
    }

    return {
      count: data?.length || 0,
      projects: data || []
    };
  } catch (error) {
    console.error('檢查缺少經緯度的專案失敗:', error);
    throw error;
  }
}; 