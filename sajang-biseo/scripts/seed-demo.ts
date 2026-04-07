#!/usr/bin/env npx tsx
/**
 * 하루키 스시 — 포트폴리오 데모 데이터 시드
 *
 * 실행:  npx tsx scripts/seed-demo.ts
 *
 * 생성 항목:
 *   계정  haruki@demo.com / demo1234!
 *   가게  하루키 스시 (일식, 서울 마포구 연남동)
 *   기간  2026-03 전체 (31일)
 *   플랜  Pro+
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

// ── .env.local 로드 ──────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local')
try {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[k]) process.env[k] = v
  }
} catch {
  console.error('ERR .env.local 파일을 찾을 수 없습니다.')
  process.exit(1)
}

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SB_URL || !SB_KEY) {
  console.error('ERR Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)가 없습니다.')
  process.exit(1)
}
const sb = createClient(SB_URL, SB_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── 상수 & 헬퍼 ─────────────────────────────────────────────────
const EMAIL = 'haruki@demo.com'
const PW = 'demo1234!'
const STORE_NAME = '하루키 스시'

const uid = () => randomUUID()
const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const jit = (n: number, p = 0.08) => Math.round(n * (1 + (Math.random() * 2 - 1) * p))
const p2 = (n: number) => String(n).padStart(2, '0')
const mdate = (d: number) => `2026-03-${p2(d)}`
const gdow = (d: number) => new Date(2026, 2, d).getDay()
const isWk = (d: number) => gdow(d) === 0 || gdow(d) === 6
const DK = ['일', '월', '화', '수', '목', '금', '토']

// ── 3월 일별 매출(원) ────────────────────────────────────────────
// Week1 평범 → Week2 화이트데이 → Week3 벚꽃피크 → Week4 하락
const SALES: Record<number, number> = {
  1: 1850000,  2: 950000,   3: 880000,   4: 1020000,  5: 980000,
  6: 1350000,  7: 1950000,  8: 1780000,  9: 1050000,  10: 920000,
  11: 1150000, 12: 1080000, 13: 1480000, 14: 2450000, 15: 2100000,
  16: 1250000, 17: 1180000, 18: 1320000, 19: 1280000, 20: 1650000,
  21: 2380000, 22: 2150000, 23: 1080000, 24: 950000,  25: 1050000,
  26: 980000,  27: 1420000, 28: 1920000, 29: 1750000, 30: 920000,
  31: 880000,
}

// ── 품목 정의 ────────────────────────────────────────────────────
const GROUPS = ['수산물', '육류', '채소/과일', '양념/소스', '주류/음료', '소모품'] as const
const GICONS = ['🐟', '🥩', '🥬', '🧂', '🍶', '📦']

// [grpIdx, name, unit, price, orderQty, shelf, supplier, dailyUse, wasteRate]
type TI = [number, string, string, number, number, number, string, number, number]
const TRACKED: TI[] = [
  [0, '연어',   'kg', 38000, 5,  3, '노량진수산', 3.5, 0.10],
  [0, '참치',   'kg', 55000, 3,  2, '노량진수산', 2.0, 0.08],
  [0, '새우',   'kg', 28000, 4,  3, '한일수산',   2.5, 0.07],
  [0, '장어',   'kg', 52000, 2,  2, '한일수산',   1.2, 0.05],
  [0, '광어',   'kg', 25000, 3,  2, '노량진수산', 1.8, 0.10],
  [0, '문어',   'kg', 32000, 2,  3, '한일수산',   1.0, 0.08],
  [1, '와규',   'kg', 65000, 2,  3, '마포축산',   1.0, 0.03],
  [1, '돈카츠용 돼지', 'kg', 15000, 5, 4, '마포축산', 3.0, 0.05],
  [1, '닭고기', 'kg',  8000, 3,  3, '마포축산',   1.5, 0.04],
  [2, '양파',   'kg',  3000, 10, 14, '마포농산',   3.0, 0.05],
  [2, '오이',   '개',  1500, 20,  5, '마포농산',   8.0, 0.10],
  [2, '아보카도','개',  3500, 15,  4, '마포농산',   6.0, 0.12],
  [2, '대파',   '단',  2500,  5,  7, '마포농산',   1.5, 0.08],
  [2, '레몬',   '개',  1200, 20, 10, '마포농산',   7.0, 0.05],
  [2, '무',     'kg',  2500,  5, 14, '마포농산',   2.0, 0.05],
]

type EI = [number, string, string, number, number, number, string]
const EXTRA: EI[] = [
  [3, '간장',       'L',   8000, 5, 180, '온라인몰'],
  [3, '와사비',     '개', 12000, 3,  90, '온라인몰'],
  [3, '미림',       'L',  15000, 3, 180, '온라인몰'],
  [3, '초밥용 식초', 'L',   6000, 3, 180, '온라인몰'],
  [4, '아사히 생맥주','통', 85000, 2,  30, '주류도매'],
  [4, '사케',       '병', 25000, 5, 365, '주류도매'],
  [4, '하이볼 탄산수','박스',12000, 3, 180, '온라인몰'],
  [5, '일회용 젓가락','박스',15000, 2, 365, '쿠팡비즈'],
  [5, '포장 용기',   '박스',25000, 3, 365, '쿠팡비즈'],
]

// ── 영수증 데이터 ────────────────────────────────────────────────
const RCPTS = [
  { d:1,  m:'노량진수산시장',  a:753500,  v:68500,  pm:'카드' as const, c:'F01', items:[{name:'연어',qty:5,price:38000},{name:'참치',qty:3,price:55000},{name:'새우',qty:4,price:28000},{name:'광어',qty:3,price:25000},{name:'문어',qty:2,price:32000}] },
  { d:1,  m:'마포축산',        a:205000,  v:18636,  pm:'카드' as const, c:'F01', items:[{name:'와규',qty:2,price:65000},{name:'돈카츠용 돼지',qty:5,price:15000}] },
  { d:2,  m:'마포농산물시장',  a:148700,  v:13518,  pm:'카드' as const, c:'F01', items:[{name:'양파',qty:10,price:3000},{name:'오이',qty:20,price:1500},{name:'아보카도',qty:15,price:3500},{name:'레몬',qty:20,price:1200}] },
  { d:3,  m:'GS칼텍스 마포',   a:225000,  v:20454,  pm:'카드' as const, c:'F03', items:[{name:'도시가스',qty:1,price:225000}] },
  { d:4,  m:'쿠팡비즈니스',    a:95000,   v:8636,   pm:'카드' as const, c:'F02', items:[{name:'위생장갑',qty:5,price:8000},{name:'주방세제',qty:3,price:5000},{name:'행주',qty:10,price:4000}] },
  { d:5,  m:'주류도매상',      a:295000,  v:26818,  pm:'이체' as const, c:'F01', items:[{name:'아사히 생맥주',qty:2,price:85000},{name:'사케',qty:5,price:25000}] },
  { d:8,  m:'노량진수산시장',  a:685000,  v:62272,  pm:'카드' as const, c:'F01', items:[{name:'연어',qty:6,price:38000},{name:'참치',qty:3,price:55000},{name:'새우',qty:5,price:28000},{name:'장어',qty:2,price:52000}] },
  { d:9,  m:'마포농산물시장',  a:132500,  v:12045,  pm:'현금' as const, c:'F01', items:[{name:'아보카도',qty:20,price:3500},{name:'레몬',qty:25,price:1200},{name:'대파',qty:5,price:2500}] },
  { d:10, m:'KT',              a:88000,   v:8000,   pm:'이체' as const, c:'F06', items:[{name:'인터넷+전화',qty:1,price:88000}] },
  { d:11, m:'마포축산',        a:172000,  v:15636,  pm:'카드' as const, c:'F01', items:[{name:'와규',qty:1,price:65000},{name:'닭고기',qty:3,price:8000},{name:'돈카츠용 돼지',qty:5,price:15000}] },
  { d:13, m:'꽃집 플로리안',   a:45000,   v:4090,   pm:'카드' as const, c:'F99', items:[{name:'화이트데이 테이블 꽃',qty:5,price:9000}] },
  { d:15, m:'노량진수산시장',  a:820000,  v:74545,  pm:'카드' as const, c:'F01', items:[{name:'연어',qty:8,price:40000},{name:'참치',qty:4,price:55000},{name:'새우',qty:5,price:28000},{name:'장어',qty:3,price:52000}] },
  { d:16, m:'마포농산물시장',  a:165000,  v:15000,  pm:'카드' as const, c:'F01', items:[{name:'양파',qty:15,price:3000},{name:'오이',qty:25,price:1500},{name:'아보카도',qty:15,price:4000}] },
  { d:17, m:'쿠팡비즈니스',    a:115000,  v:10454,  pm:'카드' as const, c:'F02', items:[{name:'포장 용기',qty:3,price:25000},{name:'일회용 젓가락',qty:2,price:15000},{name:'키친타올',qty:5,price:2000}] },
  { d:18, m:'마포축산',        a:195000,  v:17727,  pm:'카드' as const, c:'F01', items:[{name:'와규',qty:2,price:65000},{name:'돈카츠용 돼지',qty:5,price:15000}] },
  { d:19, m:'주류도매상',      a:320000,  v:29090,  pm:'이체' as const, c:'F01', items:[{name:'아사히 생맥주',qty:3,price:85000},{name:'하이볼 탄산수',qty:3,price:12000},{name:'사케',qty:1,price:25000}] },
  { d:20, m:'삼성화재',        a:180000,  v:0,      pm:'이체' as const, c:'F08', items:[{name:'화재/배상보험',qty:1,price:180000}] },
  { d:22, m:'노량진수산시장',  a:695000,  v:63181,  pm:'카드' as const, c:'F01', items:[{name:'연어',qty:5,price:42000},{name:'참치',qty:3,price:55000},{name:'새우',qty:4,price:28000},{name:'광어',qty:3,price:25000}] },
  { d:23, m:'마포농산물시장',  a:135000,  v:12272,  pm:'현금' as const, c:'F01', items:[{name:'아보카도',qty:15,price:4000},{name:'대파',qty:5,price:2500},{name:'무',qty:5,price:2500}] },
  { d:25, m:'마포축산',        a:148000,  v:13454,  pm:'카드' as const, c:'F01', items:[{name:'돈카츠용 돼지',qty:6,price:15000},{name:'닭고기',qty:3,price:8000},{name:'와규',qty:1,price:65000}] },
  { d:25, m:'쿠팡비즈니스',    a:65000,   v:5909,   pm:'카드' as const, c:'F02', items:[{name:'위생장갑',qty:5,price:8000},{name:'랩',qty:5,price:5000}] },
  { d:27, m:'건물주 박사장',   a:2500000, v:0,      pm:'이체' as const, c:'F09', items:[{name:'3월 임대료',qty:1,price:2500000}] },
  { d:28, m:'알바비 정산',     a:4200000, v:0,      pm:'이체' as const, c:'F10', items:[{name:'알바 3명 월급',qty:1,price:4200000}] },
  { d:29, m:'노량진수산시장',  a:625000,  v:56818,  pm:'카드' as const, c:'F01', items:[{name:'연어',qty:5,price:42000},{name:'새우',qty:4,price:28000},{name:'문어',qty:3,price:32000}] },
  { d:30, m:'주류도매상',      a:210000,  v:19090,  pm:'이체' as const, c:'F01', items:[{name:'아사히 생맥주',qty:2,price:85000},{name:'하이볼 탄산수',qty:2,price:12000}] },
]

// ── 리뷰 데이터 ──────────────────────────────────────────────────
const REVIEWS = [
  { pf:'배민',    r:5, c:'연어 진짜 신선하고 맛있어요! 밥도 적당히 따뜻하고 와사비도 직접 갈아주시는 것 같더라구요. 다음에 또 시킬게요', d:2,  st:'replied' },
  { pf:'네이버',  r:4, c:'분위기 좋고 맛도 괜찮았습니다. 다만 웨이팅이 좀 길었어요. 주말이라 그런 것 같긴 하지만...', d:3,  st:'replied' },
  { pf:'쿠팡이츠',r:5, c:'돈카츠 바삭바삭하고 소스도 맛있었어요. 배달도 빨리 왔고 포장도 깔끔!', d:5,  st:'replied' },
  { pf:'배민',    r:3, c:'맛은 괜찮은데 양이 좀 적어요. 가격 대비 아쉬운 부분이 있네요.', d:7,  st:'replied' },
  { pf:'요기요',  r:5, c:'사케동 진짜 미쳤습니다... 연어가 녹아요. 단골 됐어요!', d:8,  st:'replied' },
  { pf:'네이버',  r:5, c:'화이트데이에 여자친구랑 갔는데 분위기 너무 좋았어요. 오마카세 코스 강추합니다!', d:14, st:'replied' },
  { pf:'배민',    r:4, c:'항상 잘 먹고 있습니다. 새우튀김이 특히 맛있어요. 간장 소스가 짱!', d:15, st:'replied' },
  { pf:'쿠팡이츠',r:2, c:'배달 와서 열어보니 초밥이 다 뒤집어져 있었어요 ㅠㅠ 맛은 괜찮을 것 같은데 상태가...', d:16, st:'replied' },
  { pf:'네이버',  r:5, c:'점심 특선 가성비 미쳤어요. 우동+미니사케동 세트 강추!', d:17, st:'replied' },
  { pf:'배민',    r:5, c:'아보카도롤 너무 맛있어요!! 밥이랑 아보카도 비율이 완벽', d:19, st:'replied' },
  { pf:'요기요',  r:4, c:'장어덮밥 시켰는데 장어가 두툼하고 맛있었어요. 다만 밥이 좀 딱딱했어요.', d:20, st:'replied' },
  { pf:'네이버',  r:5, c:'벚꽃 시즌이라 테라스에서 먹었는데 분위기 최고였습니다. 사케 한 잔에 초밥... 힐링이에요.', d:21, st:'replied' },
  { pf:'배민',    r:4, c:'연어회 양도 많고 신선해요. 근데 와사비를 따로 안 넣어주셨어요 ㅠ', d:23, st:'replied' },
  { pf:'쿠팡이츠',r:5, c:'돈카츠 정식 시켰는데 미소시루까지 따뜻하게 왔어요. 감동...', d:25, st:'replied' },
  { pf:'배민',    r:1, c:'1시간 넘게 기다렸는데 결국 취소됐습니다. 매장 전화도 안 받으시고... 정말 실망이에요.', d:26, st:'pending' },
  { pf:'네이버',  r:4, c:'가족 모임으로 갔는데 다 맛있게 먹었어요. 아이 메뉴도 있어서 좋았습니다.', d:27, st:'replied' },
  { pf:'요기요',  r:5, c:'하이볼이랑 연어 초밥 조합 최고예요. 배달에서 이 맛이라니!', d:29, st:'replied' },
  { pf:'배민',    r:3, c:'맛은 OK인데 전에 비해 양이 줄은 것 같아요. 가격도 살짝 올랐고...', d:31, st:'pending' },
]

// 답글에 들어갈 리뷰 언급(mention) 텍스트
const MENTIONS = [
  '연어가 신선하다고 해주시니 정말 기쁩니다! 저희 연어는 매일 아침 노량진에서 직접 경매로 받아오고 있어요.',
  '분위기를 좋게 봐주셔서 감사합니다. 주말 웨이팅은 네이버 예약을 이용하시면 편하게 오실 수 있어요!',
  '돈카츠를 좋아해주셔서 감사해요! 매일 아침 직접 반죽하고 생빵가루만 사용합니다.',
  '양에 대한 의견 참고하겠습니다. 가격 대비 만족도를 높일 수 있도록 내부 검토하겠습니다.',
  '사케동을 사랑해주셔서 감사합니다! 연어는 자체 숙성 기법으로 감칠맛을 더하고 있어요.',
  '화이트데이에 특별한 시간 보내셨다니 정말 기쁩니다! 오마카세는 저희 셰프의 자부심이에요.',
  '새우튀김 칭찬 감사합니다! 간장 소스는 직접 담근 특제 소스랍니다.',
  '배달 과정에서 초밥이 흐트러진 점 정말 죄송합니다. 배달 포장 방식을 즉시 개선하겠습니다.',
  '점심 특선을 좋아해주셔서 감사해요! 매주 새로운 조합을 준비하고 있으니 자주 와주세요.',
  '아보카도롤 칭찬 감사합니다! 아보카도는 매일 적절한 숙성도를 확인하고 사용합니다.',
  '장어덮밥 칭찬 감사합니다! 밥 온도 관련해서 배달 보온 패키징을 개선하겠습니다.',
  '벚꽃 시즌에 테라스에서 즐거운 시간 보내셨다니 뿌듯합니다! 올해 테라스를 새로 꾸몄거든요.',
  '와사비를 빠뜨린 점 죄송합니다! 체크리스트를 강화해서 다시는 이런 일이 없도록 하겠습니다.',
  '미소시루까지 따뜻하게 잘 도착했다니 다행이에요! 보온 패키징에 특히 신경 쓰고 있습니다.',
  '', // pending
  '가족분들과 맛있게 드셨다니 감사합니다! 아이 메뉴는 매달 새롭게 업데이트하고 있어요.',
  '하이볼+초밥 조합을 알아봐주시다니! 다음엔 유자 하이볼도 추천드려요.',
  '', // pending
]

// ── 채널 분배 & 수수료 ──────────────────────────────────────────
function splitCh(total: number, day: number) {
  const we = isWk(day)
  const r = day === 14
    ? { 홀: 0.60, 배민: 0.17, 쿠팡이츠: 0.10, 요기요: 0.05, 포장: 0.08 }
    : we
      ? { 홀: 0.52, 배민: 0.20, 쿠팡이츠: 0.12, 요기요: 0.06, 포장: 0.10 }
      : { 홀: 0.42, 배민: 0.25, 쿠팡이츠: 0.15, 요기요: 0.08, 포장: 0.10 }
  const res: Record<string, number> = {}
  let rem = total
  const ent = Object.entries(r)
  for (let i = 0; i < ent.length - 1; i++) {
    const amt = jit(Math.round(total * ent[i][1]), 0.05)
    res[ent[i][0]] = amt; rem -= amt
  }
  res[ent[ent.length - 1][0]] = rem
  return res
}

function calcFee(ch: string, amt: number) {
  let pf = 0, df = 0, cf = 0, dc: number | null = null
  if (ch === '배민')      { dc = Math.round(amt / 30000); pf = Math.round(amt * 0.068); df = dc * 3000 }
  else if (ch === '쿠팡이츠') { dc = Math.round(amt / 28000); pf = Math.round(amt * 0.098) }
  else if (ch === '요기요')   { dc = Math.round(amt / 32000); pf = Math.round(amt * 0.125) }
  else if (ch === '홀')       { cf = Math.round(amt * 0.78 * 0.013) }
  else if (ch === '포장')     { cf = Math.round(amt * 0.85 * 0.013) }
  const tf = pf + df + cf
  return { delivery_count: dc, platform_fee: pf, delivery_fee: df, card_fee: cf, total_fee: tf, net_amount: amt - tf }
}

// ══════════════════════════════════════════════════════════════════
//  메인 시드 함수
// ══════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n========================================')
  console.log('  하루키 스시  데모 데이터 시드')
  console.log('========================================\n')

  // ────────────────── 기존 데모 데이터 정리 ──────────────────────
  console.log('[1/9] 기존 데모 데이터 정리...')
  const { data: { users } } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const old = users.find((u: any) => u.email === EMAIL)
  if (old) {
    const { data: stores } = await sb.from('sb_stores').select('id').eq('user_id', old.id)
    const sids = (stores || []).map((s: any) => s.id)
    for (const sid of sids) {
      await sb.from('sb_review_replies').delete().eq('store_id', sid)
      await sb.from('sb_reviews').delete().eq('store_id', sid)
      await sb.from('sb_weekly_briefings').delete().eq('store_id', sid)
      await sb.from('sb_receipts').delete().eq('store_id', sid)
      await sb.from('sb_order_recommendations').delete().eq('store_id', sid)
      await sb.from('sb_item_price_history').delete().eq('store_id', sid)
      await sb.from('sb_daily_orders').delete().eq('store_id', sid)
      await sb.from('sb_daily_usage').delete().eq('store_id', sid)
      await sb.from('sb_order_items').delete().eq('store_id', sid)
      await sb.from('sb_order_item_groups').delete().eq('store_id', sid)
      await sb.from('sb_daily_closing_channels').delete().eq('store_id', sid)
      await sb.from('sb_daily_closing').delete().eq('store_id', sid)
      await sb.from('sb_store_tone_settings').delete().eq('store_id', sid)
      await sb.from('sb_store_fee_settings').delete().eq('store_id', sid)
      await sb.from('sb_fee_channels').delete().eq('store_id', sid)
    }
    if (sids.length) await sb.from('sb_stores').delete().in('id', sids)
    await sb.from('sb_usage_logs').delete().eq('user_id', old.id)
    await sb.from('sb_activity_logs').delete().eq('user_id', old.id)
    await sb.from('sb_user_profiles').delete().eq('id', old.id)
    await sb.auth.admin.deleteUser(old.id)
    console.log('  -> 기존 데모 사용자 삭제 완료')
  } else {
    console.log('  -> 기존 데모 사용자 없음 (신규)')
  }

  // ────────────────── 계정 + 프로필 + 가게 ───────────────────────
  console.log('\n[2/9] 계정 / 프로필 / 가게 생성...')
  const { data: auth, error: authErr } = await sb.auth.admin.createUser({
    email: EMAIL, password: PW, email_confirm: true,
  })
  if (authErr || !auth.user) { console.error('ERR 계정 생성 실패:', authErr?.message); process.exit(1) }
  const userId = auth.user.id

  await sb.from('sb_user_profiles').insert({
    id: userId, display_name: '김하루', phone: '010-1234-5678',
    agreed_terms: true, onboarding_complete: true,
    plan: 'pro_plus', plan_expires_at: '2027-03-31T23:59:59+09:00',
  })

  const storeId = uid()
  await sb.from('sb_stores').insert({
    id: storeId, user_id: userId,
    store_name: STORE_NAME, business_type: '일식',
    address: '서울시 마포구 연남로 123', phone: '02-123-4567', is_default: true,
  })

  await sb.from('sb_store_fee_settings').insert({
    id: uid(), store_id: storeId,
    annual_revenue_tier: '3~5억', credit_card_rate: 1.5,
    check_card_rate: 1.0, check_card_ratio: 0.3, card_payment_ratio: 0.80,
  })

  await sb.from('sb_fee_channels').insert([
    { id: uid(), store_id: storeId, channel_name: '배민',     fee_type: 'percentage', rate: 6.8,  category: 'delivery', is_active: true, sort_order: 1 },
    { id: uid(), store_id: storeId, channel_name: '쿠팡이츠', fee_type: 'percentage', rate: 9.8,  category: 'delivery', is_active: true, sort_order: 2 },
    { id: uid(), store_id: storeId, channel_name: '요기요',   fee_type: 'percentage', rate: 12.5, category: 'delivery', is_active: true, sort_order: 3 },
    { id: uid(), store_id: storeId, channel_name: '배달대행', fee_type: 'fixed', fixed_amount: 3000, category: 'delivery_agency', is_active: true, sort_order: 4 },
  ])
  console.log(`  -> ${EMAIL} / ${PW}`)
  console.log(`  -> ${STORE_NAME} (Pro+)`)

  // ────────────────── 품목 그룹 + 품목 ───────────────────────────
  console.log('\n[3/9] 식재료 품목 등록...')
  const gids: string[] = []
  for (let i = 0; i < GROUPS.length; i++) {
    const gid = uid(); gids.push(gid)
    await sb.from('sb_order_item_groups').insert({
      id: gid, store_id: storeId, group_name: GROUPS[i], icon: GICONS[i], sort_order: i,
    })
  }

  const itemIds: string[] = []
  const allItemRows: any[] = []
  const allItemDefs = [
    ...TRACKED.map(t => ({ gi: t[0], n: t[1], u: t[2], p: t[3], oq: t[4], sl: t[5], sp: t[6] })),
    ...EXTRA.map(e =>   ({ gi: e[0], n: e[1], u: e[2], p: e[3], oq: e[4], sl: e[5], sp: e[6] })),
  ]
  for (let i = 0; i < allItemDefs.length; i++) {
    const iid = uid(); itemIds.push(iid)
    const it = allItemDefs[i]
    allItemRows.push({
      id: iid, store_id: storeId, group_id: gids[it.gi],
      item_name: it.n, unit: it.u, unit_price: it.p,
      default_order_qty: it.oq, shelf_life_days: it.sl,
      supplier_name: it.sp, is_active: true, sort_order: i,
    })
  }
  await sb.from('sb_order_items').insert(allItemRows)
  console.log(`  -> ${allItemRows.length}개 품목`)

  // ────────────────── 31일 마감 시뮬레이션 ───────────────────────
  console.log('\n[4/9] 3월 마감 데이터 시뮬레이션...')

  const WEATHER: Record<number, string> = { 10:'비', 17:'흐림', 24:'비', 30:'흐림' }
  const MEMOS: Record<number, string> = {
    7:'주말 웨이팅 평균 20분', 14:'화이트데이 커플 세트 인기 - 예약 마감',
    15:'벚꽃 시즌 시작, 테라스 석 만석', 21:'벚꽃 피크 - 예약 풀',
    26:'배민 주문 취소 1건 (품절)',
  }
  const ORDER_DAYS = new Set([1, 4, 8, 11, 15, 18, 22, 25, 29])
  const BASE = 1200000

  const closings: any[] = []
  const channels: any[] = []
  const usages: any[] = []
  const orders: any[] = []
  const recos: any[] = []
  const stock = TRACKED.map(t => t[4] * 1.5)

  for (let d = 1; d <= 31; d++) {
    const total = SALES[d]
    const chs = splitCh(total, d)
    const cid = uid()

    let totalFees = 0
    for (const [ch, amt] of Object.entries(chs)) {
      const f = calcFee(ch, amt)
      totalFees += f.total_fee
      channels.push({
        id: uid(), closing_id: cid, store_id: storeId,
        channel_name: ch, amount: amt,
        ratio: Math.round(amt / total * 1000) / 10,
        ...f,
      })
    }

    const cr = 0.78 + Math.random() * 0.06
    const tags: string[] = []
    if (isWk(d)) tags.push('주말')
    if (d === 14) tags.push('화이트데이')
    if (d >= 15 && d <= 25) tags.push('벚꽃시즌')
    if (WEATHER[d] === '비') tags.push('비')

    const dExp: { name: string; amount: number }[] = [{ name: '알바비', amount: rnd(150000, 200000) }]
    if (d === 3) dExp.push({ name: '가스비', amount: 225000 })
    if (d === 15) dExp.push({ name: '수도세', amount: 85000 })

    closings.push({
      id: cid, store_id: storeId, date: mdate(d),
      total_sales: total, card_ratio: Math.round(cr * 100) / 100,
      cash_ratio: Math.round((1 - cr) * 100) / 100,
      total_fees: totalFees, net_sales: total - totalFees,
      fee_rate: Math.round(totalFees / total * 10000) / 10000,
      memo: MEMOS[d] || null,
      input_mode: d % 7 === 0 ? 'voice' : d === 20 ? 'chat' : 'keypad',
      weather_tag: WEATHER[d] || '맑음',
      daily_expenses: dExp, tags,
    })

    // 일별 사용량 + 발주
    const scale = total / BASE
    for (let i = 0; i < TRACKED.length; i++) {
      const [, , , , oq, , sup, bu, wr] = TRACKED[i]
      const used = Math.round(bu * scale * (0.85 + Math.random() * 0.3) * 10) / 10
      const waste = Math.round(used * wr * (0.5 + Math.random()) * 10) / 10
      stock[i] -= (used + waste)

      if (ORDER_DAYS.has(d)) {
        stock[i] += oq
        orders.push({
          id: uid(), store_id: storeId, item_id: itemIds[i],
          date: mdate(d), order_qty: oq,
          unit_price_at_order: jit(TRACKED[i][3], 0.03),
          supplier_name: sup,
        })
      }
      if (stock[i] < 0) stock[i] = 0.5

      usages.push({
        id: uid(), store_id: storeId, item_id: itemIds[i],
        date: mdate(d), used_qty: used, waste_qty: waste,
        remaining_stock: Math.round(stock[i] * 10) / 10,
      })
    }

    // 발주 추천 (발주일 전날)
    if (ORDER_DAYS.has(d + 1)) {
      for (let i = 0; i < TRACKED.length; i++) {
        const eu = TRACKED[i][7]
        const urg = stock[i] < eu ? 'high' : stock[i] < eu * 2 ? 'medium' : 'low'
        recos.push({
          id: uid(), store_id: storeId, date: mdate(d), item_id: itemIds[i],
          current_stock: Math.round(stock[i] * 10) / 10,
          expected_usage: Math.round(eu * 10) / 10,
          recommended_qty: Math.round(urg === 'high' ? TRACKED[i][4] * 1.5 : TRACKED[i][4]),
          urgency: urg,
          reason: urg === 'high' ? '재고 부족 - 긴급 발주 필요' : urg === 'medium' ? '내일 소진 예상' : '정기 발주',
          is_confirmed: d < 25,
        })
      }
    }
  }

  // 배치 삽입
  const ins = async (table: string, rows: any[]) => {
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await sb.from(table).insert(rows.slice(i, i + 500))
      if (error) console.error(`  ERR ${table}:`, error.message)
    }
  }
  await ins('sb_daily_closing', closings)
  await ins('sb_daily_closing_channels', channels)
  await ins('sb_daily_usage', usages)
  await ins('sb_daily_orders', orders)
  await ins('sb_order_recommendations', recos)
  console.log(`  -> 마감 ${closings.length}일 / 채널 ${channels.length}건 / 사용량 ${usages.length}건`)
  console.log(`  -> 발주 ${orders.length}건 / 추천 ${recos.length}건`)

  // ────────────────── 가격 이력 ──────────────────────────────────
  console.log('\n[5/9] 가격 이력...')
  await sb.from('sb_item_price_history').insert([
    { id: uid(), store_id: storeId, item_id: itemIds[0], date: '2026-03-01', unit_price: 38000 },
    { id: uid(), store_id: storeId, item_id: itemIds[0], date: '2026-03-15', unit_price: 40000 },
    { id: uid(), store_id: storeId, item_id: itemIds[0], date: '2026-03-25', unit_price: 42000 },
    { id: uid(), store_id: storeId, item_id: itemIds[1], date: '2026-03-01', unit_price: 55000 },
    { id: uid(), store_id: storeId, item_id: itemIds[1], date: '2026-03-15', unit_price: 55000 },
    { id: uid(), store_id: storeId, item_id: itemIds[2], date: '2026-03-01', unit_price: 28000 },
    { id: uid(), store_id: storeId, item_id: itemIds[2], date: '2026-03-20', unit_price: 26500 },
    { id: uid(), store_id: storeId, item_id: itemIds[11], date: '2026-03-01', unit_price: 3500 },
    { id: uid(), store_id: storeId, item_id: itemIds[11], date: '2026-03-18', unit_price: 4000 },
  ])
  console.log('  -> 9건 (연어 가격 상승 스토리)')

  // ────────────────── 영수증 ─────────────────────────────────────
  console.log('\n[6/9] 영수증...')
  const { data: cats } = await sb.from('sb_receipt_categories').select('id, code').is('store_id', null)
  const catMap = new Map((cats || []).map((c: any) => [c.code, c.id]))

  await sb.from('sb_receipts').insert(RCPTS.map(r => ({
    id: uid(), store_id: storeId, date: mdate(r.d),
    merchant_name: r.m, total_amount: r.a, vat_amount: r.v,
    payment_method: r.pm,
    card_last_four: r.pm === '카드' ? String(rnd(1000, 9999)) : null,
    category_id: catMap.get(r.c) || null,
    items: r.items,
    ocr_confidence: Math.round((0.92 + Math.random() * 0.07) * 100) / 100,
  })))
  console.log(`  -> ${RCPTS.length}장`)

  // ────────────────── 리뷰 + 답글 ───────────────────────────────
  console.log('\n[7/9] 리뷰 + AI 답글...')
  const revInserts = REVIEWS.map(r => ({
    id: uid(), store_id: storeId, platform: r.pf,
    rating: r.r, content: r.c, reply_status: r.st,
    reviewed_at: `2026-03-${p2(r.d)}T${rnd(10, 21)}:${p2(rnd(0, 59))}:00+09:00`,
  }))
  await sb.from('sb_reviews').insert(revInserts)

  // 답글 생성
  const greets = ['안녕하세요, 하루키 스시입니다!', '안녕하세요! 하루키 스시 점장입니다.', '감사합니다! 하루키 스시입니다']
  const replyRows: any[] = []
  for (let i = 0; i < REVIEWS.length; i++) {
    if (REVIEWS[i].st !== 'replied') continue
    const rv = REVIEWS[i]
    const blocks: { type: string; text: string }[] = []

    blocks.push({ type: 'greeting', text: greets[i % greets.length] })

    if (rv.r >= 4) blocks.push({ type: 'empathy', text: ['이렇게 좋은 리뷰를 남겨주셔서 정말 감사합니다!', '소중한 리뷰 정말 감사드려요!', '따뜻한 리뷰에 힘이 납니다!'][i % 3] })
    else if (rv.r <= 2) blocks.push({ type: 'empathy', text: '먼저 불편을 드려 진심으로 죄송합니다.' })
    else blocks.push({ type: 'empathy', text: '솔직한 리뷰 감사드립니다.' })

    blocks.push({ type: 'mention', text: MENTIONS[i] })

    if (rv.r >= 4) blocks.push({ type: 'menu_detail', text: '저희 하루키 스시는 신선한 재료와 정성을 가장 중요하게 생각합니다.' })

    blocks.push({ type: 'response', text: rv.r >= 4 ? '앞으로도 더 맛있는 요리로 보답하겠습니다.' : rv.r <= 2 ? '말씀해주신 부분 즉시 개선하겠습니다. 내부 미팅에서 공유하였습니다.' : '말씀해주신 부분 참고하여 더 나은 서비스를 제공하겠습니다.' })
    blocks.push({ type: 'invitation', text: rv.r >= 4 ? '다음에 오시면 새로운 메뉴도 꼭 드셔보세요!' : '다시 방문해주시면 더 나은 서비스로 보답드리겠습니다.' })
    blocks.push({ type: 'closing', text: rv.r >= 4 ? '감사합니다! 또 뵙겠습니다' : '소중한 의견 감사합니다.' })

    replyRows.push({
      id: uid(), review_id: revInserts[i].id, store_id: storeId,
      blocks, full_text: blocks.map(b => b.text).join('\n\n'),
      version: 1, is_selected: true,
    })
  }
  await sb.from('sb_review_replies').insert(replyRows)

  // 톤 설정
  await sb.from('sb_store_tone_settings').insert({
    id: uid(), store_id: storeId, tone_name: '친근',
    sample_replies: ['감사합니다! 또 뵙겠습니다', '소중한 리뷰 감사드려요!'],
    store_name_display: '하루키 스시',
    signature_menus: ['연어 초밥', '사케동', '돈카츠 정식', '아보카도롤'],
    store_features: ['매일 노량진 경매 직접 매입', '생와사비 직접 제공', '연남동 테라스 벚꽃 뷰'],
    frequent_phrases: ['정성껏 준비하겠습니다', '또 뵙겠습니다', '감사합니다'],
    use_emoji: true,
  })
  console.log(`  -> 리뷰 ${REVIEWS.length}개, 답글 ${replyRows.length}개, 톤 설정 완료`)

  // ────────────────── 주간 브리핑 ────────────────────────────────
  console.log('\n[8/9] 주간 브리핑...')
  const WEEKS = [
    { s: 2, e: 8,  sd: '2026-03-02', ed: '2026-03-08' },
    { s: 9, e: 15, sd: '2026-03-09', ed: '2026-03-15' },
    { s: 16, e: 22, sd: '2026-03-16', ed: '2026-03-22' },
    { s: 23, e: 29, sd: '2026-03-23', ed: '2026-03-29' },
  ]
  const INSIGHTS = [
    '안정적인 첫 주입니다. 주말 매출이 평일의 약 2배로, 주말 운영 효율을 높이는 것이 핵심입니다.',
    '화이트데이 효과로 전주 대비 14.8% 매출 성장! 이벤트 데이 마케팅이 효과적입니다.',
    '벚꽃 시즌 피크 매출을 기록했습니다. 테라스 석 활용이 큰 역할을 했네요.',
    '매출이 전주 대비 하락했습니다. 벚꽃 시즌 종료 영향으로 보입니다. 4월 전략 수립이 필요합니다.',
  ]
  const FEE_INSIGHTS = [
    '배민 수수료 비중이 가장 높습니다. 홀 매출 비중을 높이면 전체 수수료율을 낮출 수 있어요.',
    '화이트데이 효과로 홀 매출이 크게 늘었습니다. 이벤트 데이에는 홀 집중이 효과적입니다.',
    '벚꽃 시즌 효과가 지속되고 있습니다. 테라스 석 프리미엄을 고려해보세요.',
    '매출 하락세입니다. 4월 전략으로 시즌 메뉴 교체를 검토해보세요.',
  ]

  let prevTotal: number | null = null
  for (let w = 0; w < WEEKS.length; w++) {
    const wk = WEEKS[w]
    let total = 0, bAmt = 0, wAmt = Infinity, bDay = '', wDay = ''
    const daily: any[] = []

    for (let d = wk.s; d <= wk.e; d++) {
      const a = SALES[d]; total += a
      daily.push({ day: DK[gdow(d)], amount: a, date: mdate(d) })
      if (a > bAmt) { bAmt = a; bDay = DK[gdow(d)] }
      if (a < wAmt) { wAmt = a; wDay = DK[gdow(d)] }
    }

    const nd = wk.e - wk.s + 1
    const fr = 0.055 + Math.random() * 0.01
    const tf = Math.round(total * fr)

    // 채널별 합산
    const chT: Record<string, number> = {}
    for (let d = wk.s; d <= wk.e; d++) {
      for (const [ch, a] of Object.entries(splitCh(SALES[d], d))) {
        chT[ch] = (chT[ch] || 0) + a
      }
    }

    // 주간 경비 합산
    let wExp = 0
    for (const r of RCPTS) { if (r.d >= wk.s && r.d <= wk.e) wExp += r.a }

    // 주간 리뷰
    const wRevs = REVIEWS.filter(r => r.d >= wk.s && r.d <= wk.e)
    const avgR = wRevs.length ? Math.round(wRevs.reduce((s, r) => s + r.r, 0) / wRevs.length * 10) / 10 : 0
    const replied = wRevs.filter(r => r.st === 'replied').length
    const best5 = wRevs.find(r => r.r === 5)

    await sb.from('sb_weekly_briefings').insert({
      id: uid(), store_id: storeId,
      week_start: wk.sd, week_end: wk.ed,
      sales_summary: {
        totalSales: total, netSales: total - tf,
        feeRate: Math.round(fr * 1000) / 10,
        dailyAvg: Math.round(total / nd),
        prevWeekTotal: prevTotal || 0,
        changeRate: prevTotal ? Math.round((total - prevTotal) / prevTotal * 1000) / 10 : 0,
        changeAmount: prevTotal ? total - prevTotal : 0,
        dailySales: daily,
        bestDay: { day: bDay, amount: bAmt },
        worstDay: { day: wDay, amount: wAmt },
        channelRatio: Object.entries(chT).map(([ch, a]) => ({ channel: ch, ratio: Math.round(a / total * 100) / 100 })),
        prevChannelRatio: Object.entries(chT).map(([ch, a]) => ({ channel: ch, ratio: Math.round(a / total * 100) / 100 + (Math.random() * 0.04 - 0.02) })),
      },
      fee_summary: {
        totalFees: tf,
        feeRate: Math.round(fr * 1000) / 10,
        prevFeeRate: Math.round((fr + Math.random() * 0.004 - 0.002) * 1000) / 10,
        channelFees: Object.entries(chT).map(([ch, a]) => {
          const r2 = ch === '배민' ? 0.068 : ch === '쿠팡이츠' ? 0.098 : ch === '요기요' ? 0.125 : 0.013
          return { channel: ch, amount: Math.round(a * r2), ratio: r2 }
        }),
        insight: FEE_INSIGHTS[w],
      },
      expense_summary: {
        totalExpense: wExp,
        costRate: Math.round(wExp / total * 1000) / 10,
        costRateNet: Math.round(wExp / (total - tf) * 1000) / 10,
        categories: [
          { label: '식재료비', amount: Math.round(wExp * 0.65), ratio: 65, color: '#ef4444' },
          { label: '인건비', amount: Math.round(wExp * 0.20), ratio: 20, color: '#f59e0b' },
          { label: '임차료', amount: Math.round(wExp * 0.10), ratio: 10, color: '#3b82f6' },
          { label: '기타', amount: Math.round(wExp * 0.05), ratio: 5, color: '#8b5cf6' },
        ],
        prevComparison: [{ label: '식재료비', diff: rnd(-5, 8) }, { label: '인건비', diff: 0 }],
        warning: w === 3 ? '연어 단가가 한달간 10.5% 상승했습니다. 대체 메뉴를 검토해보세요.' : null,
      },
      ingredient_efficiency: {
        wasteAmount: Math.round(total * 0.02),
        wasteRate: Math.round((2 + Math.random() * 1.5) * 10) / 10,
        prevWasteRate: Math.round((2.5 + Math.random()) * 10) / 10,
        accuracyRate: 88 + rnd(0, 8),
        prevAccuracyRate: 85 + rnd(0, 8),
        wasteTop3: [
          { name: '연어', amount: Math.round(total * 0.008), ratio: 40 },
          { name: '아보카도', amount: Math.round(total * 0.005), ratio: 25 },
          { name: '오이', amount: Math.round(total * 0.003), ratio: 15 },
        ],
        tip: w === 2 ? '연어 폐기율이 높습니다. 폐기 직전 연어로 "연어 타다키" 메뉴를 추가해보세요.' : null,
      },
      customer_reputation: {
        reviewCount: wRevs.length,
        prevReviewCount: Math.max(0, wRevs.length + rnd(-2, 2)),
        avgRating: avgR,
        prevAvgRating: Math.round((avgR + (Math.random() * 0.4 - 0.2)) * 10) / 10,
        replyRate: wRevs.length ? Math.round(replied / wRevs.length * 100) : 0,
        repliedCount: replied,
        totalCount: wRevs.length,
        positiveKeywords: ['신선', '맛있', '분위기', '친절', '가성비'],
        negativeKeywords: w === 3 ? ['양', '가격'] : ['웨이팅'],
        bestReview: best5 ? { content: best5.c, platform: best5.pf, rating: 5 } : null,
      },
      ai_coaching: {
        insight: INSIGHTS[w],
        actions: w === 3 ? [
          { title: '4월 시즌 메뉴 기획', description: '벚꽃 시즌 종료 후 새로운 봄 메뉴로 교체하세요. 봄 나물 초밥, 새우 텐동 등을 추천합니다.' },
          { title: '연어 원가 관리', description: '연어 단가가 38,000 -> 42,000원으로 상승 중입니다. 공급처 다변화 또는 대체 메뉴(참치, 광어)를 강화하세요.' },
          { title: '배달 리뷰 관리', description: '미답변 리뷰가 있습니다. 빠른 답변이 재주문율을 높입니다.' },
        ] : [
          { title: '주말 예약 시스템 최적화', description: '주말 웨이팅 시간을 줄이기 위해 네이버 예약 비율을 높여보세요.' },
          { title: '배달 포장 품질 개선', description: '초밥 배달 시 흐트러짐 방지를 위한 포장재를 검토해보세요.' },
        ],
        goals: w === 3
          ? ['4월 첫째 주 매출 1,000만원 목표', '미답변 리뷰 0건 유지', '연어 폐기율 8% 이하']
          : ['주간 매출 전주 대비 5% 성장', '리뷰 답변율 100% 유지', '식재료 폐기율 3% 이하'],
      },
    })
    prevTotal = total
  }
  console.log(`  -> ${WEEKS.length}주 브리핑`)

  // ────────────────── 4월 1~7일 데이터 (홈 화면용) ─────────────
  console.log('\n[+] 4월 1~7일 마감 데이터 추가 (홈 화면용)...')
  const APR_SALES: Record<number, number> = {
    1: 1020000, 2: 950000, 3: 1080000, 4: 1150000,
    5: 1380000, 6: 1850000, 7: 980000,
  }
  const aprClosings: any[] = []
  const aprChannels: any[] = []
  for (let d = 1; d <= 7; d++) {
    const total = APR_SALES[d]
    const chs2 = splitCh(total, new Date(2026, 3, d).getDay() === 0 || new Date(2026, 3, d).getDay() === 6 ? 7 : d) // reuse weekend check
    const cid2 = uid()
    let tf2 = 0
    for (const [ch, amt] of Object.entries(chs2)) {
      const f = calcFee(ch, amt)
      tf2 += f.total_fee
      aprChannels.push({
        id: uid(), closing_id: cid2, store_id: storeId,
        channel_name: ch, amount: amt,
        ratio: Math.round(amt / total * 1000) / 10, ...f,
      })
    }
    const cr2 = 0.78 + Math.random() * 0.06
    const aprDate = `2026-04-${p2(d)}`
    const aprTags: string[] = []
    const aprDow = new Date(2026, 3, d).getDay()
    if (aprDow === 0 || aprDow === 6) aprTags.push('주말')

    aprClosings.push({
      id: cid2, store_id: storeId, date: aprDate,
      total_sales: total,
      card_ratio: Math.round(cr2 * 100) / 100,
      cash_ratio: Math.round((1 - cr2) * 100) / 100,
      total_fees: tf2, net_sales: total - tf2,
      fee_rate: Math.round(tf2 / total * 10000) / 10000,
      memo: d === 7 ? '월요일 장사 시작' : null,
      input_mode: 'keypad', weather_tag: '맑음',
      daily_expenses: [{ name: '알바비', amount: rnd(150000, 200000) }],
      tags: aprTags,
    })
  }
  await ins('sb_daily_closing', aprClosings)
  await ins('sb_daily_closing_channels', aprChannels)
  console.log(`  -> 4월 마감 ${aprClosings.length}일 / 채널 ${aprChannels.length}건`)

  // ────────────────── 사용량 로그 + 활동 로그 ────────────────────
  console.log('\n[9/9] 사용량/활동 로그...')
  await sb.from('sb_usage_logs').insert([
    { id: uid(), user_id: userId, feature: 'ocr', month: '2026-03', count: 25 },
    { id: uid(), user_id: userId, feature: 'ai_reply', month: '2026-03', count: 16 },
    { id: uid(), user_id: userId, feature: 'ai_coaching', month: '2026-03', count: 4 },
    { id: uid(), user_id: userId, feature: 'closing_parse', month: '2026-03', count: 6 },
    { id: uid(), user_id: userId, feature: 'fee_tips', month: '2026-03', count: 3 },
    { id: uid(), user_id: userId, feature: 'forecast', month: '2026-03', count: 2 },
  ])

  const actLogs: any[] = [
    { id: uid(), user_id: userId, action: 'user_signup', metadata: {} },
    { id: uid(), user_id: userId, action: 'login', metadata: {} },
    { id: uid(), user_id: userId, action: 'store_created', metadata: { store_id: storeId } },
  ]
  for (let d = 1; d <= 31; d++) {
    actLogs.push({
      id: uid(), user_id: userId, action: 'closing_saved',
      metadata: { store_id: storeId, date: mdate(d) },
    })
  }
  await sb.from('sb_activity_logs').insert(actLogs)
  console.log(`  -> 사용량 6건, 활동 ${actLogs.length}건`)

  // ────────────────── 완료 ───────────────────────────────────────
  console.log('\n========================================')
  console.log('  시드 완료!')
  console.log('========================================')
  console.log(`\n  이메일:   ${EMAIL}`)
  console.log(`  비밀번호: ${PW}`)
  console.log(`  가게:     ${STORE_NAME}`)
  console.log(`  데이터:   2026년 3월 (31일)`)
  console.log(`  플랜:     Pro+`)
  console.log(`\n  총 생성: 마감 31일 / 채널 ${channels.length}건 / 영수증 ${RCPTS.length}장`)
  console.log(`           리뷰 ${REVIEWS.length}개 / 브리핑 4주 / 품목 ${allItemRows.length}개`)
  console.log(`           사용량 ${usages.length}건 / 발주 ${orders.length}건 / 추천 ${recos.length}건\n`)
}

main().catch(e => { console.error('ERR:', e); process.exit(1) })
