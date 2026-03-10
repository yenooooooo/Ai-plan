"use client";

import { useState, useCallback, useRef } from "react";

/** 한국어 음성을 숫자 금액으로 파싱 */
function parseAmount(text: string): number | null {
  const cleaned = text.replace(/\s+/g, "");

  // "35만원", "120만", "5천원", "8백만원" 패턴
  const unitMatch = cleaned.match(/^(\d+)(억|천만|백만|십만|만|천|백)?(원)?$/);
  if (unitMatch) {
    const num = parseInt(unitMatch[1]);
    const unit = unitMatch[2];
    const multipliers: Record<string, number> = {
      "억": 100000000, "천만": 10000000, "백만": 1000000,
      "십만": 100000, "만": 10000, "천": 1000, "백": 100,
    };
    return num * (multipliers[unit] ?? 1);
  }

  // 순수 숫자만 추출
  const digits = cleaned.replace(/[^0-9]/g, "");
  if (digits.length > 0) {
    const val = parseInt(digits);
    if (val > 0) return val;
  }

  return null;
}

export function useVoiceInput(onResult: (amount: number) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!supported) return;

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      setTranscript(result[0].transcript);

      if (result.isFinal) {
        const amount = parseAmount(result[0].transcript);
        if (amount !== null && amount > 0) onResult(amount);
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, [supported, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, startListening, stopListening, supported };
}
