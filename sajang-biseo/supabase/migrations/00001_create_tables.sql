-- ============================================================
-- 사장님비서 (SajangBiseo) — 데이터베이스 마이그레이션
-- ============================================================
-- ⚠️ 공유 Supabase 환경: 기존 테이블/설정 절대 불가침
-- ⚠️ 모든 테이블: sb_ 프리픽스 | RLS 정책: sb_ 프리픽스
-- ⚠️ auth.users 재활용 | Storage: sajang- 프리픽스
-- ============================================================

-- ────────────────────────────────────────
-- 0. updated_at 자동 갱신 트리거 함수
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION sb_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────
-- 1. sb_user_profiles — 사장님비서 전용 프로필
--    auth.users를 재활용, 별도 users 테이블 없음
-- ────────────────────────────────────────
CREATE TABLE sb_user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  phone       text,
  agreed_terms boolean NOT NULL DEFAULT false,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TRIGGER sb_user_profiles_updated_at
  BEFORE UPDATE ON sb_user_profiles
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_user_profiles_own"
  ON sb_user_profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ────────────────────────────────────────
-- 2. sb_stores — 매장 정보 (1 user : N stores)
-- ────────────────────────────────────────
CREATE TABLE sb_stores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name    text NOT NULL,
  business_type text NOT NULL,               -- 한식, 중식, 카페 등
  address       text,
  phone         text,
  monthly_revenue_tier text,                 -- 연매출 구간 (카드 수수료 결정용)
  is_default    boolean NOT NULL DEFAULT false, -- 기본 매장 여부
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX idx_sb_stores_user ON sb_stores(user_id);

CREATE TRIGGER sb_stores_updated_at
  BEFORE UPDATE ON sb_stores
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_stores_own"
  ON sb_stores FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ────────────────────────────────────────
-- 3. sb_store_fee_settings — 매장별 수수료 설정
-- ────────────────────────────────────────
CREATE TABLE sb_store_fee_settings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id            uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE UNIQUE,
  annual_revenue_tier text NOT NULL DEFAULT '3억~5억',
  credit_card_rate    decimal(5,2) NOT NULL DEFAULT 1.30,  -- 신용카드 수수료율
  check_card_rate     decimal(5,2) NOT NULL DEFAULT 0.80,  -- 체크카드 수수료율
  check_card_ratio    decimal(5,2) NOT NULL DEFAULT 20.00, -- 체크카드 비율 (%)
  card_payment_ratio  decimal(5,2) NOT NULL DEFAULT 90.00, -- 전체 카드결제 비율 (%)
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sb_store_fee_settings_updated_at
  BEFORE UPDATE ON sb_store_fee_settings
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_store_fee_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_store_fee_settings_own"
  ON sb_store_fee_settings FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 4. sb_fee_channels — 수수료 채널 (배달앱, 배달대행 등)
