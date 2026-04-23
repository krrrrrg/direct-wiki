-- 매장 사이즈 설문 (Store Size Survey) 테이블
-- HQ 원본 스펙 + 매장별 레퍼런스 이미지 + 설문 세션 + 매니저 제출 항목

create table if not exists signage_specs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  item_type text not null,
  location_label text,
  width int not null,
  height int not null,
  qty int not null default 1,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
create index if not exists signage_specs_store_idx on signage_specs(store_id, sort_order);

create table if not exists signage_reference_images (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
create index if not exists signage_reference_images_store_idx on signage_reference_images(store_id, sort_order);

create table if not exists signage_surveys (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references stores(id) on delete cascade,
  submitted_at timestamptz,
  submitted_by_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists signage_submissions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references signage_surveys(id) on delete cascade,
  spec_id uuid references signage_specs(id) on delete set null,
  status text not null check (status in ('match','modified','removed','added')),
  measured_width int,
  measured_height int,
  measured_qty int,
  note text,
  photo_url text,
  created_at timestamptz default now()
);
create index if not exists signage_submissions_survey_idx on signage_submissions(survey_id);
