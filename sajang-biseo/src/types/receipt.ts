/** 영수증 데이터 */
export interface Receipt {
  id: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  merchantName: string;
  totalAmount: number;
  vatAmount: number | null;
  paymentMethod: "카드" | "현금" | "이체";
  cardLastFour: string | null;
  categoryCode: string;
  categoryLabel: string;
  items: ReceiptItem[] | null;
  imageUrl: string | null;
  ocrConfidence: number; // 0~1
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 영수증 품목 내역 */
export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
