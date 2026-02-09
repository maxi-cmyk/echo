"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AdaptationState {
  missedTaps: number;
  isVoiceMode: boolean;
  isSundowningMode: boolean;
}

interface AdaptationEngineProps {
  sundowningTime: string; // HH:MM format
  tapSensitivity: "low" | "medium" | "high";
  onModeChange: (state: AdaptationState) => void;
}

const SENSITIVITY_THRESHOLDS = {
  low: 5,
  medium: 3,
  high: 2,
};

export function useAdaptationEngine({
  sundowningTime,
  tapSensitivity,
  onModeChange,
}: AdaptationEngineProps) {
  const [state, setState] = useState<AdaptationState>({
    missedTaps: 0,
    isVoiceMode: false,
    isSundowningMode: false,
  });

  const tapAreaRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef<number>(0);

  // Check sundowning time
  useEffect(() => {
    const checkSundowning = () => {
      const now = new Date();
      const [hours, minutes] = sundowningTime.split(":").map(Number);
      const sundownStart = new Date();
      sundownStart.setHours(hours, minutes, 0, 0);

      const isSundowning = now >= sundownStart;

      // console.log("Sundown Check:", {
      //   currentTime: now.toLocaleTimeString(),
      //   sundownTime: sundowningTime,
      //   isSundowning,
      //   currentSundowningMode: state.isSundowningMode,
      // });

      if (isSundowning !== state.isSundowningMode) {
        const newState = { ...state, isSundowningMode: isSundowning };
        setState(newState);
        onModeChange(newState);
        // console.log("Sundown mode changed to:", isSundowning);
      }
    };

    checkSundowning();
    const interval = setInterval(checkSundowning, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sundowningTime, state.isSundowningMode, onModeChange]);

  // Track missed taps
  const registerTap = useCallback(
    (hitTarget: boolean) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;
      lastTapTime.current = now;

      if (!hitTarget && timeSinceLastTap < 2000) {
        // Missed tap within 2 seconds of last tap
        const newMissedTaps = state.missedTaps + 1;
        const threshold = SENSITIVITY_THRESHOLDS[tapSensitivity];

        if (newMissedTaps >= threshold && !state.isVoiceMode) {
          // Switch to voice mode
          const newState = {
            ...state,
            missedTaps: newMissedTaps,
            isVoiceMode: true,
          };
          setState(newState);
          onModeChange(newState);
        } else {
          setState({ ...state, missedTaps: newMissedTaps });
        }
      } else if (hitTarget) {
        // Successful tap, reset counter
        setState({ ...state, missedTaps: 0 });
      }
    },
    [state, tapSensitivity, onModeChange],
  );

  // Reset voice mode
  const resetVoiceMode = useCallback(() => {
    const newState = { ...state, isVoiceMode: false, missedTaps: 0 };
    setState(newState);
    onModeChange(newState);
  }, [state, onModeChange]);

  // Activate voice mode
  const activateVoiceMode = useCallback(() => {
    const newState = { ...state, isVoiceMode: true };
    setState(newState);
    onModeChange(newState);
  }, [state, onModeChange]);

  return {
    state,
    registerTap,
    resetVoiceMode,
    activateVoiceMode,
    tapAreaRef,
  };
}

export default useAdaptationEngine;
