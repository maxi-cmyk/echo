"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "../../hooks/useSupabase";
import useAdaptationEngine from "../../hooks/useAdaptationEngine";

// Inline SVG Icons (avoiding lucide-react dependency)
const HeartIcon = ({
  filled,
  className,
}: {
  filled?: boolean;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StarIcon = ({
  filled,
  className,
}: {
  filled?: boolean;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

interface Memory {
  id: string;
  script?: string;
  audio_url?: string;
  media_assets: {
    public_url: string;
    type: "photo" | "video";
    metadata: {
      summary?: string;
      date?: string;
      location?: string;
    };
  };
}

export default function PatientView() {
  const supabase = useSupabase();
  const { isLoaded, isSignedIn } = useUser();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [likedMemories, setLikedMemories] = useState<Set<string>>(new Set());
  const [recalledMemories, setRecalledMemories] = useState<Set<string>>(
    new Set(),
  );

  // Narration State
  const [narrationScript, setNarrationScript] = useState<string | null>(null);
  const [narrationAudio, setNarrationAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isListening, setIsListening] = useState(false);

  const {
    state: adaptationState,
    registerTap,
    resetVoiceMode,
    activateVoiceMode,
  } = useAdaptationEngine({
    sundowningTime: "18:00",
    tapSensitivity: "medium",
    onModeChange: (s) => console.log("Mode:", s),
  });

  // TTS for Voice Mode
  useEffect(() => {
    if (adaptationState.isVoiceMode && !isListening) {
      const msg = new SpeechSynthesisUtterance("Tap the microphone to speak");
      window.speechSynthesis.speak(msg);
    }
  }, [adaptationState.isVoiceMode]);

  // Speech Recognition
  useEffect(() => {
    if (!isListening) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.error("Speech recognition not supported");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Heard:", transcript);

      // Parse commands
      if (transcript.includes("next")) {
        const nextIndex = Math.min(currentIndex + 1, memories.length - 1);
        setCurrentIndex(nextIndex);
        // Instantly scroll to the next memory
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: nextIndex * window.innerHeight,
            behavior: "instant",
          });
        }
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Next"));
      } else if (transcript.includes("like")) {
        const mem = memories[currentIndex];
        if (mem) {
          setLikedMemories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(mem.id)) newSet.delete(mem.id);
            else newSet.add(mem.id);
            return newSet;
          });
        }
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Liked"));
      } else if (transcript.includes("recall")) {
        const mem = memories[currentIndex];
        if (mem) {
          setRecalledMemories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(mem.id)) newSet.delete(mem.id);
            else newSet.add(mem.id);
            return newSet;
          });
        }
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Recalled"));
      } else {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(
            "I didn't understand. Try saying next, like, or recall.",
          ),
        );
      }

      setIsListening(false);
      resetVoiceMode();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();

    return () => {
      recognition.abort();
    };
  }, [isListening, memories, currentIndex, resetVoiceMode]);

  const currentMemory = memories[currentIndex];
  const isLiked = currentMemory ? likedMemories.has(currentMemory.id) : false;
  const isRecalled = currentMemory
    ? recalledMemories.has(currentMemory.id)
    : false;

  // Fetch Memories
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("*, media_assets!inner(*)")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        const filtered = (data || []).filter((m: Memory) => {
          const cooldown = (m as { cooldown_until?: string }).cooldown_until;
          if (!cooldown) return true;
          return new Date(cooldown) < new Date();
        });

        setMemories(filtered);
      } catch (err) {
        console.error(
          "Fetch memories failed details:",
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
        );
        console.error("Raw error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [isSignedIn]);

  // Handle scroll snap
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < memories.length
    ) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, memories.length]);

  // Narration generation
  useEffect(() => {
    setNarrationScript(null);
    setNarrationAudio(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!currentMemory) return;
    if (currentMemory.media_assets.type === "video") return;

    if (currentMemory.script && currentMemory.audio_url) {
      setNarrationScript(currentMemory.script);
      setNarrationAudio(currentMemory.audio_url);
      return;
    }

    const generate = async () => {
      const voiceId = localStorage.getItem("active_voice_id") || "default";
      let script = currentMemory.script || "";

      if (!script) {
        try {
          const response = await fetch("/api/generate-narrator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: currentMemory.media_assets.public_url,
              voiceId,
            }),
          });
          const data = await response.json();
          if (data.script && data.audioUrl) {
            setNarrationScript(data.script);
            setNarrationAudio(data.audioUrl);
            await supabase
              .from("memories")
              .update({ script: data.script, audio_url: data.audioUrl })
              .eq("id", currentMemory.id);
            return;
          }
        } catch (e) {
          console.error("Narration gen error", e);
        }
      } else {
        setNarrationScript(script);
        try {
          const response = await fetch("/api/voice-preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ voiceId, text: script }),
          });
          if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            setNarrationAudio(audioUrl);
          }
        } catch (e) {
          console.error("TTS error", e);
        }
      }
    };

    const timer = setTimeout(generate, 500);
    return () => clearTimeout(timer);
  }, [currentIndex, currentMemory]);

  // Play audio when available
  useEffect(() => {
    if (narrationAudio && audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Autoplay blocked", e));
    }
  }, [narrationAudio]);

  // Toggle Like
  const toggleLike = async () => {
    if (!currentMemory) return;
    const newLiked = new Set(likedMemories);
    if (newLiked.has(currentMemory.id)) {
      newLiked.delete(currentMemory.id);
    } else {
      newLiked.add(currentMemory.id);
    }
    setLikedMemories(newLiked);

    try {
      await supabase.rpc("increment_column", {
        table_name: "memories",
        column_name: "engagement_count",
        row_id: currentMemory.id,
      });
    } catch (e) {
      console.error("Failed to update engagement", e);
    }
  };

  // Toggle Recall
  const toggleRecall = async () => {
    if (!currentMemory) return;
    const newRecalled = new Set(recalledMemories);
    if (newRecalled.has(currentMemory.id)) {
      newRecalled.delete(currentMemory.id);
    } else {
      newRecalled.add(currentMemory.id);
    }
    setRecalledMemories(newRecalled);

    try {
      await supabase.rpc("increment_column", {
        table_name: "memories",
        column_name: "recall_score",
        row_id: currentMemory.id,
      });
    } catch (e) {
      console.error("Failed to update recall", e);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <main className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Loading memories...
        </div>
      </main>
    );
  }

  // Empty State
  if (memories.length === 0) {
    return (
      <main className="h-screen w-screen bg-black flex flex-col items-center justify-center px-10">
        <div className="text-6xl mb-6">📷</div>
        <h1 className="text-white text-3xl font-bold mb-4 text-center">
          No Memories Yet
        </h1>
        <p className="text-gray-400 text-xl text-center mb-8">
          Add photos and videos in Settings
        </p>
        <Link
          href="/settings"
          onClick={(e) => {
            e.stopPropagation();
            registerTap(true);
          }}
          className={`absolute top-4 right-4 z-40 p-4 bg-black/40 backdrop-blur-md rounded-full text-white/80 transition-all ${adaptationState.isVoiceMode ? "scale-150 ring-4 ring-yellow-500" : ""}`}
        >
          Open Settings
        </Link>
      </main>
    );
  }

  return (
    <main
      className={`h-screen w-screen bg-black overflow-hidden ${adaptationState.isSundowningMode ? "sundowning-mode" : ""}`}
    >
      {/* Voice Mode Overlay */}
      {adaptationState.isVoiceMode && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <h2 className="text-4xl font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-500">
            {isListening ? "Listening..." : "Tap Microphone to Speak"}
          </h2>
          <p className="text-xl text-gray-400 mb-8 text-center animate-in slide-in-from-bottom-5 duration-700">
            {isListening
              ? "Say your command"
              : "Say 'Next', 'Like', or 'Recall'"}
          </p>

          {/* Interactive Mic Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newState = !isListening;
              setIsListening(newState);
              if (newState) {
                window.speechSynthesis.speak(
                  new SpeechSynthesisUtterance("I'm listening"),
                );
              }
            }}
            className={`w-32 h-32 rounded-full flex items-center justify-center my-8 transition-all cursor-pointer z-50 relative border-4 ${isListening ? "bg-red-500 border-red-400 animate-pulse scale-110 shadow-lg shadow-red-500/50" : "bg-red-500/40 border-red-500 hover:bg-red-500/60 hover:scale-105 active:scale-95"}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-20 h-20 pointer-events-none ${isListening ? "text-white" : "text-red-500"}`}
              fill="currentColor"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsListening(false);
              resetVoiceMode();
            }}
            className="px-12 py-4 bg-gray-800 rounded-full text-white text-xl font-medium border-2 border-gray-500 hover:bg-gray-700 hover:border-gray-400 transition-colors z-50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Container - Track Missed Taps */}
      <div
        ref={containerRef}
        onClick={() => registerTap(false)}
        className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar"
        onScroll={handleScroll}
      >
        {memories.map((memory, index) => (
          <div
            key={memory.id}
            className="h-screen w-screen snap-start snap-always relative flex items-center justify-center"
          >
            {/* Ken Burns Effect for Images */}
            {memory.media_assets.type === "photo" ? (
              <img
                src={memory.media_assets.public_url}
                alt="Memory"
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[12000ms] ease-linear ${
                  index === currentIndex ? "scale-110" : "scale-100"
                }`}
                draggable={false}
              />
            ) : (
              <video
                src={memory.media_assets.public_url}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            )}

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Settings Gear - Top Right */}
      <Link
        href="/settings"
        className="absolute top-10 right-10 z-50 w-[60px] h-[60px] flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 transition-all hover:bg-black/50"
        style={{ boxShadow: "0 0 20px rgba(149, 180, 139, 0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <SettingsIcon className="w-8 h-8 text-[#95B48B]" />
      </Link>

      {/* Action Hub - Right Column */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-8">
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            registerTap(true);
            toggleLike(currentMemory.id);
          }}
          className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 ${
            likedMemories.has(currentMemory.id)
              ? "bg-red-500/20 text-red-500 scale-110"
              : "bg-black/30 text-white hover:bg-white/10"
          } ${adaptationState.isVoiceMode ? "scale-150 ring-4 ring-red-500 mb-8" : "mb-6"}`}
        >
          <HeartIcon
            filled={likedMemories.has(currentMemory.id)}
            className="w-8 h-8"
          />
        </button>

        {/* Recall Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            registerTap(true);
            toggleRecall(currentMemory.id);
          }}
          className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 ${
            recalledMemories.has(currentMemory.id)
              ? "bg-yellow-500/20 text-yellow-500 scale-110"
              : "bg-black/30 text-white hover:bg-white/10"
          } ${adaptationState.isVoiceMode ? "scale-150 ring-4 ring-yellow-500" : ""}`}
        >
          <StarIcon
            filled={recalledMemories.has(currentMemory.id)}
            className="w-8 h-8"
          />
        </button>
      </div>

      {/* Bottom Left - Date/Time */}
      {currentMemory?.media_assets.metadata?.date && (
        <div className="absolute bottom-[100px] left-10 z-50">
          <p
            className="text-white text-2xl font-bold"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
          >
            {currentMemory.media_assets.metadata.date}
          </p>
        </div>
      )}

      {/* Bottom Right - Location */}
      {currentMemory?.media_assets.metadata?.location && (
        <div className="absolute bottom-[100px] right-10 z-50">
          <p
            className="text-white text-2xl font-bold text-right"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
          >
            {currentMemory.media_assets.metadata.location}
          </p>
        </div>
      )}

      {/* Center Caption */}
      {narrationScript && (
        <div className="absolute bottom-[160px] left-10 right-10 z-50 animate-fade-in">
          <p
            className="text-white text-2xl font-medium text-center leading-relaxed"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
          >
            {narrationScript}
          </p>
        </div>
      )}

      {/* Audio Element */}
      <audio ref={audioRef} src={narrationAudio || undefined} />

      {/* Hide scrollbar and custom animations */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes pulse-once {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-pulse-once {
          animation: pulse-once 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
