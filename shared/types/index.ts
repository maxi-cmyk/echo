// Echo Adaptive - Shared Types

// Database tables
export interface Patient {
  id: string;
  clerk_id: string | null;
  display_name: string;
  pin_hash: string;
  created_at: string;
}

export interface PatientSettings {
  patient_id: string;
  fixation_cooldown_hours: number;
  novelty_weight: "low" | "medium" | "high";
  tap_sensitivity: "low" | "medium" | "high";
  sundowning_time: string;
  created_at: string;
  updated_at: string;
}

export interface VoiceProfile {
  id: string;
  patient_id: string;
  name: string;
  sample_url: string | null;
  elevenlabs_voice_id: string | null;
  status: "pending" | "processing" | "ready" | "failed";
  created_at: string;
}

export interface MediaAsset {
  id: string;
  patient_id: string;
  storage_path: string;
  public_url: string | null;
  type: "photo" | "video";
  date_taken: string | null;
  location: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Memory {
  id: string;
  patient_id: string;
  media_asset_id: string;
  script: string | null;
  voice_profile_id: string | null;
  audio_url: string | null;
  video_url: string | null;
  status: "processing" | "needs_review" | "approved" | "rejected";
  cooldown_until: string | null;
  engagement_count: number;
  last_shown_at: string | null;
  created_at: string;
}

export interface Interaction {
  id: string;
  patient_id: string;
  memory_id: string;
  interaction_type:
    | "view"
    | "like"
    | "swipe"
    | "hold"
    | "video_generated"
    | "audio_played";
  duration_ms: number | null;
  created_at: string;
}

export interface Session {
  id: string;
  patient_id: string;
  started_at: string;
  ended_at: string | null;
  memories_viewed: number;
  interactions_count: number;
}

// API request/response types
export interface MemorySynthesisRequest {
  media_asset_id: string;
  image_url: string;
}

export interface MemorySynthesisResponse {
  script: string;
  date?: string;
  location?: string;
  tags: string[];
}

export interface VoiceSynthesisRequest {
  script: string;
  voice_id: string;
}

// Patient app UI types
export interface MemoryCard {
  id: string;
  image_url: string;
  date: string | null;
  location: string | null;
  audio_url?: string;
  video_url?: string;
}
