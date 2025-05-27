import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import { Refresh, LocationOn, Warning } from '@mui/icons-material';
import { batchUpdateProjectCoordinates, checkMissingCoordinates } from '../lib/batchGeocoding';

const GeocodingManagement = () => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [missingData, setMissingData] = useState({ count: 0, projects: [] });
  const [updateResult, setUpdateResult] = useState(null);
  const [error, setError] = useState(null);

  // 檢查缺少經緯度的專案
  const handleCheckMissing = async () => {
    setChecking(true);
    setError(null);
    try {
      const result = await checkMissingCoordinates();
      setMissingData(result);
    } catch (err) {
      setError('檢查失敗：' + err.message);
    } finally {
      setChecking(false);
    }
  };

  // 執行批次更新
  const handleBatchUpdate = async () => {
    if (missingData.count === 0) {
      alert('沒有需要更新的專案');
      return;
    }

    if (!window.confirm(`確定要更新 ${missingData.count} 個專案的經緯度嗎？這可能需要一些時間。`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setUpdateResult(null);

    try {
      const result = await batchUpdateProjectCoordinates();
      setUpdateResult(result);
      // 更新完成後重新檢查
      await handleCheckMissing();
    } catch (err) {
      setError('批次更新失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 頁面載入時自動檢查
  useEffect(() => {
    handleCheckMissing();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" />
          Geocoding 管理
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          管理專案的地理座標資料，為缺少經緯度的專案自動取得座標。
        </Typography>

        {/* 狀態概覽 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleCheckMissing}
            disabled={checking}
          >
            {checking ? '檢查中...' : '重新檢查'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleBatchUpdate}
            disabled={loading || missingData.count === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <LocationOn />}
          >
            {loading ? '更新中...' : `批次更新 (${missingData.count} 個專案)`}
          </Button>
        </Box>

        {/* 進度顯示 */}
        {loading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              正在更新專案經緯度，請稍候...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 更新結果 */}
        {updateResult && (
          <Alert 
            severity={updateResult.failed === 0 ? "success" : "warning"} 
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2">批次更新完成</Typography>
            <Typography variant="body2">
              總計：{updateResult.total} 個專案，
              成功：{updateResult.success} 個，
              失敗：{updateResult.failed} 個
            </Typography>
          </Alert>
        )}

        {/* 統計資訊 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Chip
            icon={<Warning />}
            label={`缺少經緯度：${missingData.count} 個專案`}
            color={missingData.count > 0 ? "warning" : "success"}
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* 缺少經緯度的專案列表 */}
      {missingData.projects.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            缺少經緯度的專案列表
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>專案名稱</TableCell>
                  <TableCell>施工地址</TableCell>
                  <TableCell>狀態</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {missingData.projects.map((project) => (
                  <TableRow key={project.project_id}>
                    <TableCell>{project.project_name}</TableCell>
                    <TableCell>
                      {`${project.site_city || ''}${project.site_district || ''}${project.site_address || ''}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="缺少座標"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 使用說明 */}
      <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          使用說明
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>系統會自動為新增的專案取得經緯度座標</li>
            <li>使用「重新檢查」按鈕來查看目前缺少座標的專案數量</li>
            <li>使用「批次更新」按鈕為現有專案補上座標資料</li>
            <li>批次更新會自動跳過地址不完整的專案</li>
            <li>更新過程中會有延遲以避免超過 Google API 限制</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default GeocodingManagement; 