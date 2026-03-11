"use client";

import { useState, useEffect } from "react";
import { Share, X } from "lucide-react";

/** iOS Safari에서 '홈 화면에 추가' 안내 배너 */
export function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 이미 standalone(설치됨) 이면 표시 안 함
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // iOS Safari 체크
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
    if (!isIOS || !isSafari) return;

    // 하루에 한 번만 표시
    const dismissed = localStorage.getItem("ios-install-dismissed");
    if (dismissed) {
      const diff = Date.now() - Number(dismissed);
      if (diff < 24 * 60 * 60 * 1000) return;
    }

    setShow(true);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem("ios-install-dismissed", String(Date.now()));
    setShow(false);
  };

  return (
    <div className="fixed bottom-[5.5rem] left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300 lg:hidden">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-4 shadow-xl">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-[var(--text-tertiary)]"
        >
          <X size={16} />
        </button>

        <p className="text-body-small font-semibold text-[var(--text-primary)] mb-2">
          앱처럼 사용하기
        </p>
        <p className="text-caption text-[var(--text-secondary)] leading-relaxed">
          Safari 하단의{" "}
          <Share size={14} className="inline -mt-0.5 text-[var(--text-accent)]" />{" "}
          공유 버튼을 누른 뒤{" "}
          <span className="font-medium text-[var(--text-primary)]">
            &ldquo;홈 화면에 추가&rdquo;
          </span>
          를 선택하세요.
        </p>
      </div>
    </div>
  );
}
