-- 플랜 시스템 + 사용량 추적 + 팀 멤버
-- Supabase SQL Editor에서 실행하세요

-- 1. sb_user_profiles에 plan 컬럼 추가
ALTER TABLE sb_user_profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'
  CHECK (plan IN ('free', 'pro', 'pro_plus'));

-- 2. 사용량 추적 테이블
CREATE TABLE IF NOT EXISTS sb_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature TEXT NOT NULL,
  month TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, feature, month)
);
ALTER TABLE sb_usage_logs DISABLE ROW LEVEL SECURITY;

-- 3. 팀 멤버 테이블
CREATE TABLE IF NOT EXISTS sb_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, email)
);
ALTER TABLE sb_team_members DISABLE ROW LEVEL SECURITY;
