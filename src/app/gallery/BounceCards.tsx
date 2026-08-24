"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./BounceCards.css";

type BounceCardsProps = {
  className?: string;
  images?: string[];
  captions?: string[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
  hoverPushOffset?: number;
};

/** Pointer must rest on a card this long before clear-out starts */
const HOVER_ACTIVATE_MS = 220;

export default function BounceCards({
  className = "",
  images = [],
  captions = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.8)",
  transformStyles = [
    "rotate(10deg) translate(-170px)",
    "rotate(5deg) translate(-85px)",
    "rotate(-3deg)",
    "rotate(-10deg) translate(85px)",
    "rotate(2deg) translate(170px)",
  ],
  enableHover = true,
  hoverPushOffset = 220,
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef<number | null>(null);
  const pendingIdxRef = useRef<number | null>(null);
  const activateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transformStylesRef = useRef(transformStyles);
  transformStylesRef.current = transformStyles;

  useEffect(() => {
    const styles = transformStylesRef.current;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: reduce)", () => {
        images.forEach((_, i) => {
          const base = styles[i] || "none";
          gsap.set(`.card-${i}`, {
            transform: `${base} scale(1)`,
            opacity: 1,
          });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        images.forEach((_, i) => {
          const base = styles[i] || "none";
          gsap.fromTo(
            `.card-${i}`,
            { transform: `${base} scale(0)`, opacity: 0 },
            {
              transform: `${base} scale(1)`,
              opacity: 1,
              duration: 0.85,
              ease: easeType,
              delay: animationDelay + i * animationStagger,
            },
          );
        });
      });
    }, containerRef);

    return () => {
      mm.revert();
      ctx.revert();
      if (activateTimerRef.current) clearTimeout(activateTimerRef.current);
    };
  }, [images, transformStyles, animationStagger, easeType, animationDelay]);

  // When layout switches (mobile/desktop), snap cards to new transforms
  useEffect(() => {
    if (!containerRef.current) return;
    const q = gsap.utils.selector(containerRef);
    images.forEach((_, i) => {
      const base = transformStyles[i] || "none";
      gsap.set(q(`.card-${i}`), {
        transform: `${base} scale(1)`,
        zIndex: i + 1,
        pointerEvents: "auto",
      });
    });
    activeIdxRef.current = null;
  }, [transformStyles, images]);

  const getPushedTransform = (
    baseTransform: string,
    offsetX: number,
    offsetY: number,
  ) => {
    const translateXYRegex =
      /translate\(\s*([-0-9.]+)px\s*,\s*([-0-9.]+)px\s*\)/;
    const translateXRegex = /translate\(\s*([-0-9.]+)px\s*\)/;
    const xyMatch = baseTransform.match(translateXYRegex);
    if (xyMatch) {
      const newX = parseFloat(xyMatch[1]) + offsetX;
      const newY = parseFloat(xyMatch[2]) + offsetY;
      return baseTransform.replace(
        translateXYRegex,
        `translate(${newX}px, ${newY}px)`,
      );
    }
    const xMatch = baseTransform.match(translateXRegex);
    if (xMatch) {
      const newX = parseFloat(xMatch[1]) + offsetX;
      return baseTransform.replace(
        translateXRegex,
        `translate(${newX}px, ${offsetY}px)`,
      );
    }
    return baseTransform === "none"
      ? `translate(${offsetX}px, ${offsetY}px)`
      : `${baseTransform} translate(${offsetX}px, ${offsetY}px)`;
  };

  const clearActivateTimer = () => {
    if (activateTimerRef.current) {
      clearTimeout(activateTimerRef.current);
      activateTimerRef.current = null;
    }
  };

  const applyHoverState = (hoveredIdx: number) => {
    if (!containerRef.current) return;

    const q = gsap.utils.selector(containerRef);
    const styles = transformStylesRef.current;
    activeIdxRef.current = hoveredIdx;

    images.forEach((_, i) => {
      const target = q(`.card-${i}`);
      gsap.killTweensOf(target);

      const baseTransform = styles[i] || "none";

      if (i === hoveredIdx) {
        gsap.to(target, {
          transform: `${baseTransform} scale(1.05)`,
          zIndex: 100,
          pointerEvents: "auto",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      } else {
        const distance = Math.abs(hoveredIdx - i);
        const dirX = i < hoveredIdx ? -1 : 1;
        const mid = (images.length - 1) / 2;
        const dirY = i < mid ? -1 : 1;
        const offsetX = dirX * (hoverPushOffset + distance * 24);
        const offsetY = dirY * (50 + distance * 10);

        gsap.to(target, {
          transform: getPushedTransform(baseTransform, offsetX, offsetY),
          zIndex: 1,
          pointerEvents: "none",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      }
    });
  };

  const resetToBase = () => {
    if (!containerRef.current) return;

    const q = gsap.utils.selector(containerRef);
    const styles = transformStylesRef.current;
    activeIdxRef.current = null;

    images.forEach((_, i) => {
      const target = q(`.card-${i}`);
      gsap.killTweensOf(target);
      const baseTransform = styles[i] || "none";
      gsap.to(target, {
        transform: `${baseTransform} scale(1)`,
        zIndex: i + 1,
        pointerEvents: "auto",
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    });
  };

  const onCardEnter = (idx: number) => {
    if (!enableHover) return;

    pendingIdxRef.current = idx;
    clearActivateTimer();

    activateTimerRef.current = setTimeout(() => {
      if (pendingIdxRef.current !== idx) return;
      applyHoverState(idx);
    }, HOVER_ACTIVATE_MS);
  };

  const onCardLeave = (idx: number) => {
    if (!enableHover) return;

    if (pendingIdxRef.current === idx) {
      pendingIdxRef.current = null;
    }
    clearActivateTimer();

    if (activeIdxRef.current === idx) {
      resetToBase();
    }
  };

  const onCardTap = (idx: number) => {
    if (!enableHover) return;
    // Desktop mouse uses settle-to-hover; tap toggle is for touch
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    if (activeIdxRef.current === idx) {
      resetToBase();
      return;
    }
    clearActivateTimer();
    pendingIdxRef.current = idx;
    applyHoverState(idx);
  };

  return (
    <div
      className={`bounceCardsContainer ${className}`}
      ref={containerRef}
      style={{
        position: "relative",
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {images.map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          className={`card card-${idx}`}
          style={{
            transform: `${transformStyles[idx] ?? "none"} scale(0)`,
            zIndex: idx + 1,
          }}
          onMouseEnter={() => onCardEnter(idx)}
          onMouseLeave={() => onCardLeave(idx)}
          onClick={() => onCardTap(idx)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="image" src={src} alt={captions[idx] ?? `Memory ${idx + 1}`} />
          {captions[idx] ? (
            <span className="card-caption">{captions[idx]}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export type GalleryLayout = "mobile" | "laptop" | "desktop";

export function useGalleryLayout(
  mobileMax = 760,
  desktopMin = 1600,
): GalleryLayout {
  const [layout, setLayout] = useState<GalleryLayout>("desktop");

  useEffect(() => {
    const mobileMq = window.matchMedia(`(max-width: ${mobileMax}px)`);
    const desktopMq = window.matchMedia(`(min-width: ${desktopMin}px)`);

    const sync = () => {
      if (mobileMq.matches) {
        setLayout("mobile");
      } else if (desktopMq.matches) {
        setLayout("desktop");
      } else {
        setLayout("laptop");
      }
    };

    sync();
    mobileMq.addEventListener("change", sync);
    desktopMq.addEventListener("change", sync);
    return () => {
      mobileMq.removeEventListener("change", sync);
      desktopMq.removeEventListener("change", sync);
    };
  }, [mobileMax, desktopMin]);

  return layout;
}
