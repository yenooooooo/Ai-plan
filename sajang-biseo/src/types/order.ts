/** 발주 품목 */
export interface OrderItem {
  id: string;
  storeId: string;
  name: string;
  unit: string; // kg, 팩, 박스, 개, 망, 판, 병, 포
  unitPrice: number | null;
  defaultOrderQty: number;
  shelfLifeDays: number | null;
  supplierName: string | null;
  supplierContact: string | null;
  categoryGroup: string;
  isActive: boolean;
  createdAt: string;
}

/** 일일 사용량 */
export interface DailyUsage {
  id: string;
  storeId: string;
  itemId: string;
  date: string; // YYYY-MM-DD
  usedQty: number;
  wasteQty: number;
  remainingStock: number;
  createdAt: string;
}

/** AI 발주 추천 */
export interface OrderRecommendation {
  itemId: string;
  itemName: string;
  unit: string;
  currentStock: number;
  expectedUsage: number;
  recommendedQty: number;
  urgency: "high" | "medium" | "low";
  reason: string;
}
