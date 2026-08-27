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

/** Pointer must rest on a card this long before clear-out starts (fast hover guard) */
const HOVER_ACTIVATE_MS = 220;

function extractDominantColor(img: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    canvas.width = 32;
    canvas.height = 32;
    ctx.drawImage(img, 0, 0, 32, 32);

    const { data } = ctx.getImageData(0, 0, 32, 32);
    const pixels: Array<{ r: number; g: number; b: number; weight: number }> = [];

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 128) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      const l = (max + min) / 2 / 255;
      const s = delta === 0 ? 0 : delta / (255 * (1 - Math.abs(2 * l - 1)));

      if (l >= 0.12 && l <= 0.95 && s > 0.08) {
        pixels.push({ r, g, b, weight: s * (1 - Math.abs(l - 0.55)) });
      }
    }

    if (pixels.length === 0) {
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue;
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        const l = (r + g + b) / 3 / 255;
        if (l > 0.08 && l < 0.96) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }
      if (count === 0) return null;
      return `rgb(${Math.round(rSum / count)}, ${Math.round(gSum / count)}, ${Math.round(bSum / count)})`;
    }

    pixels.sort((a, b) => b.weight - a.weight);
    const top = pixels.slice(0, Math.max(8, Math.floor(pixels.length * 0.35)));
    let totalW = 0,
      rTot = 0,
      gTot = 0,
      bTot = 0;
    for (const p of top) {
      rTot += p.r * p.weight;
      gTot += p.g * p.weight;
      bTot += p.b * p.weight;
      totalW += p.weight;
    }
    return `rgb(${Math.round(rTot / totalW)}, ${Math.round(gTot / totalW)}, ${Math.round(bTot / totalW)})`;
  } catch {
    return null;
  }
}

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

  const [scale, setScale] = useState(1);
  const [borderColors, setBorderColors] = useState<Record<number, string>>({});
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const topZIndexRef = useRef<number>(images.length + 10);
  const cardZIndicesRef = useRef<number[]>(images.map((_, i) => i + 1));

  const handleImageLoad = (img: HTMLImageElement, idx: number) => {
    const col = extractDominantColor(img);
    if (col) {
      setBorderColors((prev) => (prev[idx] === col ? prev : { ...prev, [idx]: col }));
    }
  };

  useEffect(() => {
    if (cardZIndicesRef.current.length !== images.length) {
      cardZIndicesRef.current = images.map((_, i) => i + 1);
      topZIndexRef.current = images.length + 10;
    }
  }, [images]);

  useEffect(() => {
    imgRefs.current.forEach((img, idx) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const col = extractDominantColor(img);
        if (col) {
          setBorderColors((prev) => (prev[idx] === col ? prev : { ...prev, [idx]: col }));
        }
      }
    });
  }, [images]);

  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const updateScale = () => {
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      if (!parentWidth || !parentHeight) return;

      const scaleX = parentWidth / containerWidth;
      const scaleY = parentHeight / containerHeight;
      const fitScale = Math.min(1, scaleX, scaleY);
      setScale(Math.max(0.3, fitScale));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(parent);
    window.addEventListener("resize", updateScale);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [containerWidth, containerHeight]);

  useEffect(() => {
    const styles = transformStylesRef.current;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: reduce)", () => {
        images.forEach((_, i) => {
          const base = styles[i] || "none";
          const zIndex = cardZIndicesRef.current[i] ?? (i + 1);
          gsap.set(`.card-${i}`, {
            transform: `${base} scale(1)`,
            zIndex,
            opacity: 1,
          });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        images.forEach((_, i) => {
          const base = styles[i] || "none";
          const zIndex = cardZIndicesRef.current[i] ?? (i + 1);
          gsap.fromTo(
            `.card-${i}`,
            { transform: `${base} scale(0)`, opacity: 1 },
            {
              transform: `${base} scale(1)`,
              zIndex,
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
      const zIndex = cardZIndicesRef.current[i] ?? (i + 1);
      gsap.set(q(`.card-${i}`), {
        transform: `${base} scale(1)`,
        zIndex,
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

  const animateCard = (
    index: number,
    transform: string,
    zIndex: number,
    pointerEvents: "auto" | "none" = "auto",
    duration = 0.35,
  ) => {
    if (!containerRef.current) return;
    const q = gsap.utils.selector(containerRef);
    const target = q(`.card-${index}`);
    gsap.killTweensOf(target);
    gsap.to(target, {
      transform,
      zIndex,
      pointerEvents,
      duration,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const applyHoverState = (hoveredIdx: number) => {
    if (!containerRef.current) return;

    const styles = transformStylesRef.current;
    activeIdxRef.current = hoveredIdx;

    topZIndexRef.current += 1;
    cardZIndicesRef.current[hoveredIdx] = topZIndexRef.current;

    images.forEach((_, i) => {
      const baseTransform = styles[i] || "none";
      const zIndex = cardZIndicesRef.current[i] ?? (i + 1);

      if (i === hoveredIdx) {
        animateCard(
          i,
          `${baseTransform} scale(1.08)`,
          topZIndexRef.current,
          "auto",
        );
      } else {
        const distance = Math.abs(hoveredIdx - i);
        const dirX = i < hoveredIdx ? -1 : 1;
        const mid = (images.length - 1) / 2;
        const dirY = i < mid ? -1 : 1;
        const offsetX = dirX * (hoverPushOffset + distance * 6);
        const offsetY = dirY * (16 + distance * 4);
        animateCard(
          i,
          getPushedTransform(baseTransform, offsetX, offsetY),
          zIndex,
          "none",
        );
      }
    });
  };

  const resetToBase = () => {
    if (!containerRef.current) return;

    const styles = transformStylesRef.current;
    activeIdxRef.current = null;

    images.forEach((_, i) => {
      const baseTransform = styles[i] || "none";
      const zIndex = cardZIndicesRef.current[i] ?? (i + 1);
      animateCard(i, `${baseTransform} scale(1)`, zIndex, "auto");
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
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        flexShrink: 0,
      }}
    >
      {images.map((src, idx) => {
        const cardColor = borderColors[idx];
        const cardStyle: React.CSSProperties = {
          transform: `${transformStyles[idx] ?? "none"} scale(0)`,
          zIndex: cardZIndicesRef.current[idx] ?? (idx + 1),
          opacity: 1,
        };
        if (cardColor) {
          cardStyle.borderColor = cardColor;
          (cardStyle as Record<string, string>)["--card-border"] = cardColor;
          (cardStyle as Record<string, string>)["--card-glow"] = cardColor
            .replace("rgb(", "rgba(")
            .replace(")", ", 0.25)");
        }

        return (
          <div
            key={`${src}-${idx}`}
            className={`card card-${idx}`}
            style={cardStyle}
            onMouseEnter={() => onCardEnter(idx)}
            onMouseLeave={() => onCardLeave(idx)}
            onClick={() => onCardTap(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                imgRefs.current[idx] = el;
              }}
              className="image"
              src={src}
              alt={captions[idx] ?? `Memory ${idx + 1}`}
              crossOrigin="anonymous"
              onLoad={(e) => handleImageLoad(e.currentTarget, idx)}
            />
            {captions[idx] ? (
              <span className="card-caption">{captions[idx]}</span>
            ) : null}
          </div>
        );
      })}
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
