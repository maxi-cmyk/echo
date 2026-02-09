# System Architecture

## 1. High-Level Overview

Echo Adaptive is a Progressive Web App (PWA) built on a modern serverless stack. It uses local AI for vision analysis and cloud services for voice synthesis.

## 2. Technology Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | Next.js 16 (App Router), React, CSS |
| Database   | Supabase (PostgreSQL)               |
| Auth       | Clerk (Passwordless)                |
| Storage    | Supabase Storage                    |
| Vision AI  | Ollama (Llava) via ngrok            |
| Voice AI   | ElevenLabs (TTS + Cloning)          |
| Deployment | Vercel                              |

## 3. Data Flow

### 3.1. Media Ingestion Pipeline

```
User Upload → Supabase Storage → /api/media-analyze → Ollama (Llava)
                                        ↓
                              Extract: summary, people, location, date
                                        ↓
                              Insert: media_assets + memories tables
```

1. **Upload**: User uploads file via Settings → Media Management
2. **Storage**: File saved to Supabase Storage bucket `media-assets`
3. **Analysis**: `/api/media-analyze` sends image to Ollama (Llava)
4. **Metadata**: AI extracts summary, people, location, date
5. **Persistence**: Records created in `media_assets` and `memories` tables
6. **Review**: Memory starts with status `needs_review`

### 3.2. Narration Generation

```
Memory Display → Check audio_url → /api/narrator-generate
                                          ↓
                              Ollama: Generate script (10 words max)
                                          ↓
                              ElevenLabs: Generate audio
                                          ↓
                              Update: memory.script + memory.audio_url
```

### 3.3. Feed Delivery

1. **Auth**: Client authenticates via Clerk
2. **Query**: PatientView fetches memories where `status = 'approved'`
3. **Filter**: Exclude memories with active cooldown (`cooldown_until > now`)
4. **Shuffle**: Randomize order for variety
5. **Play**: Display with narration audio

## 4. API Routes

| Route                    | Method | Purpose                                       |
| ------------------------ | ------ | --------------------------------------------- |
| `/api/media-analyze`     | POST   | Analyze image → extract metadata (Ollama)     |
| `/api/narrator-generate` | POST   | Generate script + audio (Ollama + ElevenLabs) |
| `/api/voice-clone`       | POST   | Clone voice from audio sample                 |
| `/api/voice-delete`      | DELETE | Remove cloned voice                           |
| `/api/voice-preview`     | POST   | Preview TTS with specific voice               |

## 5. Database Schema

```
┌─────────────────┐       ┌─────────────────┐
│  media_assets   │       │    memories     │
├─────────────────┤       ├─────────────────┤
│ id              │──────<│ media_asset_id  │
│ user_id         │       │ id              │
│ storage_path    │       │ user_id         │
│ public_url      │       │ script          │
│ type            │       │ audio_url       │
│ metadata (JSON) │       │ status          │
│ created_at      │       │ engagement_score│
└─────────────────┘       │ recall_count    │
                          │ cooldown_until  │
┌─────────────────┐       │ created_at      │
│     voices      │       └─────────────────┘
├─────────────────┤
│ id              │
│ user_id         │
│ voice_id        │  (ElevenLabs ID)
│ name            │
│ is_active       │
│ created_at      │
└─────────────────┘
```

## 6. Security Architecture

| Layer           | Implementation                  |
| --------------- | ------------------------------- |
| Authentication  | Clerk (passwordless email, JWT) |
| Authorization   | Supabase RLS per `user_id`      |
| Settings Access | 4-digit PIN protection          |
| Data at Rest    | Supabase encryption             |
| Data in Transit | TLS 1.3                         |

## 7. External Service Dependencies

| Service        | Purpose         | Failure Mode            |
| -------------- | --------------- | ----------------------- |
| Ollama (local) | Vision analysis | Fallback metadata       |
| ElevenLabs     | TTS generation  | No audio (caption only) |
| Supabase       | DB + Storage    | App non-functional      |
| Clerk          | Auth            | Cannot sign in          |
| ngrok          | Expose Ollama   | Analysis unavailable    |
