"use client";

import type { Conversation, ChatMode } from "@/lib/types";

interface SidebarProps {
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  mode: ChatMode;
  activeModel: string;
  onToggle: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({
  open,
  conversations,
  activeId,
  mode,
  activeModel,
  onToggle,
  onNew,
  onSelect,
  onDelete,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={[
          "z-30 h-full shrink-0 overflow-hidden border-r border-white/[0.06] bg-[#080808] transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "fixed md:relative",
          open
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full md:w-0 md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-full w-64 flex-col">
          {/* Brand */}
          <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-3">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-white to-white/50">
                <span className="font-mono text-[10px] font-bold text-black">
                  L
                </span>
              </div>
              <span className="text-sm font-medium tracking-tight">
                llama.chat
              </span>
            </div>
            <button
              onClick={onToggle}
              className="rounded p-1 text-white/40 transition hover:bg-white/5 hover:text-white"
              aria-label="Collapse sidebar"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>

          {/* New chat */}
          <div className="p-2">
            <button
              onClick={onNew}
              className="group flex w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-white/80 transition hover:border-white/10 hover:bg-white/[0.07] hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-white/50 transition group-hover:text-white"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New chat
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
            {conversations.length === 0 && (
              <div className="px-3 py-10 text-center text-xs text-white/25">
                No conversations yet
              </div>
            )}
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={[
                    "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/80",
                  ].join(" ")}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 opacity-40"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="flex-1 truncate text-xs">
                    {conv.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="rounded p-0.5 text-white/30 opacity-0 transition hover:bg-white/10 hover:text-red-400 group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-3 py-2.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {mode === "local" ? "local · model: local" : `remote · model: ${activeModel || "—"}`}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
