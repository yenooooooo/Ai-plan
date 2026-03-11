-- 푸시 알림 구독 테이블
CREATE TABLE IF NOT EXISTS sb_push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text NOT NULL UNIQUE,
  p256dh      text,
  auth        text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sb_push_subs_user ON sb_push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_push_subs_active ON sb_push_subscriptions(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE sb_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sb_push_own_select" ON sb_push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sb_push_own_insert" ON sb_push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sb_push_own_update" ON sb_push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