-- ────────────────────────────────────────
CREATE TABLE sb_fee_channels (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  channel_name  text NOT NULL,                 -- 배민, 쿠팡이츠, 요기요 등
  fee_type      text NOT NULL CHECK (fee_type IN ('percentage', 'fixed')),
  rate          decimal(5,2),                  -- 비율 (%), fee_type=percentage
  fixed_amount  integer,                       -- 건당 금액 (원), fee_type=fixed
  category      text NOT NULL CHECK (category IN ('delivery', 'card', 'delivery_agency', 'other')),
  is_active     boolean NOT NULL DEFAULT true,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX idx_sb_fee_channels_store ON sb_fee_channels(store_id);

CREATE TRIGGER sb_fee_channels_updated_at
  BEFORE UPDATE ON sb_fee_channels
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_fee_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_fee_channels_own"
  ON sb_fee_channels FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 5. sb_daily_closing — 일일 마감 데이터
-- ────────────────────────────────────────
CREATE TABLE sb_daily_closing (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  date            date NOT NULL,
  total_sales     integer NOT NULL DEFAULT 0,    -- 총매출 (원)
  card_ratio      decimal(5,2) NOT NULL DEFAULT 90.00,
  cash_ratio      decimal(5,2) NOT NULL DEFAULT 10.00,
  total_fees      integer NOT NULL DEFAULT 0,    -- 총 수수료 (원)
  net_sales       integer NOT NULL DEFAULT 0,    -- 순매출 (원)
  fee_rate        decimal(5,2) NOT NULL DEFAULT 0.00, -- 수수료율 (%)
  memo            text,
  input_mode      text DEFAULT 'keypad' CHECK (input_mode IN ('keypad', 'voice', 'chat')),
  weather_tag     text,                          -- 날씨 태그
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  UNIQUE(store_id, date)
);

CREATE INDEX idx_sb_daily_closing_store_date ON sb_daily_closing(store_id, date DESC);

CREATE TRIGGER sb_daily_closing_updated_at
  BEFORE UPDATE ON sb_daily_closing
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_daily_closing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_daily_closing_own"
  ON sb_daily_closing FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 6. sb_daily_closing_channels — 채널별 매출 상세
-- ────────────────────────────────────────
CREATE TABLE sb_daily_closing_channels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closing_id      uuid NOT NULL REFERENCES sb_daily_closing(id) ON DELETE CASCADE,
  store_id        uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  channel_name    text NOT NULL,
  amount          integer NOT NULL DEFAULT 0,     -- 채널 매출 (원)
  ratio           decimal(5,2) NOT NULL DEFAULT 0.00,
  delivery_count  integer DEFAULT 0,              -- 배달 건수
  platform_fee    integer NOT NULL DEFAULT 0,     -- 배달앱 수수료
  delivery_fee    integer NOT NULL DEFAULT 0,     -- 배달대행 수수료
  card_fee        integer NOT NULL DEFAULT 0,     -- 카드 수수료
  total_fee       integer NOT NULL DEFAULT 0,     -- 채널 총 수수료
  net_amount      integer NOT NULL DEFAULT 0,     -- 채널 순매출
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sb_closing_channels_closing ON sb_daily_closing_channels(closing_id);
CREATE INDEX idx_sb_closing_channels_store ON sb_daily_closing_channels(store_id);

ALTER TABLE sb_daily_closing_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_daily_closing_channels_own"
  ON sb_daily_closing_channels FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 7. sb_order_item_groups — 품목 카테고리 그룹
-- ────────────────────────────────────────
CREATE TABLE sb_order_item_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  group_name  text NOT NULL,      -- 채소류, 육류, 수산류 등
  icon        text,               -- 이모지 아이콘
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX idx_sb_order_item_groups_store ON sb_order_item_groups(store_id);

CREATE TRIGGER sb_order_item_groups_updated_at
  BEFORE UPDATE ON sb_order_item_groups
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_order_item_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_order_item_groups_own"
  ON sb_order_item_groups FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 8. sb_order_items — 발주 품목 마스터
-- ────────────────────────────────────────
CREATE TABLE sb_order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  group_id          uuid REFERENCES sb_order_item_groups(id) ON DELETE SET NULL,
  item_name         text NOT NULL,
  unit              text NOT NULL,            -- kg, 팩, 박스, 개, 망, 판, 병, 포
  unit_price        integer,                  -- 1단위 가격 (원)
  default_order_qty decimal(8,2) NOT NULL DEFAULT 1.00,
  shelf_life_days   integer,                  -- 유통기한 (일)
  supplier_name     text,
  supplier_contact  text,
  is_active         boolean NOT NULL DEFAULT true,
  sort_order        integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE INDEX idx_sb_order_items_store ON sb_order_items(store_id);
CREATE INDEX idx_sb_order_items_group ON sb_order_items(group_id);

CREATE TRIGGER sb_order_items_updated_at
  BEFORE UPDATE ON sb_order_items
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_order_items_own"
  ON sb_order_items FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 9. sb_daily_usage — 일일 식자재 사용량
-- ────────────────────────────────────────
CREATE TABLE sb_daily_usage (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  item_id         uuid NOT NULL REFERENCES sb_order_items(id) ON DELETE CASCADE,
  date            date NOT NULL,
  used_qty        decimal(8,2) NOT NULL DEFAULT 0.00,
  waste_qty       decimal(8,2) NOT NULL DEFAULT 0.00,
  remaining_stock decimal(8,2) NOT NULL DEFAULT 0.00,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, item_id, date)
);

