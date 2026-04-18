-- daily_sales에 brand 컬럼 추가 + (brand, store_name, sale_date) 유니크 제약
-- Supabase SQL Editor에서 실행

-- 1) brand 컬럼 추가 (기존 행은 NULL로 남음)
ALTER TABLE daily_sales
  ADD COLUMN IF NOT EXISTS brand text;

-- 2) 기존 데이터 확인용 (실행 전 중복 체크)
-- 아래 쿼리 결과가 비어있어야 유니크 인덱스 생성 가능
-- SELECT brand, store_name, sale_date, count(*)
-- FROM daily_sales
-- GROUP BY brand, store_name, sale_date
-- HAVING count(*) > 1;

-- 3) (brand, store_name, sale_date) 유니크 인덱스
-- PostgreSQL은 NULL을 서로 다른 값으로 취급하므로 기존 brand=NULL 행들은 충돌하지 않음
CREATE UNIQUE INDEX IF NOT EXISTS daily_sales_brand_store_date_uk
  ON daily_sales (brand, store_name, sale_date);
