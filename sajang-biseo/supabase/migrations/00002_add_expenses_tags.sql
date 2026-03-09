-- ============================================================
-- 마이그레이션 00002: 일일 마감에 오늘 지출 + 태그 컬럼 추가
-- ============================================================

ALTER TABLE sb_daily_closing
  ADD COLUMN IF NOT EXISTS daily_expenses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags           text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN sb_daily_closing.daily_expenses IS '오늘 수기 지출 내역 [{name: string, amount: number}]';
COMMENT ON COLUMN sb_daily_closing.tags IS '오늘 영업 태그 (비옴, 근처행사 등)';
