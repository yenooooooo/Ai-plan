/**
 * 인메모리 Rate Limiter (IP + userId 기반)
 * Vercel 서버리스에서 globalThis로 프로세스 내 지속
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

type RateLimitStore = Map<string, RateLimitEntry>;

// globalThis에 저장하여 hot reload/재호출에도 유지
const STORE_KEY = "__rateLimitStore__";
function getStore(): RateLimitStore {
  const g = globalThis as unknown as Record<string, RateLimitStore>;
  if (!g[STORE_KEY]) g[STORE_KEY] = new Map();
  return g[STORE_KEY];
}

// 오래된 엔트리 정리 (1시간마다)
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 3600_000) return;
  lastCleanup = now;
  const store = getStore();
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.resetAt < now) store.delete(key);
  });
}

interface RateLimitOptions {
  /** 허용 요청 수 */
  maxRequests: number;
  /** 윈도우 크기 (ms) */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Rate limit 체크
 * @param key - 고유 키 (IP, userId, 조합 등)
 * @param options - 제한 설정
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  cleanup();
  const store = getStore();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // 새 윈도우 시작
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    retryAfterMs: 0,
  };
}

/** 로그인 실패 전용 — 5회 실패 시 15분 잠금 */
export function checkLoginAttempt(ip: string): { allowed: boolean; remaining: number; lockoutMinutes: number } {
  const result = checkRateLimit(`login:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15분
  });
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    lockoutMinutes: Math.ceil(result.retryAfterMs / 60_000),
  };
}

/** 로그인 성공 시 카운터 리셋 */
export function resetLoginAttempts(ip: string): void {
  getStore().delete(`login:${ip}`);
}

/** 회원가입 IP 제한 — 24시간 내 3개 계정 */
export function checkSignupLimit(ip: string): { allowed: boolean; remaining: number } {
  const result = checkRateLimit(`signup:${ip}`, {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24시간
  });
  return { allowed: result.allowed, remaining: result.remaining };
}

/** API 엔드포인트 Rate Limit — 분당 제한 */
export function checkApiRateLimit(key: string, maxPerMinute: number = 10): RateLimitResult {
  return checkRateLimit(`api:${key}`, {
    maxRequests: maxPerMinute,
    windowMs: 60_000,
  });
}
