"use client";

import { useEffect, useRef, useCallback } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

/**
 * Cloudflare Turnstile 위젯
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY 미설정 시 렌더링 안 함
 */
export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return; // 이미 렌더링됨

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      theme: "auto",
      size: "flexible",
    });
  }, [siteKey, onVerify]);

  useEffect(() => {
    if (!siteKey) return;

    // 스크립트가 이미 로드됐으면 바로 렌더링
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // 스크립트 로드
    const existing = document.querySelector('script[src*="turnstile"]');
    if (!existing) {
      window.onTurnstileLoad = renderWidget;
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      document.head.appendChild(script);
    } else {
      // 스크립트 존재하지만 아직 로드 안 됨
      const check = setInterval(() => {
        if (window.turnstile) {
          clearInterval(check);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(check);
    }
  }, [siteKey, renderWidget]);

  // 키 미설정 시 렌더링 안 함
  if (!siteKey) return null;

  return <div ref={containerRef} className="flex justify-center my-2" />;
}
