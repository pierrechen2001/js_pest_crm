// 臨時遷移腳本：添加財務欄位到 project_log 表
const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://wjnfumamdgrqlyrcjvqu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbmZ1bWFtZGdycWx5cmNqdnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNTkzMTQsImV4cCI6MjA1OTkzNTMxNH0.8dTIWtkFy_Scs822wgx_RMd39Ze54R5iVXq3rEtKUeo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addFinanceFields() {
  try {
    console.log('開始添加財務欄位到 project_log 表...');

    // 檢查是否已經有這些欄位
    const { data: columns, error: checkError } = await supabase
      .from('project_log')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('檢查現有欄位時發生錯誤:', checkError);
      return;
    }

    // 使用 RPC 執行 SQL 語句
    console.log('正在添加財務欄位...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (error) {
      console.error('添加欄位時發生錯誤:', error);
      console.log('嘗試使用替代方法...');
      
      // 如果 RPC 不可用，我們需要使用其他方法
      // 讓我們先檢查現有的表結構
      console.log('檢查現有表結構...');
      const { data: testData, error: testError } = await supabase
        .from('project_log')
        .select('invoice_number')
        .limit(1);
        
      if (testError && testError.code === '42703') {
        console.log('財務欄位不存在，需要添加。');
        console.log('請在 Supabase Dashboard 中手動執行以下 SQL:');
        console.log(`
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
        `);
      } else {
        console.log('財務欄位已經存在或有其他問題:', testError);
      }
    } else {
      console.log('財務欄位添加成功！');
    }

  } catch (error) {
    console.error('執行遷移時發生錯誤:', error);
  }
}

// 執行遷移
addFinanceFields();
