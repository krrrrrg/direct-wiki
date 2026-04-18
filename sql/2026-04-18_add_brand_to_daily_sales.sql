-- daily_sales: 엑셀 업로드용 pos_type 정규화 + 유니크 인덱스
-- 기존 daily_sales에 이미 pos_type 컬럼이 존재하므로 별도 brand 컬럼 없이 pos_type 재사용
-- Supabase SQL Editor에서 실행

-- 1) 기존 pos_type 값 통일 (돌핀포스/dolphin → 돌핀, xmd → XMD)
UPDATE daily_sales SET pos_type = '돌핀' WHERE pos_type IN ('돌핀포스', 'dolphin');
UPDATE daily_sales SET pos_type = 'XMD'  WHERE pos_type = 'xmd';

-- 2) upsert용 유니크 인덱스 (pos_type, store_name, sale_date)
CREATE UNIQUE INDEX IF NOT EXISTS daily_sales_pos_store_date_uk
  ON daily_sales (pos_type, store_name, sale_date);

-- 3) 확인: pos_type이 XMD/돌핀 두 값만 남는지
-- SELECT DISTINCT pos_type FROM daily_sales;
