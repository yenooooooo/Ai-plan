"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface StorageImageProps {
  url: string;
  alt: string;
  className?: string;
}

/** Supabase Storage 이미지를 signed URL로 로드 */
export function StorageImage({ url, alt, className }: StorageImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const match = url.match(/\/sajang-receipts\/(.+)$/);
    if (!match) { setSignedUrl(url); return; }
    const supabase = createClient();
    supabase.storage.from("sajang-receipts").createSignedUrl(match[1], 3600)
      .then(({ data }) => { setSignedUrl(data?.signedUrl ?? url); });
  }, [url]);

  if (!signedUrl) {
    return <div className={`${className} bg-[var(--bg-tertiary)] animate-pulse`} />;
  }

  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={signedUrl} alt={alt} className={className} />;
}
