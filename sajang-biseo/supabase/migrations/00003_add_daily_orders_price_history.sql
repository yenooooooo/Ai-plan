-- Phase 1: 발주 입력 기록 & 가격 변동 이력
-- 사장님비서 발주 시스템 확장

-- 일일 발주 기록
CREATE TABLE IF NOT EXISTS sb_daily_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES sb_order_items(id) ON DELETE CASCADE,
  date date NOT NULL,
  order_qty numeric NOT NULL DEFAULT 0,
  unit_price_at_order numeric DEFAULT NULL,
  supplier_name text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, item_id, date)
);

-- 품목 단가 이력
CREATE TABLE IF NOT EXISTS sb_item_price_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES sb_stores(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES sb_order_items(id) ON DELETE CASCADE,
  date date NOT NULL,
  unit_price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, item_id, date)
);

-- RLS 활성화
ALTER TABLE sb_daily_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sb_item_price_history ENABLE ROW LEVEL SECURITY;

-- RLS 정책: sb_daily_orders
CREATE POLICY "sb_daily_orders_select" ON sb_daily_orders FOR SELECT
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));
CREATE POLICY "sb_daily_orders_insert" ON sb_daily_orders FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));
CREATE POLICY "sb_daily_orders_update" ON sb_daily_orders FOR UPDATE
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));
CREATE POLICY "sb_daily_orders_delete" ON sb_daily_orders FOR DELETE
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- RLS 정책: sb_item_price_history
CREATE POLICY "sb_item_price_history_select" ON sb_item_price_history FOR SELECT
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));
CREATE POLICY "sb_item_price_history_insert" ON sb_item_price_history FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));
CREATE POLICY "sb_item_price_history_update" ON sb_item_price_history FOR UPDATE
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));
CREATE POLICY "sb_item_price_history_delete" ON sb_item_price_history FOR DELETE
  USING (store_id IN (SELECT id FROM sb_stores WHERE user_id = auth.uid()));

-- updated_at 자동 갱신 트리거
CREATE TRIGGER sb_daily_orders_updated_at
  BEFORE UPDATE ON sb_daily_orders
  FOR EACH ROW EXECUTE FUNCTION sb_update_updated_at();
