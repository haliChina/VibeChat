"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMode } from "@/lib/types";

interface SettingsPanelProps {
  mode: ChatMode;
  port: number;
  port2: number;
  titleEnabled: boolean;
  baseUrl: string;
  apiKey: string;
  models: string[];
  activeModel: string;
  onSaveMode: (m: ChatMode) => void;
  onSavePort: (port: number) => void;
  onSavePort2: (port: number) => void;
  onToggleTitle: (enabled: boolean) => void;
  onSaveBaseUrl: (url: string) => void;
  onSaveApiKey: (key: string) => void;
  onSaveModels: (list: string[]) => void;
  onSaveActiveModel: (model: string) => void;
}

function validatePort(n: number): boolean {
  return Number.isInteger(n) && n > 0 && n < 65536;
}

function normalizeBase(raw: string): string {
  const s = raw.trim();
  const m = s.match(/^(https?:\/\/)(.+)$/i);
  if (!m) return s.replace(/\/+$/, "");
  const proto = m[1];
  let rest = m[2];
  rest = rest.replace(/\/chat\/completions\/?.*$/i, "");
  rest = rest.replace(/\/+$/, "");
  return proto + rest;
}

export default function SettingsPanel({
  mode,
  port,
  port2,
  titleEnabled,
  baseUrl,
  apiKey,
  models,
  activeModel,
  onSaveMode,
  onSavePort,
  onSavePort2,
  onToggleTitle,
  onSaveBaseUrl,
  onSaveApiKey,
  onSaveModels,
  onSaveActiveModel,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(port));
  const [draft2, setDraft2] = useState(String(port2));
  const [draftBaseUrl, setDraftBaseUrl] = useState(baseUrl);
  const [draftApiKey, setDraftApiKey] = useState(apiKey);
  const [draftModels, setDraftModels] = useState(models.join(", "));
  const [draftActiveModel, setDraftActiveModel] = useState(activeModel);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(String(port));
  }, [port]);
  useEffect(() => {
    setDraft2(String(port2));
  }, [port2]);
  useEffect(() => {
    setDraftBaseUrl(baseUrl);
  }, [baseUrl]);
  useEffect(() => {
    setDraftApiKey(apiKey);
  }, [apiKey]);
  useEffect(() => {
    setDraftModels(models.join(", "));
  }, [models]);
  useEffect(() => {
    setDraftActiveModel(activeModel);
  }, [activeModel]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) inputRef.current?.select();
  }, [open]);

  const handleSave = () => {
    // Parse models list: trim + drop empties
    const parsedModels = draftModels
      .split(/[,\n]/)
      .map((m) => m.trim())
      .filter(Boolean);

    if (mode === "local") {
      const n = Number(draft);
      const n2 = Number(draft2);
      if (!validatePort(n)) {
        setError("Chat port must be 1–65535");
        return;
      }
      if (!validatePort(n2)) {
        setError("Title port must be 1–65535");
        return;
      }
      setError(null);
      onSavePort(n);
      onSavePort2(n2);
      setOpen(false);
      return;
    }

    // remote mode validation
    if (!draftBaseUrl.trim()) {
      setError("Base URL is required");
      return;
    }
    if (!/^https?:\/\//i.test(draftBaseUrl.trim())) {
      setError("Base URL must start with http:// or https://");
      return;
    }
    if (!draftApiKey.trim()) {
      setError("API Key is required");
      return;
    }
    if (parsedModels.length === 0) {
      setError("Add at least one model");
      return;
    }

    // Fallback: if active model not in list, use first
    const finalActive = parsedModels.includes(draftActiveModel)
      ? draftActiveModel
      : parsedModels[0];

    setError(null);
    onSaveBaseUrl(draftBaseUrl.trim());
    onSaveApiKey(draftApiKey.trim());
    onSaveModels(parsedModels);
    onSaveActiveModel(finalActive);
    setOpen(false);
  };

  const isRemote = mode === "remote";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white"
        aria-label="Settings"
        title="Settings"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-80 animate-fade-in-up rounded-xl border border-white/10 bg-[#0c0c0c] p-3 shadow-2xl shadow-black/60">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium tracking-tight text-white/80">
              Server settings
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
              {isRemote ? "third-party" : "local"}
            </span>
          </div>

          {/* Mode switch */}
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <div className="flex flex-col">
              <span className="text-xs text-white/80">Mode</span>
              <span className="text-[10px] text-white/35">
                {isRemote ? "Third-party (OpenAI-compatible)" : "Local llama.cpp"}
              </span>
            </div>
            <button
              role="switch"
              aria-checked={isRemote}
              onClick={() => onSaveMode(isRemote ? "local" : "remote")}
              className={[
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
                isRemote ? "bg-emerald-500/80" : "bg-white/10",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  isRemote ? "translate-x-[22px]" : "translate-x-[3px]",
                ].join(" ")}
              />
            </button>
          </div>

          {/* ---- LOCAL mode fields ---- */}
          {!isRemote && (
            <>
              {/* Port 1 — main chat (stream) */}
              <label className="mb-1 mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
                <span>Chat port</span>
                <span className="normal-case text-white/25">stream</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-lg border border-white/10 bg-white/[0.03] px-2.5 focus-within:border-white/20">
                  <span className="font-mono text-[11px] text-white/30">
                    127.0.0.1:
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value.replace(/[^\d]/g, ""));
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") setOpen(false);
                    }}
                    className="w-full bg-transparent py-1.5 pl-1 font-mono text-sm text-white outline-none"
                    placeholder="8080"
                  />
                </div>
              </div>

              {/* Title generation toggle */}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div className="flex flex-col">
                  <span className="text-xs text-white/80">Auto title</span>
                  <span className="text-[10px] text-white/35">
                    Generate sidebar titles via title port
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={titleEnabled}
                  onClick={() => onToggleTitle(!titleEnabled)}
                  className={[
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
                    titleEnabled ? "bg-emerald-500/80" : "bg-white/10",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                      titleEnabled ? "translate-x-[22px]" : "translate-x-[3px]",
                    ].join(" ")}
                  />
                </button>
              </div>

              {/* Port 2 — title summarizer (no stream) */}
              <label className="mb-1 mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
                <span>Title port</span>
                <span className="normal-case text-white/25">title · no stream</span>
              </label>
              <div
                className={[
                  "flex items-center gap-2 transition-opacity",
                  titleEnabled ? "opacity-100" : "opacity-40 pointer-events-none",
                ].join(" ")}
              >
                <div className="flex flex-1 items-center rounded-lg border border-white/10 bg-white/[0.03] px-2.5 focus-within:border-white/20">
                  <span className="font-mono text-[11px] text-white/30">
                    127.0.0.1:
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draft2}
                    onChange={(e) => {
                      setDraft2(e.target.value.replace(/[^\d]/g, ""));
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") setOpen(false);
                    }}
                    className="w-full bg-transparent py-1.5 pl-1 font-mono text-sm text-white outline-none"
                    placeholder="3000"
                  />
                </div>
              </div>
            </>
          )}

          {/* ---- REMOTE mode fields ---- */}
          {isRemote && (
            <>
              {/* Base URL */}
              <label className="mb-1 mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
                <span>Base URL</span>
                <span className="normal-case text-white/25">OpenAI-compatible</span>
              </label>
              <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-2.5 focus-within:border-white/20">
                <input
                  ref={inputRef}
                  type="text"
                  value={draftBaseUrl}
                  onChange={(e) => {
                    setDraftBaseUrl(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") setOpen(false);
                  }}
                  className="w-full bg-transparent py-1.5 font-mono text-xs text-white outline-none"
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              {/* API Key */}
              <label className="mb-1 mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
                <span>API Key</span>
                <span className="normal-case text-white/25">Bearer token</span>
              </label>
              <div className="relative flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-2.5 focus-within:border-white/20">
                <input
                  type={showKey ? "text" : "password"}
                  value={draftApiKey}
                  onChange={(e) => {
                    setDraftApiKey(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") setOpen(false);
                  }}
                  className="w-full bg-transparent py-1.5 pr-7 font-mono text-xs text-white outline-none"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded text-white/40 transition hover:bg-white/5 hover:text-white/70"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                  title={showKey ? "Hide" : "Show"}
                >
                  {showKey ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Models list */}
              <label className="mb-1 mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
                <span>Models</span>
                <span className="normal-case text-white/25">comma / newline separated</span>
              </label>
              <textarea
                value={draftModels}
                onChange={(e) => {
                  setDraftModels(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                  if (e.key === "Escape") setOpen(false);
                }}
                rows={2}
                placeholder="gpt-4o, gpt-4o-mini"
                className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-white/20"
              />

              {/* Active model */}
              <label className="mb-1 mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
                <span>Active model</span>
                <span className="normal-case text-white/25">default for chat</span>
              </label>
              <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-2.5 focus-within:border-white/20">
                <select
                  value={
                    draftModels
                      .split(/[,\n]/)
                      .map((m) => m.trim())
                      .filter(Boolean)
                      .includes(draftActiveModel)
                      ? draftActiveModel
                      : ""
                  }
                  onChange={(e) => {
                    setDraftActiveModel(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-transparent py-1.5 font-mono text-xs text-white outline-none [&>option]:bg-[#0c0c0c]"
                >
                  {(() => {
                    const list = draftModels
                      .split(/[,\n]/)
                      .map((m) => m.trim())
                      .filter(Boolean);
                    if (list.length === 0)
                      return <option value="">— add models above —</option>;
                    return list.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              {/* Title generation toggle (remote) */}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div className="flex flex-col">
                  <span className="text-xs text-white/80">Auto title</span>
                  <span className="text-[10px] text-white/35">
                    Generate sidebar titles via main endpoint
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={titleEnabled}
                  onClick={() => onToggleTitle(!titleEnabled)}
                  className={[
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
                    titleEnabled ? "bg-emerald-500/80" : "bg-white/10",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                      titleEnabled ? "translate-x-[22px]" : "translate-x-[3px]",
                    ].join(" ")}
                  />
                </button>
              </div>
            </>
          )}

          {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}

          <button
            onClick={handleSave}
            className="mt-3 w-full rounded-lg bg-white py-1.5 text-xs font-medium text-black transition hover:bg-white/90"
          >
            Save
          </button>

          {/* Endpoints */}
          <div className="mt-3 space-y-2">
            {isRemote ? (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/30">
                  Endpoint
                </span>
                <div className="mt-0.5 overflow-x-auto rounded-md border border-white/[0.06] bg-black/40 px-2 py-1">
                  <code className="block whitespace-nowrap font-mono text-[10px] text-white/50">
                    {normalizeBase(draftBaseUrl)}/chat/completions
                  </code>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Chat endpoint
                  </span>
                  <div className="mt-0.5 overflow-x-auto rounded-md border border-white/[0.06] bg-black/40 px-2 py-1">
                    <code className="block whitespace-nowrap font-mono text-[10px] text-white/50">
                      http://127.0.0.1:{port}/v1/chat/completions
                    </code>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Title endpoint
                  </span>
                  <div className="mt-0.5 overflow-x-auto rounded-md border border-white/[0.06] bg-black/40 px-2 py-1">
                    <code className="block whitespace-nowrap font-mono text-[10px] text-white/50">
                      http://127.0.0.1:{port2}/v1/chat/completions
                    </code>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
