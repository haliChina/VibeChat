"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, Conversation, Role, ChatMode } from "@/lib/types";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import SettingsPanel from "./SettingsPanel";

const STORAGE_KEY = "llamacpp-chat-history-v1";
const PORT_KEY = "llamacpp-chat-port";
const PORT2_KEY = "llamacpp-chat-port2";
const TITLE_ENABLED_KEY = "llamacpp-chat-title-enabled";
const MODE_KEY = "llamacpp-chat-mode";
const BASEURL_KEY = "llamacpp-chat-baseurl";
const APIKEY_KEY = "llamacpp-chat-apikey";
const MODELS_KEY = "llamacpp-chat-models";
const ACTIVE_MODEL_KEY = "llamacpp-chat-active-model";
const DEFAULT_PORT = 8080;
const DEFAULT_PORT2 = 3000;
const LOCAL_API_KEY = "sk-llamacpp";
const LOCAL_MODEL = "local";
const DEFAULT_BASEURL = "https://api.openai.com/v1";

/* ---------- endpoint helpers ---------- */

interface EndpointConfig {
  url: string;
  apiKey: string;
  model: string;
}

/**
 * Strongly sanitize a user-provided base URL.
 * Strips a mistakenly-pasted `/chat/completions` suffix and trailing slashes
 * so the final `${normalizeBase(baseUrl)}/chat/completions` has exactly one suffix.
 */
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

function buildChatEndpoint(
  mode: ChatMode,
  port: number,
  baseUrl: string,
  apiKey: string,
  activeModel: string
): EndpointConfig {
  if (mode === "local") {
    return {
      url: `http://127.0.0.1:${port}/v1/chat/completions`,
      apiKey: LOCAL_API_KEY,
      model: LOCAL_MODEL,
    };
  }
  return {
    url: `${normalizeBase(baseUrl)}/chat/completions`,
    apiKey,
    model: activeModel,
  };
}

function buildTitleEndpoint(
  mode: ChatMode,
  port2: number,
  chatCfg: EndpointConfig
): EndpointConfig {
  if (mode === "local") {
    return {
      url: `http://127.0.0.1:${port2}/v1/chat/completions`,
      apiKey: LOCAL_API_KEY,
      model: LOCAL_MODEL,
    };
  }
  // remote: reuse the main endpoint (same base/key/model)
  return chatCfg;
}

/* ---------- title generation helpers ---------- */

const TITLE_MAX_LEN = 30;
const TITLE_FALLBACK_LEN = 15;

/**
 * Clean the raw title returned by the 0.5B model.
 * Falls back to first 15 chars of user input + "..." when:
 *  - length <= 2 or > TITLE_MAX_LEN
 *  - repetition / 复读机 detected (consecutive dupes or single word repeated)
 */
