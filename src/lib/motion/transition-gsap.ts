import gsap from "gsap";

const OVERLAY_SELECTOR = ".transition-overlay";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function primeTransitionOverlays(): void {
  if (typeof document === "undefined") return;
  gsap.set(OVERLAY_SELECTOR, { scaleY: 1, transformOrigin: "top" });
}

export function resetTransitionOverlays(): void {
  if (typeof document === "undefined") return;
  gsap.set(OVERLAY_SELECTOR, { scaleY: 0, transformOrigin: "bottom" });
}

export function revealTransition(reducedMotion = false): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  if (reducedMotion) {
    gsap.set(OVERLAY_SELECTOR, { scaleY: 0, transformOrigin: "bottom" });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    gsap.set(OVERLAY_SELECTOR, { scaleY: 1, transformOrigin: "top" });
    gsap.to(OVERLAY_SELECTOR, {
      scaleY: 0,
      duration: 0.45,
      stagger: {
        each: 0.05,
        from: "end",
      },
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(OVERLAY_SELECTOR, { scaleY: 0 });
        resolve();
      },
    });
  });
}

export function animateTransition(reducedMotion = false): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  if (reducedMotion) {
    gsap.set(OVERLAY_SELECTOR, { scaleY: 1, transformOrigin: "top" });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    gsap.set(OVERLAY_SELECTOR, { scaleY: 0, transformOrigin: "bottom" });
    gsap.to(OVERLAY_SELECTOR, {
      scaleY: 1,
      duration: 0.45,
      stagger: {
        each: 0.05,
        from: "start",
      },
      ease: "power2.inOut",
      onComplete: resolve,
    });
  });
}
