import { describe, it, expect } from "vitest";
import { formatCurrency, formatCompact, formatPercent, formatNumber } from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("기본 포맷 (₩ 포함)", () => {
    expect(formatCurrency(1_870_000)).toBe("₩1,870,000");
  });

  it("0원", () => {
    expect(formatCurrency(0)).toBe("₩0");
  });

  it("음수 금액", () => {
    expect(formatCurrency(-89810)).toBe("-₩89,810");
  });

  it("showSign 옵션 — 양수", () => {
    expect(formatCurrency(1000, { showSign: true })).toBe("+₩1,000");
  });

  it("showSign 옵션 — 0은 부호 없음", () => {
    expect(formatCurrency(0, { showSign: true })).toBe("₩0");
  });

  it("showSymbol false", () => {
    expect(formatCurrency(5000, { showSymbol: false })).toBe("5,000");
  });

  it("소수점 반올림", () => {
    expect(formatCurrency(1234.6)).toBe("₩1,235");
  });
});

describe("formatCompact", () => {
  it("만 단위", () => {
    expect(formatCompact(1_870_000)).toBe("187만");
  });

  it("억 단위", () => {
    expect(formatCompact(100_000_000)).toBe("1억");
  });

  it("억+만 단위", () => {
    expect(formatCompact(123_450_000)).toBe("1억 2,345만");
  });

  it("만 미만", () => {
    expect(formatCompact(5000)).toBe("5,000");
  });

  it("음수", () => {
    expect(formatCompact(-500_000)).toBe("-50만");
  });

  it("0", () => {
    expect(formatCompact(0)).toBe("0");
  });
});

describe("formatPercent", () => {
  it("기본 (소수 1자리)", () => {
    expect(formatPercent(4.8)).toBe("4.8%");
  });

  it("showSign 양수", () => {
    expect(formatPercent(12.34, { showSign: true })).toBe("+12.3%");
  });

  it("showSign 음수", () => {
    expect(formatPercent(-5.6, { showSign: true })).toBe("-5.6%");
  });

  it("소수점 자릿수 지정", () => {
    expect(formatPercent(3.456, { decimals: 2 })).toBe("3.46%");
  });
});

describe("formatNumber", () => {
  it("천 단위 쉼표", () => {
    expect(formatNumber(1870000)).toBe("1,870,000");
  });

  it("소수점 반올림", () => {
    expect(formatNumber(1234.5)).toBe("1,235");
  });
});
