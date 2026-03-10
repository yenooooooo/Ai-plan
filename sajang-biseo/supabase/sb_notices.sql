-- 공지사항 테이블
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS sb_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'update', 'maintenance')),
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 비활성 (공지사항은 공개 데이터)
ALTER TABLE sb_notices DISABLE ROW LEVEL SECURITY;
