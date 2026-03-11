"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta < 0) { pulling.current = false; setPullDistance(0); return; }
    // Dampen the pull distance
    const dampened = Math.min(MAX_PULL, delta * 0.4);
    setPullDistance(dampened);
    if (dampened > 10) e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);
      window.location.reload();
    } else {
      setPullDistance(0);
    }
  }, [pullDistance]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(1, pullDistance / THRESHOLD);
  const showIndicator = pullDistance > 10 || refreshing;

  return (
    <div ref={containerRef} className="relative">
      {/* 인디케이터 */}
      {showIndicator && (
        <div
          className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none"
          style={{ top: `${pullDistance - 40}px` }}
        >
          <div className={`w-9 h-9 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-md flex items-center justify-center ${
            refreshing ? "animate-spin" : ""
          }`}>
            <RefreshCw
              size={16}
              className={`transition-colors ${progress >= 1 ? "text-primary-500" : "text-[var(--text-tertiary)]"}`}
              style={{ transform: `rotate(${progress * 360}deg)`, transition: refreshing ? "none" : "transform 0.1s" }}
            />
          </div>
        </div>
      )}

      {/* 콘텐츠 */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pulling.current ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
