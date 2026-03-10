"use client";

import { Mic, MicOff, Volume2 } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface VoiceInputProps {
  onResult: (amount: number) => void;
}

export function VoiceInput({ onResult }: VoiceInputProps) {
  const { isListening, transcript, startListening, stopListening, supported } =
    useVoiceInput(onResult);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`h-10 px-4 rounded-xl text-body-small font-medium flex items-center gap-2 press-effect transition-all ${
          isListening
            ? "bg-danger/10 text-danger border border-danger/30 animate-pulse"
            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 border border-transparent"
        }`}
      >
        {isListening ? (
          <><MicOff size={16} />중지</>
        ) : (
          <><Mic size={16} />음성 입력</>
        )}
      </button>
      {isListening && transcript && (
        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500/5 text-body-small">
          <Volume2 size={14} className="text-primary-500 animate-pulse" />
          <span className="text-[var(--text-secondary)]">{transcript}</span>
        </div>
      )}
    </div>
  );
}
