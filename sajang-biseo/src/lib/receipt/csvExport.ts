/**
 * 영수증 CSV 내보내기
 */

import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface ExportRow {
  날짜: string;
  가맹점명: string;
  금액: number;
  부가세: number | null;
  결제수단: string;
  카테고리: string;
  세무항목: string;
  메모: string;
}

/** 영수증 데이터 → CSV 문자열 */
export function receiptsToCsv(
  receipts: Receipt[],
  categories: ReceiptCategory[]
): string {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const rows: ExportRow[] = receipts.map((r) => {
    const cat = r.category_id ? catMap.get(r.category_id) : null;
    return {
      날짜: r.date,
      가맹점명: r.merchant_name,
      금액: r.total_amount,
      부가세: r.vat_amount,
      결제수단: r.payment_method,
      카테고리: cat?.label ?? "미분류",
      세무항목: cat?.tax_item ?? "",
      메모: r.memo ?? "",
    };
  });

  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]) as (keyof ExportRow)[];
  const csvLines = [
    // BOM for Korean Excel compatibility
    "\uFEFF" + headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val);
        })
        .join(",")
    ),
  ];

  return csvLines.join("\n");
}

/** CSV 다운로드 트리거 */
export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
