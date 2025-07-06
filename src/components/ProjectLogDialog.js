import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid
} from '@mui/material';

const ProjectLogDialog = ({
  open,
  onClose,
  onSave,
  logData,
  setLogData,
  mode = 'create', // 'create' or 'edit'
  loading = false
}) => {
  const isEditMode = mode === 'edit';
  
  // 安全的 logData 訪問，避免 null 錯誤
  const safeLogData = logData || {};
  
  const handleChange = (field, value) => {
    setLogData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // 基本驗證
    if (!safeLogData.log_date) {
      alert('請選擇日期！');
      return;
    }
    onSave();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>{isEditMode ? '編輯專案日誌' : '新增專案日誌'}</DialogTitle>
      <DialogContent sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* 第一行：日期、金額、未稅、含稅 */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="日期"
              value={safeLogData.log_date || ''}
              onChange={(e) => handleChange('log_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="金額"
              type="number"
              value={safeLogData.amount || ''}
              onChange={(e) => handleChange('amount', e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="未稅"
              type="number"
              value={safeLogData.amount_untaxed || ''}
              onChange={(e) => handleChange('amount_untaxed', e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="含稅"
              type="number"
              value={safeLogData.amount_taxed || ''}
              onChange={(e) => handleChange('amount_taxed', e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
          </Grid>

          {/* 第二行：人員、施作工項 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="人員"
              value={safeLogData.personnel || ''}
              onChange={(e) => handleChange('personnel', e.target.value)}
              placeholder="負責人員姓名"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="施作工項"
              multiline
              rows={2}
              value={safeLogData.work_item || ''}
              onChange={(e) => handleChange('work_item', e.target.value)}
              placeholder="具體施作項目"
            />
          </Grid>

          {/* 第三行：範圍、保固年限 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="範圍"
              multiline
              rows={2}
              value={safeLogData.work_scope || ''}
              onChange={(e) => handleChange('work_scope', e.target.value)}
              placeholder="工作範圍描述"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="保固年限"
              type="number"
              value={safeLogData.warranty_years || ''}
              onChange={(e) => handleChange('warranty_years', e.target.value)}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1 }}>年</Typography>
              }}
              inputProps={{ 
                step: "0.1",
                min: "0"
              }}
            />
          </Grid>

          {/* 第四行：備註 */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="備註"
              multiline
              rows={2}
              value={safeLogData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="其他備註資訊"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!safeLogData.log_date || loading}
        >
          {loading ? '儲存中...' : (isEditMode ? '儲存' : '新增')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectLogDialog;
