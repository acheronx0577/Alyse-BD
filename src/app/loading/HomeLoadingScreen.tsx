"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { HomeHoverTrail } from "./HomeHoverTrail";
import { useMotion } from "@/app/motion/motion-context";
import { shouldRunHomeIntro, markHomeIntroCompleted } from "@/lib/motion/home-intro";
import { primeTransitionOverlays } from "@/lib/motion/transition-gsap";

const ANIMATION_DURATION_MS = 3000;

function customEasing(t: number): number {
  if (t < 0.25) {
    return (t / 0.25) * 0.22;
  }
  return 0.22 + ((t - 0.25) / 0.75) * 0.78;
}

function formatVisitDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `celebrate ${month}/${day}/${year}`;
}

export function HomeLoadingScreen() {
  const { registerHomeLoading } = useMotion();
  const [phase, setPhase] = useState<"visible" | "gone">("gone");
  const [percentage, setPercentage] = useState(0);
  const visitDateRef = useRef("");
  const runIdRef = useRef(0);

  useLayoutEffect(() => {
    const runId = ++runIdRef.current;

    if (!shouldRunHomeIntro("/")) {
      registerHomeLoading(null);
      setPhase("gone");
      return;
    }

    primeTransitionOverlays();
    visitDateRef.current = formatVisitDate(new Date());
    setPhase("visible");

    let cancelled = false;
    let rafId = 0;

    const preventScroll = (event: Event) => event.preventDefault();
    const preventOptions: AddEventListenerOptions = { passive: false };

    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("wheel", preventScroll, preventOptions);
    document.addEventListener("touchmove", preventScroll, preventOptions);

    const loadingPromise = new Promise<void>((resolve) => {
      const startTime = Date.now();

      const animateCounter = () => {
        if (cancelled || runId !== runIdRef.current) {
          return;
        }

        const normalizedProgress = Math.min((Date.now() - startTime) / ANIMATION_DURATION_MS, 1);
        const easedProgress = customEasing(normalizedProgress);
        setPercentage(Math.floor(easedProgress * 100));

        if (normalizedProgress < 1) {
          rafId = requestAnimationFrame(animateCounter);
          return;
        }

        markHomeIntroCompleted();
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.removeEventListener("wheel", preventScroll, preventOptions);
        document.removeEventListener("touchmove", preventScroll, preventOptions);
        setPhase("gone");
        resolve();
      };

      rafId = requestAnimationFrame(animateCounter);
    });

    registerHomeLoading(loadingPromise);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.removeEventListener("wheel", preventScroll, preventOptions);
      document.removeEventListener("touchmove", preventScroll, preventOptions);
    };
  }, [registerHomeLoading]);

  if (phase === "gone") {
    return null;
  }

  return (
    <div
      className="loading-screen"
      id="homePageLoadingScreen"
      role="status"
      aria-label="Loading birthday celebration"
      aria-busy={true}
      suppressHydrationWarning
    >
      <div className="trail-container" />
      <HomeHoverTrail />

      <div className="loading-screen-logo">
        <div className="logo-container">
          <p className="loading-tag-text">
            <Link href="/">Alyse ✦ Birthday</Link>
          </p>
        </div>
      </div>

      <div className="loading-screen-btn">
        <div className="loading-screen-btn-wrapper">
          <p className="loading-tag-text">
            Preparing surprises<span className="loading-dots" />
          </p>
        </div>
      </div>

      <h1 className="loading-screen-title">Happy Birthday Alyse!</h1>

      <div className="loading-button">
        <div className="loading-button-text">
          <p>Getting everything ready...</p>
          <p className="loading-button-percent" aria-live="polite">
            <span id="percentageCounter">{percentage}</span>%
          </p>
        </div>
      </div>

      <div className="loading-screen-footer">
        <div className="loading-footer-brand">
          <p className="loading-tag-text">Party Cat Approved ✦ Alyse</p>
        </div>
        <div className="loading-footer-tags">
          <p className="loading-tag-text" suppressHydrationWarning>
            {visitDateRef.current}
          </p>
        </div>
      </div>
    </div>
  );
}
