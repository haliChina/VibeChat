# 🎛️ OmniBridge

A sleek, highly optimized hybrid LLM chat client built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It is architected for the ultimate geek setup, allowing you to seamlessly switch between private, low-spec local edge computing (e.g., llama.cpp GGUF instances on old CPUs) and powerful remote cloud endpoints (DeepSeek, OpenRouter, OpenAI) within a single, unified interface.

<img width="1267" height="540" alt="image" src="https://github.com/user-attachments/assets/222fe2df-8a64-4f3a-b06b-5b3c38dd8c89" />

---

## ✨ Core Features

- **🔀 Hybrid Dual-Mode Switch:** 
  - **Local Mode:** Connects directly to your local `llama.cpp` instances. Uses dual-port thread splitting (Chat vs. Auto-Title) to squeeze maximum performance out of legacy hardware (tested smoothly on 4th-Gen i3, 4GB RAM) without system freeze.
  - **Remote Mode:** Connects to any cloud-based OpenAI-compatible API. Features customizable BaseURL, masked API Key, and a dynamic model selector dropdown at the bottom area.
- **🧠 Context-Aware Auto-Title Generation:** Automatically distills conversation intent into crisp, 2-word engineering topics (e.g., `Nginx API Configuration`) instead of raw text copying. Empowered by a tailored `200 tokens` physical context cache and specialized summary prompt routing.
- **🛡️ Industrial-Grade Robustness:** 
  - **Aggressive Endpoint Normalization:** Automatically sanitizes messy input URLs (removes accidental copy-pasted trailing slashes or duplicate `/chat/completions` suffixes) to ensure zero `404 Bad Request` errors.
  - **Anti-Repetitive Guard:** Built-in string sanitization that filters out local model infinite loops, token bleeding, and provides quick length-capped fallbacks.
- **⚙️ High-Granularity UX Control:** A frosted, semi-transparent Server Settings panel featuring instant visual state feedback (disables and dims local inputs when switching to cloud endpoints, and vice versa).

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend Runtime Support:** [llama.cpp](https://github.com/ggerganov/llama.cpp) (Server Edition) or any standard OpenAI-Compatible API gateway.
- **Recommended Edge Models:** Qwen2.5-0.5B-Instruct (GGUF Format, Q4_K_M / Q8_0)

---

## 🚀 Getting Started

### 1. (Optional) Run your local LLM instances

If you want to use the **Local Mode**, boot up your GGUF models using `llama-server.exe` with strict thread allocation to prevent resource racing:

```bash
# Terminal 1: Main Chat Model (Port 8080, N Threads)
llama-server.exe -m qwen3.6-35b.gguf -t N -c XXXX --port 8080

# Terminal 2: Title Summary Specialist (Port 3000, 1-4 Thread, 128-512 Context)
llama-server.exe -m qwen2.5-0.5b-instruct.Q8_0.gguf -t N -c xxxx --port 3000

```

### 2. Clone & Launch the Client

```bash
# Clone the repository
git clone [https://github.com/haliChina/VibeChat.git](https://github.com/haliChina/VibeChat.git)

# Install dependencies
npm install

# Start the dev server
npm run dev

```

Open [http://localhost:3000](http://localhost:3000), hit the top-right settings icon, flip the switch to your preferred mode, and enjoy your privatized, lightning-fast AI workstation!

---

## 🔒 Security & Privacy

This client is architected to perform **Direct Browser-to-Endpoint Fetching**. All chat payloads and API credentials communicate straight from your browser to your specified localhost or remote cloud endpoints. Your secret tokens are securely cached inside your local storage (`localStorage`) and never pass through any third-party middleman servers.

---

## 📝 License

MIT License. Free to fork, mod, and deployment to your own private servers/Docker containers!
