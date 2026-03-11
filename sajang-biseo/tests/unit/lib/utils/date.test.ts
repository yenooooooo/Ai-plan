import { describe, it, expect } from "vitest";
import {
  toDateString, getDayName, getDayNameFull, formatDateShort,
  formatDateFull, formatDateMedium, parseDate, diffDays, addDays,
  getThisWeekRange, getThisMonthRange, getWeekStart,
} from "@/lib/utils/date";

describe("toDateString", () => {
  it("Date를 YYYY-MM-DD로 변환", () => {
    expect(toDateString(new Date(2025, 2, 15))).toBe("2025-03-15");
  });

  it("월/일 zero-pad", () => {
    expect(toDateString(new Date(2025, 0, 5))).toBe("2025-01-05");
  });
});

describe("parseDate", () => {
  it("YYYY-MM-DD를 Date로 파싱", () => {
    const d = parseDate("2025-03-15");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(2); // 0-based
    expect(d.getDate()).toBe(15);
  });
});

describe("getDayName / getDayNameFull", () => {
  it("토요일", () => {
    const sat = new Date(2025, 2, 15); // 2025-03-15 = 토
    expect(getDayName(sat)).toBe("토");
    expect(getDayNameFull(sat)).toBe("토요일");
  });

  it("일요일", () => {
    const sun = new Date(2025, 2, 16);
    expect(getDayName(sun)).toBe("일");
  });
});

describe("formatDateShort", () => {
  it("3/15 (토) 형식", () => {
    expect(formatDateShort(new Date(2025, 2, 15))).toBe("3/15 (토)");
  });
});

describe("formatDateFull", () => {
  it("2025년 3월 15일 (토) 형식", () => {
    expect(formatDateFull(new Date(2025, 2, 15))).toBe("2025년 3월 15일 (토)");
  });
});

describe("formatDateMedium", () => {
  it("3월 15일 형식", () => {
    expect(formatDateMedium(new Date(2025, 2, 15))).toBe("3월 15일");
  });
});

describe("diffDays", () => {
  it("같은 날 = 0", () => {
    const d = new Date(2025, 2, 15);
    expect(diffDays(d, d)).toBe(0);
  });

  it("3일 차이", () => {
    const a = new Date(2025, 2, 10);
    const b = new Date(2025, 2, 13);
    expect(diffDays(a, b)).toBe(3);
  });

  it("음수 차이", () => {
    const a = new Date(2025, 2, 15);
    const b = new Date(2025, 2, 10);
    expect(diffDays(a, b)).toBe(-5);
  });
});

describe("addDays", () => {
  it("7일 후", () => {
    const result = addDays(new Date(2025, 2, 15), 7);
    expect(result.getDate()).toBe(22);
  });

  it("월 넘김", () => {
    const result = addDays(new Date(2025, 2, 30), 3);
    expect(result.getMonth()).toBe(3); // 4월
    expect(result.getDate()).toBe(2);
  });
});

describe("getThisWeekRange", () => {
  it("수요일 기준 → 월~일", () => {
    const wed = new Date(2025, 2, 12); // 수요일
    const { start, end } = getThisWeekRange(wed);
    expect(start.getDay()).toBe(1); // 월요일
    expect(end.getDay()).toBe(0); // 일요일
    expect(diffDays(start, end)).toBe(6);
  });

  it("일요일 기준", () => {
    const sun = new Date(2025, 2, 16);
    const { start } = getThisWeekRange(sun);
    expect(start.getDate()).toBe(10); // 그 주 월요일
  });
});

describe("getThisMonthRange", () => {
  it("3월 범위", () => {
    const { start, end } = getThisMonthRange(new Date(2025, 2, 15));
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(31);
  });

  it("2월 범위 (윤년 아닌 해)", () => {
    const { end } = getThisMonthRange(new Date(2025, 1, 10));
    expect(end.getDate()).toBe(28);
  });
});

describe("getWeekStart", () => {
  it("수요일의 주 시작 = 월요일", () => {
    const wed = new Date(2025, 2, 12);
    const monday = getWeekStart(wed);
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(10);
  });
});
