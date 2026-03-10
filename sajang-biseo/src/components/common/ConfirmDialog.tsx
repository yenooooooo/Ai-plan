"use client";

import { motion } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message,
  confirmLabel = "확인", cancelLabel = "취소",
  danger, onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-5 max-w-[320px] w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="text-caption text-[var(--text-secondary)]">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)]">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-body-small font-medium text-white ${danger ? "bg-danger" : "bg-primary-500"}`}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