function cleanTitle(raw: string, fallbackText: string): string {
  let trimmed = raw.trim();
  // strip wrapping quotes / list markers / "Title:" prefix
  trimmed = trimmed.replace(/^["'`*\-#\s]+|["'`*\-#\s]+$/g, "");
  trimmed = trimmed.replace(/^(title|title:)\s*/i, "");
  trimmed = trimmed.trim();

  if (trimmed.length <= 2 || trimmed.length > TITLE_MAX_LEN) {
    return fallbackText.slice(0, TITLE_FALLBACK_LEN) + "...";
  }

  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallbackText.slice(0, TITLE_FALLBACK_LEN) + "...";

  // consecutive duplicate words
  let consecDupes = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1]) consecDupes++;
  }
  const unique = new Set(words);
  if (
    (words.length >= 3 && unique.size === 1) ||
    (words.length >= 4 && consecDupes >= words.length / 2)
  ) {
    return fallbackText.slice(0, TITLE_FALLBACK_LEN) + "...";
  }

  return trimmed;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [port, setPort] = useState<number>(DEFAULT_PORT);
  const [port2, setPort2] = useState<number>(DEFAULT_PORT2);
  const [titleEnabled, setTitleEnabled] = useState<boolean>(true);
  const [mode, setMode] = useState<ChatMode>("local");
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_BASEURL);
  const [apiKey, setApiKey] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  /* ---------- persistence ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Conversation[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
        }
      }
      const savedPort = localStorage.getItem(PORT_KEY);
      if (savedPort) {
        const n = Number(savedPort);
        if (Number.isInteger(n) && n > 0 && n < 65536) setPort(n);
      }
      const savedPort2 = localStorage.getItem(PORT2_KEY);
      if (savedPort2) {
        const n = Number(savedPort2);
        if (Number.isInteger(n) && n > 0 && n < 65536) setPort2(n);
      }
      const savedTitleEnabled = localStorage.getItem(TITLE_ENABLED_KEY);
      if (savedTitleEnabled !== null) {
        setTitleEnabled(savedTitleEnabled === "true");
      }
      const savedMode = localStorage.getItem(MODE_KEY);
      if (savedMode === "local" || savedMode === "remote") setMode(savedMode);
      const savedBaseUrl = localStorage.getItem(BASEURL_KEY);
      if (savedBaseUrl) setBaseUrl(savedBaseUrl);
      const savedApiKey = localStorage.getItem(APIKEY_KEY);
      if (savedApiKey) setApiKey(savedApiKey);
      const savedModels = localStorage.getItem(MODELS_KEY);
      if (savedModels) {
        const arr = JSON.parse(savedModels);
        if (Array.isArray(arr)) setModels(arr.filter((x) => typeof x === "string"));
      }
      const savedActiveModel = localStorage.getItem(ACTIVE_MODEL_KEY);
      if (savedActiveModel) setActiveModel(savedActiveModel);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      /* ignore */
    }
  }, [conversations]);

  const handleSavePort = useCallback((p: number) => {
    setPort(p);
    try {
      localStorage.setItem(PORT_KEY, String(p));
    } catch {
      /* ignore */
    }
  }, []);

  const handleSavePort2 = useCallback((p: number) => {
    setPort2(p);
    try {
      localStorage.setItem(PORT2_KEY, String(p));
    } catch {
      /* ignore */
    }
  }, []);

  const handleToggleTitle = useCallback((enabled: boolean) => {
    setTitleEnabled(enabled);
    try {
      localStorage.setItem(TITLE_ENABLED_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  }, []);

  const handleSaveMode = useCallback((m: ChatMode) => {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSaveBaseUrl = useCallback((u: string) => {
    setBaseUrl(u);
    try {
      localStorage.setItem(BASEURL_KEY, u);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSaveApiKey = useCallback((k: string) => {
    setApiKey(k);
    try {
      localStorage.setItem(APIKEY_KEY, k);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSaveModels = useCallback((list: string[]) => {
    setModels(list);
    try {
      localStorage.setItem(MODELS_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }, []);

  const handleSaveActiveModel = useCallback((m: string) => {
    setActiveModel(m);
    try {
      localStorage.setItem(ACTIVE_MODEL_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------- async title generation (stream: false) ---------- */
  const generateTitleForConversation = useCallback(
    async (firstInput: string, convId: string, cfg: EndpointConfig) => {
      const fallback = firstInput.slice(0, TITLE_FALLBACK_LEN) + "...";
      try {
        const res = await fetch(cfg.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cfg.apiKey}`,
          },
          body: JSON.stringify({
            model: cfg.model,
            messages: [
              {
                role: "user",
                content:
                  "Generate an extremely short 2-3 words title in English for this user input. Reply with ONLY the title itself, no quotes, no explanations, no extra words. Input text: " +
                  firstInput,
              },
            ],
            stream: false,
          }),
        });
        if (!res.ok) throw new Error(`title model HTTP ${res.status}`);
        const data = await res.json();
        const raw: string = data.choices?.[0]?.message?.content ?? "";
        const title = cleanTitle(raw, firstInput);
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title } : c))
        );
      } catch {
        // network / parse error → fallback title
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: fallback } : c))
        );
      }
    },
    []
  );

  /* ---------- responsive: collapse sidebar on small screens ---------- */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(!e.matches);
    setSidebarOpen(!mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;

  const newChat = useCallback(() => {
    const conv: Conversation = {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (activeId === id) setActiveId(next[0]?.id ?? null);
        return next;
      });
    },
    [activeId]
  );

  /* ---------- core: send + stream ---------- */
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const currentConv = activeId
      ? conversations.find((c) => c.id === activeId)
      : null;

    // First message of a new conversation? (triggers title generation later)
    const isFirstMessage = !currentConv || currentConv.messages.length === 0;

    // Build the payload history (previous turns + new user message)
    const history: { role: Role; content: string }[] = [
      ...(currentConv?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user" as const, content: text },
    ];

    const userMsg: Message = { id: generateId(), role: "user", content: text };
    const assistantMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
    };

    let convId = activeId;

    if (!currentConv) {
      convId = generateId();
      const conv: Conversation = {
        id: convId,
        title: text.slice(0, 42),
        messages: [userMsg, assistantMsg],
        createdAt: Date.now(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== convId
            ? c
            : {
                ...c,
                title: c.messages.length === 0 ? text.slice(0, 42) : c.title,
                messages: [...c.messages, userMsg, assistantMsg],
              }
        )
      );
    }

    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Build the endpoint config for the current mode.
    const chatCfg = buildChatEndpoint(mode, port, baseUrl, apiKey, activeModel);

    // Fire title generation IN PARALLEL with the chat stream.
    // The title model takes ~2s, so we kick it off the moment the chat
    // request starts — by the time the stream finishes the title is usually
    // already back and the sidebar updates seamlessly.
    // Skipped entirely when the user has disabled title generation.
    if (isFirstMessage && convId && titleEnabled) {
      const titleCfg = buildTitleEndpoint(mode, port2, chatCfg);
      void generateTitleForConversation(text, convId, titleCfg);
    }

    try {
      // Fetch DIRECTLY from the browser to the model endpoint (local
      // llama.cpp or a third-party OpenAI-compatible service). The Next.js
      // server runs in a remote sandbox and cannot reach the user's
      // localhost, so no proxy is used.
      const res = await fetch(chatCfg.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chatCfg.apiKey}`,
        },
        body: JSON.stringify({
          model: chatCfg.model,
          messages: history,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          errText || `Request failed (${res.status} ${res.statusText})`
        );
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta: string = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              const snapshot = acc;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id !== convId
                    ? c
                    : {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantMsg.id
                            ? { ...m, content: snapshot }
                            : m
                        ),
                      }
                )
              );
            }
          } catch {
            /* skip malformed chunk */
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // user stopped — keep partial content
      } else {
        const msg = err instanceof Error ? err.message : "Unknown error";
        // Browser fetch most commonly fails due to CORS, the server not
        // running, or wrong credentials. Give an actionable, mode-aware hint.
        const hint =
          /Failed to fetch|NetworkError|CORS/i.test(msg)
            ? mode === "local"
              ? `\n\nLikely causes:\n` +
                `1. llama.cpp not running on \`127.0.0.1:${port}\`\n` +
                `2. CORS not enabled — restart llama.cpp with \`--cors '*'\`\n\n` +
                `Example:\n` +
                "```\n" +
                `./llama-server -m model.gguf --port ${port} --cors '*'\n` +
                "```"
              : `\n\nLikely causes:\n` +
                `1. Base URL incorrect (current: \`${normalizeBase(baseUrl)}/chat/completions\`)\n` +
                `2. API Key invalid or missing\n` +
                `3. Network/CORS blocked by the provider\n`
            : "";
        setConversations((prev) =>
          prev.map((c) =>
            c.id !== convId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? {
                          ...m,
                          content:
                            m.content ||
                            `⚠️ Connection error\n\n\`${msg}\`${hint}`,
                        }
                      : m
                  ),
                }
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, activeId, conversations, mode, port, port2, baseUrl, apiKey, activeModel, titleEnabled, generateTitleForConversation]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-black text-white">
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        mode={mode}
        activeModel={activeModel}
        onToggle={() => setSidebarOpen((v) => !v)}
        onNew={newChat}
        onSelect={(id) => {
          setActiveId(id);
          if (window.matchMedia("(max-width: 768px)").matches)
            setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="z-10 flex h-12 items-center justify-between border-b border-white/[0.06] bg-black/50 px-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-md p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white"
              aria-label="Toggle sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <span className="max-w-[40vw] truncate font-mono text-xs tracking-tight text-white/40">
              {activeConversation?.title || "llama.chat"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="max-w-[160px] truncate font-mono text-[10px] uppercase tracking-wider text-white/35">
                {mode === "local"
                  ? `127.0.0.1:${port}`
                  : normalizeBase(baseUrl)}
              </span>
            </div>
            <SettingsPanel
              mode={mode}
              port={port}
              port2={port2}
              titleEnabled={titleEnabled}
              baseUrl={baseUrl}
              apiKey={apiKey}
              models={models}
              activeModel={activeModel}
              onSaveMode={handleSaveMode}
              onSavePort={handleSavePort}
              onSavePort2={handleSavePort2}
              onToggleTitle={handleToggleTitle}
              onSaveBaseUrl={handleSaveBaseUrl}
              onSaveApiKey={handleSaveApiKey}
              onSaveModels={handleSaveModels}
              onSaveActiveModel={handleSaveActiveModel}
            />
          </div>
        </header>

        {/* Messages */}
        <MessageList
          conversation={activeConversation}
          isStreaming={isStreaming}
        />

        {/* Input */}
        <InputArea
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          mode={mode}
          activeModel={activeModel}
          models={models}
          onSelectModel={handleSaveActiveModel}
        />
      </main>
    </div>
  );
}
