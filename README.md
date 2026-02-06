# Echo Adaptive

> **A reminiscence therapy platform with adaptive accessibility for dementia patients.**

Echo Adaptive is a digital companion that delivers personalized memories to patients with cognitive impairment. It uses AI-powered narration and an "Adaptation Engine" that dynamically adjusts the interface based on time of day, behavioral cues, and environmental factors.

---

## ✨ Features

| Feature             | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| **Forever Feed**    | TikTok-style fullscreen memory viewer with vertical snap-scroll          |
| **AI Narration**    | Automatic voiceover generation for each memory using GPT-4o + ElevenLabs |
| **Voice Commands**  | Say "Next", "Like", or "Recall" to control the app hands-free            |
| **Sundowning Mode** | Warm amber theme automatically activates after 6PM                       |
| **Error Tolerance** | Detects missed taps and offers Voice Mode for accessibility              |
| **PIN Protection**  | Caregiver settings are secured behind a numeric PIN                      |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 + React + Tailwind CSS
- **Auth**: Clerk (passwordless)
- **Database**: Supabase (PostgreSQL + Row-Level Security)
- **AI**: OpenAI GPT-4o (vision), ElevenLabs (TTS)

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm v9+
- Supabase project (with anon key)
- Clerk application (with publishable + secret keys)
- OpenAI API key

### 1. Clone & Install

```bash
git clone <repo-url>
cd intuition-Hack
npm install
```

### 2. Configure Environment

Create a `.env.local` file in `apps/patient-pwa/`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
```

### 3. Set Up Database

Apply the schema to your Supabase project:

```bash
# Option A: Via Supabase Dashboard
# Copy contents of supabase/migrations/001_initial_schema.sql and run in SQL Editor

# Option B: Via CLI
supabase link --project-ref <your-ref>
supabase db push
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Usage

1. **Sign In** with Clerk (email OTP)
2. **Access Settings** (⚙️ top-right) with PIN `1234` (default)
3. **Upload Memories** (photos/videos) in Settings
4. **Watch the Feed** – memories are narrated and displayed fullscreen
5. **Use Voice Mode** – tap empty space 3+ times to activate, then speak commands

---

## 🌙 Adaptive Modes

| Mode           | Trigger        | Effect                                       |
| -------------- | -------------- | -------------------------------------------- |
| **Sundowning** | After 6:00 PM  | Warm amber colors, sepia-tinted media        |
| **Voice Mode** | 3+ missed taps | Large mic button, speech recognition enabled |

---

## 📁 Project Structure

```
intuition-Hack/
├── apps/
│   └── patient-pwa/        # Next.js PWA
│       ├── src/app/        # Pages & API routes
│       ├── src/hooks/      # useSupabase, useAdaptationEngine
│       └── src/services/   # Video caching
├── supabase/
│   └── migrations/         # Database schema (RLS enabled)
├── docs/                   # PRD, Architecture, Design
└── README.md               # This file
```

---

## 📜 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run lint`  | Run ESLint               |

---

## 🔐 Security Notes

- All data is protected by Supabase Row-Level Security (RLS)
- Patients can only access their own memories
- Settings are PIN-protected
- Auth tokens are refreshed automatically via Clerk

---

## 📄 License

MIT
