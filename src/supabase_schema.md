create table customer_database (
  customer_id uuid primary key default gen_random_uuid(), -- 客戶 ID，自動產生
  customer_type text,           -- 客戶類別
  customer_name text,           -- 客戶名稱
  contact_person_1 text,        -- 聯絡人 1
  contact_phone_1 text,         -- 聯絡電話 1
  contact_person_2 text,        -- 聯絡人 2
  contact_phone_2 text,         -- 聯絡電話 2
  contact_city text,            -- 聯絡 city
  contact_district text,        -- 聯絡 district
  contact_address text,         -- 聯絡地址
  email text,                   -- e-mail
  notes text,                   -- 備註
  tax_id text,                  -- 統一編號
  invoice_title text,           -- 抬頭
  created_at timestamp with time zone default now()  -- 加入時間
);

create table project (
  project_id uuid primary key default gen_random_uuid(),  -- 專案 ID，自動產生
  project_name text,                 -- 專案名稱
  customer_id uuid references customer_database(customer_id) on delete set null,  -- 客戶 ID 外鍵
  project_leader text,              -- 專案負責人
  leader_phone text,                -- 負責人電話
  site_city text,                   -- 施工 city
  site_district text,               -- 施工 district
  site_address text,                -- 施工地址
  construction_item text,          -- 施工項目
  construction_fee numeric,        -- 施工金額
  start_date date,                 -- 施工開始時間
  end_date date,                   -- 施工結束時間
  construction_status text,        -- 施工狀態（例：進行中／已完成／延遲）
  billing_status text,             -- 請款狀態（例：未請款／已請款／部分請款）
  project_notes text,              -- 施工備註
  created_at timestamp with time zone default now()  -- 建立時間
);

