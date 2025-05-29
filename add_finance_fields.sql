-- 為 project_log 表添加財務相關欄位
-- 這些欄位用於存儲財務日誌的詳細資訊

ALTER TABLE public.project_log 
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS amount_no_tax DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS tax DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS amount_with_tax DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS retention_invoice_issued BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS retention_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS retention_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS tax_manually_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS amount_with_tax_manually_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS retention_amount_manually_changed BOOLEAN DEFAULT FALSE;

-- 添加註釋說明各欄位用途
COMMENT ON COLUMN public.project_log.invoice_number IS '請款單編號';
COMMENT ON COLUMN public.project_log.amount_no_tax IS '本期請款金額（未稅）';
COMMENT ON COLUMN public.project_log.tax IS '稅金';
COMMENT ON COLUMN public.project_log.amount_with_tax IS '本期請款金額（含稅）';
COMMENT ON COLUMN public.project_log.retention_invoice_issued IS '保留款發票已開（是/否）';
COMMENT ON COLUMN public.project_log.retention_percent IS '保留款百分比';
COMMENT ON COLUMN public.project_log.retention_amount IS '保留款金額';
COMMENT ON COLUMN public.project_log.tax_manually_changed IS '稅金是否手動修改';
COMMENT ON COLUMN public.project_log.amount_with_tax_manually_changed IS '含稅金額是否手動修改';
COMMENT ON COLUMN public.project_log.retention_amount_manually_changed IS '保留款金額是否手動修改';
