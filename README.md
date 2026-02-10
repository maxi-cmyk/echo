# Echo Adaptive: Tiktok, but for Dementia

> **A reminiscence therapy platform with adaptive accessibility for dementia patients.**

<p align="center">
  <img width="200" src="https://github.com/user-attachments/assets/8eaab12e-8eb0-4cfa-81eb-7039a7628929" />
  <img width="200" src="https://github.com/user-attachments/assets/9f4981b7-c771-43a7-b6f7-04dc972f0ed1" />
  <img width="200" src="https://github.com/user-attachments/assets/f5bd56b8-b924-4ba5-b620-e09798c26092" />
</p>

Echo Adaptive is a digital companion that delivers personalized memories to patients with cognitive impairment. It uses AI-powered narration and an "Adaptation Engine" that dynamically adjusts the interface based on time of day, behavioral cues, and environmental factors.

---

## ✨ Features

| Feature             | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| **Forever Feed**    | TikTok-style fullscreen memory viewer with vertical snap-scroll          |
| **AI Narration**    | Automatic voiceover generation for each memory using llava + ElevenLabs |
| **Voice Commands**  | Say "Next", "Like", or "Recall" to control the app hands-free            |
| **Sundowning Mode** | Warm amber theme automatically activates after 6PM                       |
| **Error Tolerance** | Detects missed taps and offers Voice Mode for accessibility              |
| **Voice Cloning**   | Clone a familiar voice (e.g., family member) for personalized narration  |
| **PIN Protection**  | Caregiver settings are secured behind a numeric PIN                      |

---

## ❤️ Core Interactions

- **Like (Heart)**: Acknowledges a memory and applies a **24-hour cooldown** to prevent repetitive loops.
- **Recall (Loop)**: Logs a meaningful memory. Future viewings may trigger an **Active Recall Prompt** ("Do you remember this?") to help strengthen neural pathways.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 + React + Tailwind CSS
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL + Row-Level Security)
- **AI**:
  - **Vision/Text**: Local Ollama (Llava) via Ngrok tunnel
  - **Voice**: ElevenLabs (TTS)

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

### 1. **Setup Local AI (Ollama + Llava)**

This app uses **Llava** (a vision-language model) running locally via **Ollama** for image analysis. To make it accessible from deployed apps or mobile devices, we expose it via **ngrok**.

#### Step 1: Install Ollama

```bash
# macOS
brew install ollama

# Or download from https://ollama.ai
```

#### Step 2: Download the Llava Model

```bash
ollama pull llava
```

#### Step 3: Start Ollama Server

```bash
ollama serve
# Keep this terminal running
```

#### Step 4: Install and Configure ngrok

```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# Authenticate (get token from https://dashboard.ngrok.com)
ngrok config add-authtoken <your-token>
```

#### Step 5: Expose Ollama via ngrok

```bash
./scripts/expose-ollama.sh
```

This will output a URL like `https://abc123.ngrok.io`

#### Step 6: Update Environment Variable

> ⚠️ **IMPORTANT**: The ngrok URL changes every time you restart it (unless you have a paid plan with static domains).

Update your `.env.local` or Vercel environment:

```env
OLLAMA_BASE_URL=https://abc123.ngrok.io
```

If deploying to Vercel, update the env var in the Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Update `OLLAMA_BASE_URL` with the new ngrok URL
3. Redeploy the app

### 2. **Get Started**

1.  **Sign In**: Use your email (Clerk passwordless login).
2.  **Unlock Settings**: Tap the ⚙️ icon (top-right). Default PIN: `1234`.

### 3. **Manage Content**

- **Upload**: In Settings > Media Management, upload photos/videos.
  - _Note_: The AI will automatically analyze them to generate descriptions.
- **Review**: Greenlight memories to add them to the patient's feed.

### 4. **Clone a Voice**

1.  Go to **Settings > Neural Proxy**.
2.  Tap "Start Recording" and read the prompt for 1 minute.
3.  Name the voice (e.g., "Grandma") and save.
4.  Select it as the **Active Narrator**.

### 5. **Patient Mode**

- **Watch**: Memories play automatically with AI narration.
- **Interact**:
  - Double-tap to **Like** ❤️ (boosts engagement score).
  - Long-press to **Recall** 🔄 (triggers future "Do you remember?" prompts).
- **Voice Control**: Tap empty space 3x (or miss targets) to activate Voice Mode. Say "Next", "Like", or "Recall".

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
│   └── patient-pwa/                    # Next.js PWA
│       ├── public/                     # Static assets
│       │   ├── icon-192.png            # PWA icon (small)
│       │   ├── icon-512.png            # PWA icon (large)
│       │   ├── logo.png                # Echo logo
│       │   └── manifest.json           # PWA manifest
│       └── src/
│           ├── app/
│           │   ├── (protected)/        # Auth-required pages
│           │   │   ├── components/     # Shared UI components
│           │   │   │   └── HistorySection.tsx
│           │   │   ├── settings/       # Caregiver settings page
│           │   │   ├── layout.tsx      # Protected layout (auth check)
│           │   │   └── page.tsx        # Patient memory feed
│           │   ├── api/                # API routes
│           │   │   ├── media-analyze/  # Image analysis (Ollama)
│           │   │   ├── narrator-generate/ # Narration + TTS
│           │   │   ├── voice-clone/    # Voice cloning (ElevenLabs)
│           │   │   ├── voice-delete/   # Delete cloned voice
│           │   │   └── voice-preview/  # TTS preview
│           │   ├── sign-in/            # Clerk auth pages
│           │   ├── sign-up/
│           │   ├── globals.css         # Design system + themes
│           │   └── layout.tsx          # Root layout
│           ├── hooks/                  # Custom React hooks
│           │   ├── useAdaptationEngine.ts  # Sundowning + Voice mode
│           │   └── useSupabase.ts      # Supabase client
│           ├── lib/                    # Utility libraries
│           │   ├── ollama.ts           # Ollama API client
│           │   └── supabase.ts         # Supabase config
│           └── types/                  # TypeScript definitions
│               └── index.ts
├── supabase/
│   └── migrations/                     # Database schema (RLS enabled)
├── scripts/
│   └── expose-ollama.sh                # ngrok tunnel for Ollama
├── docs/                               # PRD, Architecture, Design
└── README.md
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

