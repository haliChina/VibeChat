"use client";

import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
}

export default function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex animate-fade-in-up gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        <div
          className={[
            "flex h-7 w-7 items-center justify-center rounded-lg font-mono text-[10px] font-bold",
            isUser
              ? "border border-white/10 bg-white/[0.06] text-white/60"
              : "bg-gradient-to-br from-white to-white/45 text-black shadow-lg shadow-white/5",
          ].join(" ")}
        >
          {isUser ? "YOU" : "L"}
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex min-w-0 max-w-[85%] flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/25">
          {isUser ? "user" : "assistant"}
        </div>

        <div
          className={[
            "prose-chat break-words rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-white/[0.09] text-white/90"
              : "rounded-tl-sm border border-white/[0.06] bg-white/[0.025] text-white/85",
          ].join(" ")}
        >
          {message.content ? (
            <FormattedContent content={message.content} />
          ) : isStreaming ? (
            <TypingIndicator />
          ) : null}

          {isStreaming && message.content && (
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-blink bg-white/70 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/50" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/50" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/50" />
    </div>
  );
}

/* ---------- lightweight markdown rendering (no deps) ---------- */

function FormattedContent({ content }: { content: string }) {
  return <>{parseContent(content)}</>;
}

function parseContent(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderInline(content.slice(lastIndex, match.index), key++));
    }
    const lang = match[1] ?? "";
    const code = match[2].replace(/\n$/, "");
    parts.push(
      <pre key={key++}>
        {lang && (
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-white/30">
            {lang}
          </div>
        )}
        <code>{code}</code>
      </pre>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(renderInline(content.slice(lastIndex), key++));
  }

  return parts;
}

function renderInline(text: string, key: number): React.ReactNode {
  // Split on inline code first
  const segments = text.split(/(`[^`]+`)/g);
  return (
    <span key={key}>
      {segments.map((seg, i) => {
        if (seg.startsWith("`") && seg.endsWith("`") && seg.length >= 2) {
          return (
            <code key={i}>{seg.slice(1, -1)}</code>
          );
        }
        // bold **text**
        const boldParts = seg.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i} className="whitespace-pre-wrap break-words">
            {boldParts.map((bp, j) =>
              bp.startsWith("**") && bp.endsWith("**") && bp.length >= 4 ? (
                <strong key={j}>{bp.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{bp}</span>
              )
            )}
          </span>
        );
      })}
    </span>
  );
}