CREATE INDEX idx_sb_daily_usage_store_date ON sb_daily_usage(store_id, date DESC);
CREATE INDEX idx_sb_daily_usage_item ON sb_daily_usage(item_id, date DESC);

CREATE TRIGGER sb_daily_usage_updated_at
  BEFORE UPDATE ON sb_daily_usage
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_daily_usage_own"
  ON sb_daily_usage FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 10. sb_order_recommendations — AI 발주 추천 기록
-- ────────────────────────────────────────
CREATE TABLE sb_order_recommendations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  date              date NOT NULL,             -- 발주 대상 날짜
  item_id           uuid NOT NULL REFERENCES sb_order_items(id) ON DELETE CASCADE,
  current_stock     decimal(8,2) NOT NULL DEFAULT 0.00,
  expected_usage    decimal(8,2) NOT NULL DEFAULT 0.00,
  recommended_qty   decimal(8,2) NOT NULL DEFAULT 0.00,
  confirmed_qty     decimal(8,2),              -- 사장님 확정 수량 (null=미확정)
  urgency           text NOT NULL DEFAULT 'low' CHECK (urgency IN ('high', 'medium', 'low')),
  reason            text,
  is_confirmed      boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sb_order_recs_store_date ON sb_order_recommendations(store_id, date DESC);

ALTER TABLE sb_order_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_order_recommendations_own"
  ON sb_order_recommendations FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 11. sb_receipt_categories — 경비 카테고리
-- ────────────────────────────────────────
CREATE TABLE sb_receipt_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    uuid REFERENCES sb_stores(id) ON DELETE CASCADE,  -- NULL = 시스템 기본
  code        text NOT NULL,             -- F01, F02, ...
  label       text NOT NULL,             -- 식재료비, 소모품비, ...
  icon        text,                      -- 이모지
  tax_item    text,                      -- 세무 항목
  is_system   boolean NOT NULL DEFAULT false, -- 시스템 기본 카테고리
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX idx_sb_receipt_categories_store ON sb_receipt_categories(store_id);

CREATE TRIGGER sb_receipt_categories_updated_at
  BEFORE UPDATE ON sb_receipt_categories
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_receipt_categories ENABLE ROW LEVEL SECURITY;

