"use client";

import { useRef, useEffect } from "react";
import type { ChatMode } from "@/lib/types";

interface InputAreaProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  mode: ChatMode;
  activeModel: string;
  models: string[];
  onSelectModel: (m: string) => void;
}

export default function InputArea({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  mode,
  activeModel,
  models,
  onSelectModel,
}: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="border-t border-white/[0.06] bg-black/50 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 transition focus-within:border-white/20 focus-within:bg-white/[0.04]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Send a message…"
            className="max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-white/30"
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
              aria-label="Stop generating"
            >
              <span className="h-3 w-3 rounded-[3px] bg-white" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!canSend}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black transition enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-20"
              aria-label="Send message"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <span className="font-mono text-[10px] text-white/25">
            <kbd className="rounded border border-white/[0.06] bg-white/[0.04] px-1 py-0.5">
              Enter
            </kbd>{" "}
            send ·{" "}
            <kbd className="rounded border border-white/[0.06] bg-white/[0.04] px-1 py-0.5">
              Shift+Enter
            </kbd>{" "}
            newline
          </span>
          {mode === "local" ? (
            <span className="font-mono text-[10px] text-white/25">local</span>
          ) : models.length === 0 ? (
            <span className="font-mono text-[10px] text-white/25">no model</span>
          ) : (
            <div className="relative inline-flex items-center">
              <select
                value={activeModel && models.includes(activeModel) ? activeModel : models[0]}
                onChange={(e) => onSelectModel(e.target.value)}
                className="max-w-[40vw] cursor-pointer appearance-none bg-transparent py-0.5 pl-1 pr-4 font-mono text-[10px] text-white/60 outline-none [&>option]:bg-[#0c0c0c]"
                title="Select model"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white/30"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
