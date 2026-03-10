"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, ScanBarcode, Package } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

interface StockReceivingProps {
  items: DBOrderItem[];
  onReceive: (entries: { itemId: string; qty: number }[]) => void;
  receiving: boolean;
}

export function StockReceiving({ items, onReceive, receiving }: StockReceivingProps) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [entries, setEntries] = useState<{ itemId: string; qty: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeItems = items.filter((i) => i.is_active && !i.deleted_at);

  const addEntry = () => {
    setEntries((prev) => [...prev, { itemId: activeItems[0]?.id ?? "", qty: "" }]);
  };

  const updateEntry = (idx: number, field: "itemId" | "qty", value: string) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const validEntries = entries
      .filter((e) => e.itemId && parseFloat(e.qty) > 0)
      .map((e) => ({ itemId: e.itemId, qty: parseFloat(e.qty) }));
    if (validEntries.length === 0) return;
    onReceive(validEntries);
    setEntries([]);
    setOpen(false);
  };

  // 바코드 스캐너
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      detectBarcode();
    } catch {
      setScanning(false);
    }
  };

  const detectBarcode = useCallback(async () => {
    if (!videoRef.current || !streamRef.current) return;

    // BarcodeDetector API (Chrome, Safari 17.2+)
    if ("BarcodeDetector" in window) {
      const detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({
        formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code"],
      });

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            setScannedCode(barcodes[0].rawValue);
            stopCamera();
            return;
          }
        } catch { /* continue scanning */ }
        if (streamRef.current) requestAnimationFrame(scan);
      };
      requestAnimationFrame(scan);
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); addEntry(); }}
        className="w-full glass-card p-4 flex items-center gap-3 press-effect hover:border-primary-500/20 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
          <Package size={18} className="text-success" />
        </div>
        <div className="text-left">
          <p className="text-body-small font-medium text-[var(--text-primary)]">입고 처리</p>
          <p className="text-caption text-[var(--text-tertiary)]">받은 식자재 수량을 입력하세요</p>
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-success" />
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">입고 처리</h3>
        </div>
        <div className="flex items-center gap-2">
          {"BarcodeDetector" in window && !scanning && (
            <button
              onClick={startScanner}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-caption text-[var(--text-secondary)] hover:text-primary-500 transition-colors"
            >
              <ScanBarcode size={14} />스캔
            </button>
          )}
          <button onClick={() => { setOpen(false); stopCamera(); setEntries([]); }} className="p-1 text-[var(--text-tertiary)]">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 바코드 스캐너 */}
      <AnimatePresence>
        {scanning && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden mb-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-32 border-2 border-white/50 rounded-lg" />
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 스캔 결과 */}
      {scannedCode && (
        <div className="mb-3 p-2.5 rounded-lg bg-success/5 border border-success/20">
          <p className="text-caption text-success font-medium">바코드: {scannedCode}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">아래에서 해당 품목을 선택하세요</p>
        </div>
      )}

      {/* 입고 항목 */}
      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              value={entry.itemId}
              onChange={(e) => updateEntry(idx, "itemId", e.target.value)}
              className="flex-1 h-9 px-2 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] outline-none"
            >
              <option value="">품목 선택</option>
              {activeItems.map((item) => (
                <option key={item.id} value={item.id}>{item.item_name} ({item.unit})</option>
              ))}
            </select>
            <input
              type="text"
              inputMode="decimal"
              value={entry.qty}
              onChange={(e) => updateEntry(idx, "qty", e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="수량"
              className="w-20 h-9 px-2 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-right font-display text-[var(--text-primary)] outline-none"
            />
            <button onClick={() => removeEntry(idx)} className="p-1 text-[var(--text-tertiary)] hover:text-danger">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={addEntry}
          className="flex-1 h-9 rounded-lg border border-dashed border-[var(--border-default)] text-caption text-[var(--text-tertiary)]
            hover:text-primary-500 hover:border-primary-500/30 flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={13} />항목 추가
        </button>
        <button
          onClick={handleSubmit}
          disabled={receiving || entries.every((e) => !e.itemId || !e.qty)}
          className="flex-1 h-9 rounded-lg bg-success text-white text-body-small font-medium flex items-center justify-center gap-1
            disabled:opacity-40 press-effect"
        >
          {receiving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Check size={14} />입고 확인</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