-- 시스템 기본 카테고리(store_id IS NULL)는 모든 인증 사용자가 읽기 가능
CREATE POLICY "sb_receipt_categories_read_system"
  ON sb_receipt_categories FOR SELECT
  USING (is_system = true OR store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

CREATE POLICY "sb_receipt_categories_write_own"
  ON sb_receipt_categories FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

CREATE POLICY "sb_receipt_categories_update_own"
  ON sb_receipt_categories FOR UPDATE
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

CREATE POLICY "sb_receipt_categories_delete_own"
  ON sb_receipt_categories FOR DELETE
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 12. sb_receipts — 영수증 데이터
-- ────────────────────────────────────────
CREATE TABLE sb_receipts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  date            date NOT NULL,
  merchant_name   text NOT NULL,
  total_amount    integer NOT NULL,           -- 결제 총액 (원)
  vat_amount      integer,                    -- 부가세 (원)
  payment_method  text DEFAULT '카드' CHECK (payment_method IN ('카드', '현금', '이체')),
  card_last_four  text,
  category_id     uuid REFERENCES sb_receipt_categories(id) ON DELETE SET NULL,
  items           jsonb,                      -- 품목 내역 [{name, qty, unitPrice, amount}]
  image_url       text,                       -- Storage URL
  ocr_confidence  decimal(3,2) DEFAULT 0.00,  -- 0.00~1.00
  memo            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX idx_sb_receipts_store_date ON sb_receipts(store_id, date DESC);
CREATE INDEX idx_sb_receipts_category ON sb_receipts(category_id);

CREATE TRIGGER sb_receipts_updated_at
  BEFORE UPDATE ON sb_receipts
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_receipts_own"
  ON sb_receipts FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 13. sb_reviews — 리뷰 데이터
-- ────────────────────────────────────────
CREATE TABLE sb_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  platform      text NOT NULL CHECK (platform IN ('배민', '쿠팡이츠', '네이버', '요기요', '기타')),
  rating        integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content       text NOT NULL,
  reply_status  text NOT NULL DEFAULT 'pending' CHECK (reply_status IN ('pending', 'replied')),
  reviewed_at   timestamptz,                  -- 리뷰 작성일 (플랫폼 기준)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX idx_sb_reviews_store ON sb_reviews(store_id, created_at DESC);
CREATE INDEX idx_sb_reviews_status ON sb_reviews(store_id, reply_status);

CREATE TRIGGER sb_reviews_updated_at
  BEFORE UPDATE ON sb_reviews
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_reviews_own"
  ON sb_reviews FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 14. sb_review_replies — 리뷰 답글
-- ────────────────────────────────────────
CREATE TABLE sb_review_replies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   uuid NOT NULL REFERENCES sb_reviews(id) ON DELETE CASCADE,
  store_id    uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  blocks      jsonb NOT NULL,                -- [{type, label, content}]
  full_text   text NOT NULL,
  version     integer NOT NULL DEFAULT 1,
  is_selected boolean NOT NULL DEFAULT false, -- 최종 선택된 버전
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sb_review_replies_review ON sb_review_replies(review_id);

ALTER TABLE sb_review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_review_replies_own"
  ON sb_review_replies FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 15. sb_store_tone_settings — 리뷰 답글 톤 설정
-- ────────────────────────────────────────
CREATE TABLE sb_store_tone_settings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE UNIQUE,
  tone_name         text NOT NULL DEFAULT '친근한 동네 사장님',
  sample_replies    text[],                    -- 기존 답글 샘플
  store_name_display text,                     -- 답글에 쓸 매장명
  signature_menus   text[],                    -- 대표 메뉴
  store_features    text[],                    -- 매장 특징
  frequent_phrases  text[],                    -- 자주 쓰는 표현
  use_emoji         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sb_store_tone_settings_updated_at
  BEFORE UPDATE ON sb_store_tone_settings
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_store_tone_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_store_tone_settings_own"
  ON sb_store_tone_settings FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 16. sb_weekly_briefings — 주간 브리핑 데이터
-- ────────────────────────────────────────
CREATE TABLE sb_weekly_briefings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  week_start      date NOT NULL,               -- 월요일
  week_end        date NOT NULL,               -- 일요일
  sales_summary   jsonb,
  fee_summary     jsonb,
  expense_summary jsonb,
  ingredient_efficiency jsonb,
  customer_reputation   jsonb,
  ai_coaching     jsonb,
  email_sent      boolean NOT NULL DEFAULT false,
  email_sent_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, week_start)
);

CREATE INDEX idx_sb_weekly_briefings_store ON sb_weekly_briefings(store_id, week_start DESC);

CREATE TRIGGER sb_weekly_briefings_updated_at
  BEFORE UPDATE ON sb_weekly_briefings
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();

ALTER TABLE sb_weekly_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_weekly_briefings_own"
  ON sb_weekly_briefings FOR ALL
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- ────────────────────────────────────────
-- 17. Storage 버킷 (sajang- 프리픽스)
-- ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('sajang-receipts', 'sajang-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- 영수증 이미지 RLS: 본인 매장 경로만 접근
CREATE POLICY "sb_storage_receipts_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'sajang-receipts'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM sb_stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "sb_storage_receipts_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sajang-receipts'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM sb_stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "sb_storage_receipts_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sajang-receipts'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM sb_stores WHERE user_id = auth.uid()
    )
  );
