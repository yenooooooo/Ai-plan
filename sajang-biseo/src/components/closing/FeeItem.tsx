"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Pencil, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { FeeBreakdown } from "@/lib/fees/calculator";

type EditTarget = "platform" | "delivery" | "card";

interface SubItemProps {
  label: string;
  rateDisplay: string;
  feeAmount: number;
  editTarget: EditTarget;
  editing: EditTarget | null;
  editValue: string;
  isFixed?: boolean;
  onEdit: () => void;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function SubItem({ label, rateDisplay, feeAmount, editTarget, editing, editValue, isFixed, onEdit, onChange, onConfirm, onCancel }: SubItemProps) {
  const isEditing = editing === editTarget;
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-caption text-[var(--text-tertiary)] shrink-0">{label}</span>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={editValue}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onConfirm(); if (e.key === "Escape") onCancel(); }}
              autoFocus
              className="w-16 text-right rounded-md px-1.5 py-0.5
                bg-[var(--bg-elevated)] border border-primary-500
                text-caption font-display text-primary-500 outline-none"
            />
            <span className="text-caption text-[var(--text-tertiary)]">{isFixed ? "원/건" : "%"}</span>
            <button onClick={onConfirm} className="text-[var(--net-income)] hover:opacity-70 transition-opacity">
              <Check size={12} />
            </button>
            <button onClick={onCancel} className="text-[var(--text-tertiary)] hover:opacity-70 transition-opacity">
              <X size={12} />
            </button>
          </div>
        ) : (
          <button onClick={onEdit} className="flex items-center gap-1 group">
            <span className="text-caption font-display text-primary-500/80">{rateDisplay}</span>
            <Pencil size={10} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
      <span className="text-caption font-display text-[var(--fee-deducted)] tabular-nums shrink-0">
        -{formatCurrency(feeAmount, { showSymbol: false })}
      </span>
    </div>
  );
}

interface FeeItemProps {
  item: FeeBreakdown;
  onPlatformRateChange?: (channel: string, rate: number) => void;
  onDeliveryFeeChange?: (amount: number) => void;
  onCardRateChange?: (rate: number) => void;
  readOnly?: boolean;
}

export function FeeItem({ item, onPlatformRateChange, onDeliveryFeeChange, onCardRateChange, readOnly = false }: FeeItemProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [editValue, setEditValue] = useState("");
  const hasFees = item.totalFee > 0;

  const startEdit = (target: EditTarget, value: string) => {
    if (readOnly) return;
    setEditing(target);
    setEditValue(value);
  };

  const confirmEdit = () => {
    const num = parseFloat(editValue);
    if (isNaN(num) || num < 0) { setEditing(null); return; }
    if (editing === "platform" && onPlatformRateChange) onPlatformRateChange(item.channel, num);
    if (editing === "delivery" && onDeliveryFeeChange) onDeliveryFeeChange(Math.round(num));
    if (editing === "card" && onCardRateChange) onCardRateChange(num);
    setEditing(null);
  };

  const sharedProps = { editing, editValue, onChange: setEditValue, onConfirm: confirmEdit, onCancel: () => setEditing(null) };

  return (
    <div>
      <button
        onClick={() => hasFees && setOpen(!open)}
        className={`w-full flex items-center justify-between py-2 ${hasFees ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-center gap-2">
          {hasFees && (
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
            </motion.div>
          )}
          <span className="text-body-small text-[var(--text-primary)]">{item.channel}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-body-small font-display text-[var(--text-secondary)] tabular-nums">
            {formatCurrency(item.amount, { showSymbol: false })}
          </span>
          {hasFees && (
            <span className="text-body-small font-display text-[var(--fee-deducted)] tabular-nums">
              -{formatCurrency(item.totalFee, { showSymbol: false })}
            </span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && hasFees && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pb-2 space-y-1.5 border-l-2 border-[var(--border-subtle)] ml-2 mb-1">
              {item.platformFee > 0 && (
                <SubItem
                  label="중개수수료"
                  rateDisplay={`${item.platformFeeRate ?? 0}%`}
                  feeAmount={item.platformFee}
                  editTarget="platform"
                  onEdit={() => startEdit("platform", String(item.platformFeeRate ?? 0))}
                  {...sharedProps}
                />
              )}
              {item.deliveryAgencyFee > 0 && (
                <SubItem
                  label="배달대행"
                  rateDisplay={`₩${(item.deliveryFeePerOrder ?? 0).toLocaleString("ko-KR")}/건`}
                  feeAmount={item.deliveryAgencyFee}
                  editTarget="delivery"
                  isFixed
                  onEdit={() => startEdit("delivery", String(item.deliveryFeePerOrder ?? 0))}
                  {...sharedProps}
                />
              )}
              {item.cardFee > 0 && (
                <SubItem
                  label="카드수수료"
                  rateDisplay={`${item.cardCreditRate ?? 0}%`}
                  feeAmount={item.cardFee}
                  editTarget="card"
                  onEdit={() => startEdit("card", String(item.cardCreditRate ?? 0))}
                  {...sharedProps}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
