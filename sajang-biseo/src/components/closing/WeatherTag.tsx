"use client";

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, Loader2 } from "lucide-react";

const WEATHER_ICONS: Record<string, typeof Sun> = {
  "맑음": Sun, "흐림": Cloud, "비옴": CloudRain, "눈/한파": Snowflake,
};

const WEATHER_TAGS = ["맑음", "흐림", "비옴", "눈/한파"];

interface WeatherTagProps {
  date: string;
  tags: string[];
  onAddTag: (tag: string) => void;
}

export function WeatherTag({ date, tags, onAddTag }: WeatherTagProps) {
  const [weather, setWeather] = useState<{ tag: string; temp?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const hasWeatherTag = tags.some((t) => WEATHER_TAGS.includes(t));

  // 날짜 변경 시 리셋
  useEffect(() => { setFetched(false); setWeather(null); }, [date]);

  useEffect(() => {
    if (hasWeatherTag || fetched) return;

    const targetDate = new Date(date + "T00:00:00");
    const daysDiff = Math.abs((Date.now() - targetDate.getTime()) / 86400000);
    if (daysDiff > 7) return; // 7일 이내만 자동 조회

    setLoading(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const params = new URLSearchParams({
            lat: String(pos.coords.latitude),
            lon: String(pos.coords.longitude),
          });
          if (date !== today) params.set("date", date);

          const res = await fetch(`/api/weather?${params}`);
          const data = await res.json();
          setWeather(data);
        } catch { /* ignore */ }
        setLoading(false);
        setFetched(true);
      },
      () => { setLoading(false); setFetched(true); },
      { timeout: 5000 }
    );
  }, [date, hasWeatherTag, fetched]);

  if (hasWeatherTag || (!loading && !weather)) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3 h-7 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-[13px]">
        <Loader2 size={12} className="animate-spin" /> 날씨 확인 중...
      </div>
    );
  }

  if (!weather) return null;

  const Icon = WEATHER_ICONS[weather.tag] ?? Cloud;

  return (
    <button
      onClick={() => onAddTag(weather.tag)}
      className="flex items-center gap-1.5 px-3 h-7 rounded-full text-[13px] font-medium
        bg-primary-500/10 text-primary-500 border border-primary-500/30
        hover:bg-primary-500/20 transition-all animate-fade-in press-effect"
    >
      <Icon size={13} />
      {weather.tag}{weather.temp != null ? ` ${Math.round(weather.temp)}°` : ""} 적용
    </button>
  );
}
