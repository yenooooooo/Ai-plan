"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/stores/useToast";

const ICON_MAP = {
  success: { icon: CheckCircle2, color: "text-success" },
  error: { icon: AlertCircle, color: "text-danger" },
  info: { icon: Info, color: "text-primary-500" },
};

export function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed top-14 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, color } = ICON_MAP[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto max-w-md w-full bg-[var(--bg-elevated)] border border-[var(--border-default)]
                rounded-xl px-4 py-3 shadow-lg flex items-center gap-3"
            >
              <Icon size={18} className={color} />
              <span className="flex-1 text-body-small text-[var(--text-primary)]">{toast.message}</span>
              <button
                onClick={() => remove(toast.id)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
