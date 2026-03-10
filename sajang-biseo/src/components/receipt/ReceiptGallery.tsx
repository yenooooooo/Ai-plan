"use client";

import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { Receipt } from "@/lib/supabase/types";

interface ReceiptGalleryProps {
  receipts: Receipt[];
  onItemClick: (receipt: Receipt) => void;
}

export function ReceiptGallery({ receipts, onItemClick }: ReceiptGalleryProps) {
  const withImages = receipts.filter((r) => r.image_url);

  if (withImages.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <ImageIcon size={32} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
        <p className="text-body-small text-[var(--text-secondary)]">영수증 이미지가 없습니다</p>
        <p className="text-caption text-[var(--text-tertiary)] mt-1">촬영 탭에서 영수증을 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {withImages.map((receipt, i) => (
        <motion.button
          key={receipt.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onItemClick(receipt)}
          className="relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-tertiary)] press-effect group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receipt.image_url!}
            alt={receipt.merchant_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
            <p className="text-[10px] text-white/90 font-medium truncate">{receipt.merchant_name}</p>
            <p className="text-[9px] text-white/70 font-display">{formatCurrency(receipt.total_amount)}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
