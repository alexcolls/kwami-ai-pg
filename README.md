# Kwami App

Web app for building and interacting with **Kwami** 3D AI companions: voice conversations, persistent memory, and customizable avatars and scenes.

## Features

- **Voice pipeline** — Real-time STT, LLM, and TTS (e.g. Deepgram, OpenAI) via LiveKit
- **3D avatars** — Blob and Black Hole renderers
- **Memory** — Long-term context with Zep
- **Tools** — MCP and custom tools
- **Scene & theme** — Backgrounds, HDRI, themes, and effects
- **Auth** — Supabase (Google, email)

## Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **Kwami** — Use the published package (`kwami@^2.0.0`) or link locally (`file:../kwami`)

## Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.sample .env
# Edit .env with your API keys and endpoints (see below)
```

## Scripts

| Command       | Description                |
|---------------|----------------------------|
| `pnpm dev`    | Start dev server           |
| `pnpm build`  | Type-check and production build |
| `pnpm preview`| Preview production build   |
| `pnpm lint`   | Lint and fix               |
| `pnpm format` | Format with Prettier       |

## Environment variables

Copy `.env.sample` to `.env` and set:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_LIVEKIT_URL` | LiveKit WebSocket URL |
| `VITE_LIVEKIT_TOKEN_ENDPOINT` | Endpoint that issues LiveKit tokens |
| `VITE_ZEP_API_KEY` | Zep API key (memory) |
| `VITE_ZEP_BASE_URL` | Zep API base URL |
| `VITE_NAV_PROXY_URL` | Navigation proxy URL (optional) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/key |

## Tech stack

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript**
- **Vite 7**
- **Pinia** — state
- **Kwami** — 3D companion runtime (voice, avatar, memory, tools)
- **Three.js** — 3D (peer dependency of Kwami)
- **Supabase** — auth
- **PWA** — vite-plugin-pwa

## Project structure

```
src/
├── components/     # UI: panels, sidebar, auth, search, memory
├── composables/    # Kwami sync, voice options, navigation, etc.
├── presets/        # Avatar, scene, theme, agent presets
├── stores/         # Pinia stores (avatar, voice, scene, auth, …)
├── assets/         # Global styles, variables
├── lib/            # Supabase client
├── App.vue
└── main.ts
```

## License

Private. See repository settings.
