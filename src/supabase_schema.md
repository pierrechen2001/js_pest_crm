create table public.customer_database (
  customer_id uuid not null default gen_random_uuid (),
  customer_type text null,
  customer_name text null,
  contact_city text null,
  contact_district text null,
  contact_address text null,
  email text null,
  notes text null,
  tax_id text null,
  invoice_title text null,
  created_at timestamp with time zone null default now(),
  company_phone text null,
  fax text null,
  contact1_role text null,
  contact1_name text null,
  contact1_type text null,
  contact1_contact text null,
  contact2_role text null,
  contact2_name text null,
  contact2_type text null,
  contact2_contact text null,
  contact3_role text null,
  contact3_name text null,
  contact3_type text null,
  contact3_contact text null,
  constraint customer_database_pkey primary key (customer_id)
) TABLESPACE pg_default;

create table public.project (
  project_id uuid not null default gen_random_uuid (),
  project_name text null,
  customer_id uuid null,
  site_city text null,
  site_district text null,
  site_address text null,
  construction_item text null,
  construction_fee numeric null,
  start_date date null,
  end_date date null,
  construction_status text null,
  billing_status text null,
  project_notes text null,
  created_at timestamp with time zone null default now(),
  construction_days integer null,
  construction_scope text null,
  payment_method text null,
  payment_date date null,
  contact1_role text null,
  contact1_name text null,
  contact1_type text null,
  contact1_contact text null,
  contact2_role text null,
  contact2_name text null,
  contact2_type text null,
  contact2_contact text null,
  constraint project_pkey primary key (project_id),
  constraint project_customer_id_fkey foreign KEY (customer_id) references customer_database (customer_id) on delete set null
) TABLESPACE pg_default;

create table public.userpermissions (
  id serial not null,
  user_id integer not null,
  module_id integer not null,
  permission_id integer not null,
  constraint userpermissions_pkey primary key (id),
  constraint userpermissions_user_id_module_id_permission_id_key unique (user_id, module_id, permission_id),
  constraint userpermissions_module_id_fkey foreign KEY (module_id) references modules (id),
  constraint userpermissions_permission_id_fkey foreign KEY (permission_id) references permissions (id),
  constraint userpermissions_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create table public.users (
  id serial not null,
  email character varying(100) not null,
  name character varying(100) null,
  google_id character varying(100) null,
  picture_url text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;

create table public.modules (
  id serial not null,
  name character varying(100) not null,
  constraint modules_pkey primary key (id)
) TABLESPACE pg_default;

create table public.permissions (
  id serial not null,
  name character varying(50) not null,
  constraint permissions_pkey primary key (id)
) TABLESPACE pg_default;