"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY_VOLUME = "alyse-bg-music-volume";
const STORAGE_KEY_MUTED = "alyse-bg-music-muted";
const DEFAULT_VOLUME = 0.6;
const MUSIC_SRC = "/music/super-idol.mp3";

function getSavedVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_VOLUME);
    if (!raw) return DEFAULT_VOLUME;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function getSavedMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_MUTED) === "true";
  } catch {
    return false;
  }
}

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const userInteractedRef = useRef(false);

  // Initialize from storage on mount
  useEffect(() => {
    const savedVol = getSavedVolume();
    const savedMuted = getSavedMuted();
    setVolume(savedVol);
    setIsMuted(savedMuted);
    setHydrated(true);
  }, []);

  // Sync audio element volume and muted properties
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hydrated) return;
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.muted = isMuted || volume <= 0.001;
  }, [hydrated, volume, isMuted]);

  // Persist volume settings
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
      window.localStorage.setItem(STORAGE_KEY_MUTED, String(isMuted));
    } catch {
      // Ignore quota errors in private browsing
    }
  }, [hydrated, volume, isMuted]);

  // Play audio safely
  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  // Autoplay attempt and fallback gesture unlock
  useEffect(() => {
    if (!hydrated) return;
    const audio = audioRef.current;
    if (!audio) return;

    const tryAutoPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked by browser policy; wait for first user gesture
        setIsPlaying(false);
        const unlock = () => {
          if (!userInteractedRef.current) {
            userInteractedRef.current = true;
            void audio.play().then(
              () => setIsPlaying(true),
              () => setIsPlaying(false)
            );
          }
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
          window.removeEventListener("touchstart", unlock);
        };

        window.addEventListener("pointerdown", unlock, { passive: true });
        window.addEventListener("keydown", unlock, { passive: true });
        window.addEventListener("touchstart", unlock, { passive: true });
      }
    };

    void tryAutoPlay();

    // MediaSession API setup
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "Super Idol (热爱105°C的你)",
          artist: "Shania Yan Cover",
          album: "Alyse's Birthday Celebration",
        });
        navigator.mediaSession.setActionHandler("play", () => {
          void attemptPlay();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          audio.pause();
          setIsPlaying(false);
        });
      } catch {
        // Ignore unsupported MediaSession handlers
      }
    }
  }, [hydrated, attemptPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void attemptPlay();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume <= 0.001) {
      setVolume(DEFAULT_VOLUME);
    }
    if (!isPlaying && !nextMuted) {
      void attemptPlay();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = parseFloat(e.target.value);
    setVolume(nextVal);
    if (nextVal > 0 && isMuted) {
      setIsMuted(false);
    }
    if (!isPlaying && nextVal > 0) {
      void attemptPlay();
    }
  };

  const effectiveMuted = isMuted || volume <= 0.001;

  return (
    <aside
      className={`bg-music-widget ${isExpanded ? "is-expanded" : ""} ${isPlaying && !effectiveMuted ? "is-active" : ""}`}
      aria-label="Background Music Player"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="bg-music-pill">
        <button
          type="button"
          className="bg-music-btn bg-music-play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause background music" : "Play background music"}
          title={isPlaying ? "Pause Super Idol" : "Play Super Idol"}
        >
          {isPlaying && !effectiveMuted ? (
            <span className="bg-music-equalizer" aria-hidden="true">
              <span className="bar b1" />
              <span className="bar b2" />
              <span className="bar b3" />
              <span className="bar b4" />
            </span>
          ) : (
            <span className="bg-music-icon" aria-hidden="true">
              {isPlaying ? "⏸" : "▶"}
            </span>
          )}
        </button>

        <div className="bg-music-info">
          <span className="bg-music-title">Super Idol</span>
          <span className="bg-music-tag">♫ 105°C</span>
        </div>

        <div className="bg-music-controls">
          <button
            type="button"
            className="bg-music-btn bg-music-mute-btn"
            onClick={toggleMute}
            aria-label={effectiveMuted ? "Unmute background music" : "Mute background music"}
            title={effectiveMuted ? "Unmute" : "Mute"}
          >
            {effectiveMuted ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
          </button>

          <div className="bg-music-slider-wrap">
            <input
              type="range"
              className="bg-music-slider"
              min="0"
              max="1"
              step="0.02"
              value={effectiveMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Music volume"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
