"use client";

import { useEffect, useRef } from "react";

const TRAIL_IMAGES = [
  "/assets/blue1.png",
  "/assets/pink2.png",
  "/assets/yellow3.png",
  "/assets/pinkwhite4.png",
  "/assets/blue5.png",
  "/assets/yellow6.png",
  "/assets/kitty7.png",
  "/assets/blue8.png",
  "/assets/kitty9.png",
  "/assets/white10.png",
  "/assets/white11.png",
  "/assets/black12.png",
  "/assets/yellow12.png",
  "/assets/party-cat-hover.webp",
];

const TRAIL_CONFIG = {
  imageCount: 20,
  imageLifespan: 1400,
  removalDelay: 50,
  mouseThreshold: 90,
  mouseThresholdMobile: 70,
  inDuration: 650,
  outDuration: 900,
  inEasing: "cubic-bezier(.07,.5,.5,1)",
  outEasing: "cubic-bezier(.87, 0, .13, 1)",
} as const;

type TrailItem = {
  element: HTMLImageElement;
  rotation: number;
  removeTime: number;
};

export function HomeHoverTrail() {
  const trailRef = useRef<TrailItem[]>([]);

  useEffect(() => {
    const loadingScreen = document.getElementById("homePageLoadingScreen");
    const container = loadingScreen?.querySelector(".trail-container");
    if (!loadingScreen || !(container instanceof HTMLElement)) {
      return;
    }

    const images = [...TRAIL_IMAGES];
    const trail = trailRef.current;
    const removalTimeouts = new Set<number>();

    const clearRemovalTimeouts = () => {
      removalTimeouts.forEach((id) => window.clearTimeout(id));
      removalTimeouts.clear();
    };

    let animationId = 0;
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isCursorInContainer = false;
    let lastRemovalTime = 0;
    let shouldCreateImage = false;

    const isInContainer = (x: number, y: number) => {
      const rect = container.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    const hasMovedEnough = () => {
      const distance = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
      const threshold =
        window.innerWidth > 1000 ? TRAIL_CONFIG.mouseThreshold : TRAIL_CONFIG.mouseThresholdMobile;
      return distance > threshold;
    };

    const createImage = () => {
      if (images.length === 0) return;

      if (trail.length >= TRAIL_CONFIG.imageCount) {
        const oldest = trail.shift();
        oldest?.element.remove();
      }

      const img = document.createElement("img");
      img.classList.add("trail-img");

      const randomIndex = Math.floor(Math.random() * images.length);
      const rotation = (Math.random() - 0.5) * 40;
      img.src = images[randomIndex] ?? images[0]!;

      const rect = container.getBoundingClientRect();
      const relativeX = mouseX - rect.left;
      const relativeY = mouseY - rect.top;

      img.style.left = `${relativeX}px`;
      img.style.top = `${relativeY}px`;
      img.style.transform = `translate3d(-50%, -50%, 0) rotate(${rotation}deg) scale(0)`;
      img.style.transition = `transform ${TRAIL_CONFIG.inDuration}ms ${TRAIL_CONFIG.inEasing}`;

      container.appendChild(img);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          img.style.transform = `translate3d(-50%, -50%, 0) rotate(${rotation}deg) scale(1)`;
        });
      });

      trail.push({
        element: img,
        rotation,
        removeTime: Date.now() + TRAIL_CONFIG.imageLifespan,
      });
    };

    const removeOldImages = () => {
      const now = Date.now();
      if (now - lastRemovalTime < TRAIL_CONFIG.removalDelay || trail.length === 0) {
        return;
      }

      const oldestImage = trail[0];
      if (!oldestImage || now < oldestImage.removeTime) {
        return;
      }

      const imgToRemove = trail.shift();
      if (!imgToRemove) return;

      imgToRemove.element.style.transition = `transform ${TRAIL_CONFIG.outDuration}ms ${TRAIL_CONFIG.outEasing}`;
      imgToRemove.element.style.transform = `translate3d(-50%, -50%, 0) rotate(${imgToRemove.rotation}deg) scale(0)`;
      lastRemovalTime = now;

      const removalTimeoutId = window.setTimeout(() => {
        removalTimeouts.delete(removalTimeoutId);
        imgToRemove.element.remove();
      }, TRAIL_CONFIG.outDuration);
      removalTimeouts.add(removalTimeoutId);
    };

    const moveListener = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event && event.touches.length > 0) {
        mouseX = event.touches[0]?.clientX ?? 0;
        mouseY = event.touches[0]?.clientY ?? 0;
      } else if ("clientX" in event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
      }

      isCursorInContainer = isInContainer(mouseX, mouseY);
      if (isCursorInContainer && hasMovedEnough()) {
        shouldCreateImage = true;
      }
    };

    const animate = () => {
      if (shouldCreateImage) {
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        createImage();
        shouldCreateImage = false;
      }
      removeOldImages();
      animationId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", moveListener);
    document.addEventListener("touchmove", moveListener, { passive: true });
    animationId = requestAnimationFrame(animate);

    const cleanup = () => {
      observer.disconnect();
      cancelAnimationFrame(animationId);
      clearRemovalTimeouts();
      document.removeEventListener("mousemove", moveListener);
      document.removeEventListener("touchmove", moveListener);
      trail.forEach((item) => item.element.remove());
      trail.length = 0;
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          if (loadingScreen.classList.contains("hidden") || !document.getElementById("homePageLoadingScreen")) {
            cleanup();
          }
        }
      }
    });

    observer.observe(loadingScreen, { attributes: true });

    return cleanup;
  }, []);

  return null;
}
