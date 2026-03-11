"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { validateImage, resizeImage } from "@/lib/receipt/imageUtils";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";

interface ReceiptCaptureProps {
  onCaptured: (storageUrl: string, previewUrl: string) => void;
}

export function ReceiptCapture({ onCaptured }: ReceiptCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { storeId } = useStoreSettings();

  async function handleFile(file: File) {
    setError(null);
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error ?? "잘못된 파일입니다");
      return;
    }

    setUploading(true);
    try {
      // 리사이즈
      const resized = await resizeImage(file);

      // Supabase Storage에 업로드
      const supabase = createClient();
      const ext = "jpg";
      const path = `${storeId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("sajang-receipts")
        .upload(path, resized, { contentType: "image/jpeg" });

      if (uploadError) {
        setError("업로드에 실패했습니다");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("sajang-receipts")
        .getPublicUrl(path);

      const previewUrl = URL.createObjectURL(resized);
      onCaptured(urlData.publicUrl, previewUrl);
    } catch {
      setError("이미지 처리에 실패했습니다");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.[0]) handleFile(files[0]);
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      {/* 촬영/선택 버튼 */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 press-effect disabled:opacity-50"
        >
          <Camera size={28} />
          <span className="text-body-small font-medium">카메라 촬영</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-secondary)] press-effect disabled:opacity-50"
        >
          <ImageIcon size={28} />
          <span className="text-body-small font-medium">갤러리 선택</span>
        </motion.button>
      </div>

      {/* 히든 인풋 */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/heic"
        multiple
        onChange={onFileChange}
        className="hidden"
      />

      {/* 상태 */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-3 text-primary-500"
          >
            <Loader2 size={18} className="animate-spin" />
            <span className="text-body-small">이미지 처리 중...</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 py-2 px-3 rounded-xl bg-danger/10 text-danger"
          >
            <X size={14} />
            <span className="text-caption">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
