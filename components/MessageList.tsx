"use client";

import { useEffect, useRef } from "react";
import type { Conversation } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  conversation: Conversation | null;
  isStreaming: boolean;
}

export default function MessageList({
  conversation,
  isStreaming,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative mb-7">
          <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/95 to-white/40 shadow-2xl">
            <span className="font-mono text-2xl font-bold text-black">L</span>
          </div>
        </div>

        <h1 className="mb-2.5 text-2xl font-semibold tracking-tight text-white">
          How can I help you?
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-white/40">
          Connected to your local{" "}
          <span className="font-mono text-white/55">llama.cpp</span> server or
          an OpenAI-compatible endpoint. Conversations stay on your machine.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {["Explain a concept", "Write some code", "Brainstorm ideas"].map(
            (s) => (
              <span
                key={s}
                className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-xs text-white/35"
              >
                {s}
              </span>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && isLast && msg.role === "assistant"}
            />
          );
        })}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
