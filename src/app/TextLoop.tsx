"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import "./TextLoop.css";

const VIEW_W = 1200;
const VIEW_H = 520;
const LINE_VIEW_H = 64;
const WAVE_VIEW_H = 160;
const CX = VIEW_W / 2;
const EDGE_PAD = 6;

function getViewBox(shape: TextLoopShape) {
  if (shape === "line") {
    return { w: VIEW_W, h: LINE_VIEW_H, cy: LINE_VIEW_H / 2 };
  }
  if (shape === "wave") {
    return { w: VIEW_W, h: WAVE_VIEW_H, cy: WAVE_VIEW_H / 2 };
  }
  return { w: VIEW_W, h: VIEW_H, cy: VIEW_H / 2 };
}

type TextLoopShape = "wave" | "circle" | "infinity" | "arch" | "line";

type TextLoopProps = {
  text?: string;
  shape?: TextLoopShape;
  path?: string;
  speed?: number;
  direction?: "forward" | "reverse";
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  fit?: "meet" | "slice" | "none";
  className?: string;
  style?: React.CSSProperties;
};

const buildPath = (
  shape: TextLoopShape,
  curviness: number,
  ribbonWidth: number,
  cy: number,
) => {
  const c = Math.max(0, curviness);
  const room = Math.max(20, cy - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case "circle": {
      const r = Math.min(90 + c * 0.95, room);
      return `M ${CX - r} ${cy} A ${r} ${r} 0 1 1 ${CX + r} ${cy} A ${r} ${r} 0 1 1 ${CX - r} ${cy} Z`;
    }
    case "infinity": {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${CX} ${cy}`,
        `C ${CX + r * 0.55} ${cy - h} ${CX + r} ${cy - h} ${CX + r} ${cy}`,
        `C ${CX + r} ${cy + h} ${CX + r * 0.55} ${cy + h} ${CX} ${cy}`,
        `C ${CX - r * 0.55} ${cy - h} ${CX - r} ${cy - h} ${CX - r} ${cy}`,
        `C ${CX - r} ${cy + h} ${CX - r * 0.55} ${cy + h} ${CX} ${cy}`,
        "Z",
      ].join(" ");
    }
    case "arch":
      return `M 120 ${cy + Math.min(120 + c * 1.1, room * 2) / 2} Q ${CX} ${cy - Math.min(120 + c * 1.1, room * 2) * 1.5} ${VIEW_W - 120} ${cy + Math.min(120 + c * 1.1, room * 2) / 2}`;
    case "line":
      return `M -320 ${cy} L ${VIEW_W + 320} ${cy}`;
    case "wave":
    default: {
      const a = Math.min(c * 2.2, room * 2);
      return `M -320 ${cy} Q -160 ${cy - a} 0 ${cy} T 320 ${cy} T 640 ${cy} T 960 ${cy} T 1280 ${cy} T ${VIEW_W + 320} ${cy}`;
    }
  }
};

export default function TextLoop({
  text = "React ✦ Bits",
  shape = "wave",
  path,
  speed = 90,
  direction = "forward",
  separator = "✦",
  curviness = 90,
  fontSize = 46,
  fontWeight = 800,
  letterSpacing = 2,
  uppercase = true,
  color = "#ffffff",
  ribbon = true,
  ribbonColor = "#5227FF",
  ribbonWidth = 86,
  pauseOnHover = true,
  fit,
  className = "",
  style = {},
}: TextLoopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const headRef = useRef<SVGTextPathElement>(null);
  const tailRef = useRef<SVGTextPathElement>(null);

  const [metrics, setMetrics] = useState({ length: 0, reps: 1 });

  const rawId = useId();
  const pathId = `text-loop-${rawId.replace(/:/g, "")}`;

  const viewBox = useMemo(() => getViewBox(shape), [shape]);

  const d = useMemo(
    () => path || buildPath(shape, curviness, ribbonWidth, viewBox.cy),
    [path, shape, curviness, ribbonWidth, viewBox.cy],
  );

  const unit = useMemo(() => {
    const base = uppercase ? String(text).toUpperCase() : String(text);
    const gap = separator ? `\u00A0${separator}\u00A0` : "\u00A0\u00A0\u00A0";
    return `${base}${gap}`;
  }, [text, separator, uppercase]);

  const textStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
    }),
    [fontSize, fontWeight, letterSpacing],
  );

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    if (!pathEl || !measureEl) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      let length = 0;
      let unitWidth = 0;
      try {
        length = pathEl.getTotalLength();
        unitWidth = measureEl.getComputedTextLength();
      } catch {
        return;
      }
      if (!length) return;

      const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
      setMetrics((prev) =>
        prev.length === length && prev.reps === reps ? prev : { length, reps },
      );
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [d, unit, fontSize, fontWeight, letterSpacing]);

  useEffect(() => {
    const { length } = metrics;
    const head = headRef.current;
    const tail = tailRef.current;
    if (!head || !tail || !length) return undefined;

    const apply = (offset: number) => {
      const partner = offset >= 0 ? offset - length : offset + length;
      head.setAttribute("startOffset", String(offset));
      tail.setAttribute("startOffset", String(partner));
    };

    apply(0);

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || speed <= 0) return undefined;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === "reverse" ? -length : length,
      duration: length / speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => apply(state.offset),
    });

    const root = rootRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover && root) {
      root.addEventListener("pointerenter", pause);
      root.addEventListener("pointerleave", resume);
      root.addEventListener("focus", pause);
      root.addEventListener("blur", resume);
    }

    return () => {
      tween.kill();
      if (pauseOnHover && root) {
        root.removeEventListener("pointerenter", pause);
        root.removeEventListener("pointerleave", resume);
        root.removeEventListener("focus", pause);
        root.removeEventListener("blur", resume);
      }
    };
  }, [metrics, speed, direction, pauseOnHover]);

  const loopText = unit.repeat(metrics.reps);
  const fitLength = metrics.length || undefined;

  const preserveAspectRatio =
    fit === "slice"
      ? "xMidYMid slice"
      : fit === "none" || shape === "line"
        ? "none"
        : "xMidYMid meet";

  return (
    <div
      ref={rootRef}
      className={`text-loop ${className}`.trim()}
      style={style}
      tabIndex={pauseOnHover ? 0 : undefined}
      aria-label={pauseOnHover ? `${text}. Focus to pause animation.` : undefined}
    >
      <svg
        className="text-loop-svg"
        viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio={preserveAspectRatio}
        role="img"
        aria-label={pauseOnHover ? undefined : text}
        aria-hidden={pauseOnHover ? true : undefined}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          stroke={ribbon ? ribbonColor : "none"}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text ref={measureRef} className="text-loop-measure" style={textStyle} aria-hidden="true">
          {unit}
        </text>

        <text
          className="text-loop-text"
          style={textStyle}
          fill={color}
          dominantBaseline="central"
          aria-hidden="true"
        >
          <textPath
            ref={headRef}
            href={`#${pathId}`}
            startOffset={0}
            textLength={fitLength}
            lengthAdjust="spacing"
          >
            {loopText}
          </textPath>
        </text>

        <text
          className="text-loop-text"
          style={textStyle}
          fill={color}
          dominantBaseline="central"
          aria-hidden="true"
        >
          <textPath
            ref={tailRef}
            href={`#${pathId}`}
            startOffset={0}
            textLength={fitLength}
            lengthAdjust="spacing"
          >
            {loopText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
