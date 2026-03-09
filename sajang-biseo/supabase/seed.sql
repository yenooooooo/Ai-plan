-- ============================================================
-- 사장님비서 — 시드 데이터
-- ============================================================
-- ⚠️ 기존 데이터 불가침. INSERT ... ON CONFLICT DO NOTHING 패턴 사용
-- ============================================================

-- ────────────────────────────────────────
-- 1. 경비 카테고리 시스템 기본값 (F01~F99)
-- ────────────────────────────────────────
INSERT INTO sb_receipt_categories (id, store_id, code, label, icon, tax_item, is_system, sort_order)
VALUES
  (gen_random_uuid(), NULL, 'F01', '식재료비', '🥩', '매입비용',     true, 1),
  (gen_random_uuid(), NULL, 'F02', '소모품비', '📦', '소모품비',     true, 2),
  (gen_random_uuid(), NULL, 'F03', '수선유지비', '🔧', '수선비',     true, 3),
  (gen_random_uuid(), NULL, 'F04', '차량유지비', '⛽', '차량유지비', true, 4),
  (gen_random_uuid(), NULL, 'F05', '접대비',   '🍽️', '접대비',      true, 5),
  (gen_random_uuid(), NULL, 'F06', '통신비',   '📱', '통신비',      true, 6),
  (gen_random_uuid(), NULL, 'F07', '광고선전비', '📢', '광고선전비', true, 7),
  (gen_random_uuid(), NULL, 'F08', '보험료',   '🛡️', '보험료',      true, 8),
  (gen_random_uuid(), NULL, 'F09', '임차료',   '🏠', '임차료',      true, 9),
  (gen_random_uuid(), NULL, 'F10', '인건비',   '👤', '인건비',      true, 10),
  (gen_random_uuid(), NULL, 'F99', '기타',     '📋', '기타경비',    true, 99)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════
-- 2. 업종별 식자재 템플릿 (sb_order_item_templates)
--    이 데이터는 앱에서 매장 등록 시 업종에 맞는 품목을 복사해서 사용
--    별도 템플릿 테이블 없이 JSON으로 앱 레벨에서 관리하므로
--    여기서는 참조용 코멘트로만 기록
-- ════════════════════════════════════════

-- ※ 업종별 식자재 템플릿과 수수료 프리셋은 앱 코드에서 관리
-- (src/lib/constants.ts, src/lib/fees/presets.ts)
-- DB 시드가 아닌 앱 로직으로 매장 생성 시 자동 세팅
