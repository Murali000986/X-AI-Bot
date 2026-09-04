# X AI Multi-Agent Chatbot Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/X%20API-v2-black?style=flat-square&logo=x" />
  <img src="https://img.shields.io/badge/MongoDB-7.x-green?style=flat-square&logo=mongodb" />
</p>

A production-ready, full-stack AI chatbot platform for X (Twitter). The bot listens to mentions, classifies intent using an LLM-based router, delegates to one of five specialized AI agents, and replies natively on X — all managed via a professional admin dashboard.

---

## ✨ Features

- 🧠 **5 AI Agents** — General, Coding, Tutor, Writing, Summarizer (each with specialized system prompts)
- 🚦 **Intent Router** — Auto-classifies user intent via LLM, or responds to explicit commands (`/code`, `/learn`, `/write`, `/summarize`, `/help`, `/reset`)
- 🛑 **Rate Limiting** — Per-user + global sliding-window limiter via Redis
- 🛡️ **Moderation** — Prompt injection detection, spam filters, safety gates on input and output
- 💾 **Conversation Memory** — Recalls last 15 messages; auto-summarizes older context to save tokens
- 📊 **Admin Dashboard** — React + Tailwind UI with analytics charts, user management, conversation viewer, and live settings
- 🔄 **Idempotency Guard** — MongoDB TTL cache on `tweetId` prevents duplicate bot replies
- 🤖 **Multi-Provider LLM** — Gemini, OpenAI, Groq — switchable via dashboard settings

---

## 🏗️ Architecture

```
                    ┌──────────────────┐
  X Mention ───────▶│   Webhook / Poll │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  MessageProcessor│  ← Moderation + Rate Limit
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   AgentRouter    │  ← LLM Intent Classification
                    └────────┬─────────┘
                    ┌────────▼──────────────────┐
                    │  General | Code | Tutor   │
                    │  Writing | Summarizer     │  ← AI Agents
                    └────────┬──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  LLM Provider    │  ← Gemini / OpenAI / Groq
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Reply on X      │
                    └──────────────────┘
```

**Tech Stack:**
| Layer | Technology |
|---|---|
| Backend | Node.js 20+, Express, TypeScript, Zod |
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Database | MongoDB (conversations, users, logs) |
| Cache | Redis (rate limiter, sessions) |
| X API | `twitter-api-v2` — OAuth 1.0a + OAuth 2.0 |
| LLM | Google Gemini, OpenAI, Groq |

---

## 📋 Requirements

- **Node.js** v20+
- **MongoDB** v6+ (local or MongoDB Atlas)
- **Redis** v7+ (local or Redis Cloud)
- **X (Twitter) Developer Account** with an app configured
  - X API access level: **Basic ($100/mo)** to read mentions and post replies
  - Free tier can only post tweets (no mention reading)
- **At least one LLM API key** — Gemini (free), OpenAI, or Groq (free)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Murali000986/X-AI-Bot.git
cd X-AI-Bot
```

### 2. Environment setup

```bash
cp .env.example backend/.env
```

Edit `backend/.env` with your real credentials (see [Environment Variables](#-environment-variables) below).

### 3. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Run locally (without Docker)

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** for the admin dashboard.

Default login: `admin` / `strongpassword123` *(change in `.env`)*

---

## 🐳 Running with Docker Compose

```bash
docker-compose up --build
```

| Service | Port |
|---|---|
| Frontend dashboard | `:5173` |
| Backend API | `:3001` |
| MongoDB | `:27017` |
| Redis | `:6379` |

---

## 🔑 Environment Variables

Copy `.env.example` to `backend/.env` and fill in the values:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_random_32_char_secret

# Admin dashboard login
ADMIN_USERNAME=admin
ADMIN_PASSWORD=strongpassword123

# X (Twitter) API — from developer.x.com
X_BOT_USERNAME=YourBotHandle
X_BEARER_TOKEN=your_v2_bearer_token
X_CLIENT_ID=your_oauth1a_consumer_key
X_CLIENT_SECRET=your_oauth1a_consumer_secret
X_ACCESS_TOKEN=your_oauth1a_access_token
X_ACCESS_SECRET=your_oauth1a_access_secret
X_WEBHOOK_SECRET=any_random_string

# LLM Providers — configure at least one
GEMINI_API_KEY=your_gemini_key       # aistudio.google.com (free)
OPENAI_API_KEY=your_openai_key       # platform.openai.com
GROQ_API_KEY=your_groq_key           # console.groq.com (free)

# Databases
MONGODB_URI=mongodb://localhost:27017/x-chatbot
REDIS_URL=redis://localhost:6379
```

---

## 🐦 X API Setup

1. Go to **[developer.x.com](https://developer.x.com)** → Create a Project + App
2. Under **Settings → User authentication settings**:
   - App permissions: **Read and Write**
   - Type: **Web App, Automated App or Bot**
   - Callback URL: `https://example.com/callback`
   - Website URL: `https://example.com`
3. Under **Keys and Tokens**, collect:
   - Consumer Key & Secret → `X_CLIENT_ID` / `X_CLIENT_SECRET`
   - Access Token & Secret → `X_ACCESS_TOKEN` / `X_ACCESS_SECRET`
   - Bearer Token → `X_BEARER_TOKEN`
4. **Important:** Regenerate Access Tokens *after* setting Read + Write permissions

> ⚠️ The **Free tier** only allows posting tweets. Reading mentions requires **Basic ($100/mo)** access.

---

## 🤖 AI Agents

| Agent | Trigger | Description |
|---|---|---|
| **General** | Default | Conversational assistant |
| **Coding** | `/code` | Code review, debugging, explanations |
| **Tutor** | `/learn` | Educational explanations |
| **Writing** | `/write` | Grammar, tone, style improvements |
| **Summarizer** | `/summarize` | TL;DR of long content |

The router uses LLM-based intent classification to automatically pick the right agent, or users can explicitly invoke one with a slash command.

---

## 📊 Admin Dashboard

| Page | Description |
|---|---|
| **Overview** | Live stats — users, messages, tokens, LLM requests |
| **Conversations** | Browse all bot conversations with full message history |
| **Users** | View user profiles, block/unblock |
| **Agents** | Enable/disable individual AI agents |
| **Models** | View available LLM models per provider |
| **Settings** | Configure default agent, provider, temperature, rate limits |
| **Analytics** | Time-series charts for messages, tokens, agent usage |

---

## 📁 Project Structure

```
X-AI-Bot/
├── backend/
│   ├── src/
│   │   ├── agents/        # 5 AI agents + intent router
│   │   ├── config/        # DB, Redis, env validation
│   │   ├── controllers/   # REST API handlers
│   │   ├── middleware/    # JWT auth
│   │   ├── models/        # Mongoose schemas
│   │   ├── prompts/       # System prompts
│   │   ├── routes/        # Express routes
│   │   ├── services/      # LLM, X API, memory, rate limiter
│   │   ├── app.ts
│   │   └── server.ts
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Sidebar, Toast, Modal
│   │   ├── hooks/         # Auth context
│   │   ├── pages/         # 8 dashboard pages
│   │   ├── services/      # API client
│   │   └── App.tsx
│   └── vite.config.ts
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🧪 Testing AI Locally (without X API)

Even on the free X tier, you can test the AI pipeline:

```powershell
# Start backend
cd backend && npm run dev

# In a second terminal — test the AI agent directly
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:3001/api/test-agent" `
  -ContentType "application/json" `
  -Body '{"message":"explain machine learning","agentKey":"general","provider":"groq"}'
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with ❤️ using Node.js, React, and the X API</p>
