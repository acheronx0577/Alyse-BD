"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionContextValue } from "./motion-context";
import {
  getSafeInternalUrl,
  isSamePageUrl,
  normalizePath,
} from "@/lib/motion/routes";
import { handlePageTransitionDocumentClick } from "@/lib/motion/page-transition-document-click";
import {
  shouldRunHomeIntro,
  markHomeIntroCompleted,
} from "@/lib/motion/home-intro";
import {
  lockTransitionScroll,
  unlockTransitionScroll,
} from "@/lib/motion/page-transition-scroll-lock";
import {
  animateTransition,
  revealTransition,
  resetTransitionOverlays,
  prefersReducedMotion,
} from "@/lib/motion/transition-gsap";

export function usePageTransitionProvider(): MotionContextValue {
  const router = useRouter();
  const pathname = usePathname();
  const [homeReady, setHomeReady] = useState(false);
  const [pageTransitionComplete, setPageTransitionComplete] = useState(false);

  const homeLoadingPromiseRef = useRef<Promise<void>>(Promise.resolve());
  const homeLoadingRegisteredRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const inTransitionRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setReadyState = useCallback((ready: boolean, complete: boolean) => {
    if (!mountedRef.current) return;
    setHomeReady(ready);
    setPageTransitionComplete(complete);
  }, []);

  const setTransitionComplete = useCallback((complete: boolean) => {
    if (!mountedRef.current) return;
    setPageTransitionComplete(complete);
  }, []);

  const registerHomeLoading = useCallback((promise: Promise<void> | null) => {
    if (promise) {
      homeLoadingRegisteredRef.current = true;
      homeLoadingPromiseRef.current = promise;
      return;
    }
    homeLoadingRegisteredRef.current = false;
    homeLoadingPromiseRef.current = Promise.resolve();
  }, []);

  const waitForHomeLoadingRegistration = useCallback(async (isActive: () => boolean) => {
    for (let frame = 0; frame < 60 && isActive(); frame += 1) {
      if (homeLoadingRegisteredRef.current) {
        return true;
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
    return homeLoadingRegisteredRef.current;
  }, []);

  const navigateWithTransition = useCallback(
    async (href: string) => {
      if (isNavigatingRef.current) return;

      const safeUrl = getSafeInternalUrl(href, window.location.origin);
      if (!safeUrl) return;

      if (isSamePageUrl(safeUrl, pathname)) {
        return;
      }

      isNavigatingRef.current = true;
      inTransitionRef.current = true;
      setTransitionComplete(false);
      lockTransitionScroll();

      let scrollReleased = false;
      try {
        const reduced = prefersReducedMotion();
        await animateTransition(reduced);
        router.push(safeUrl.pathname + safeUrl.search + safeUrl.hash);
        scrollReleased = true;
      } finally {
        isNavigatingRef.current = false;
        if (!scrollReleased) {
          unlockTransitionScroll();
        }
      }
    },
    [pathname, router, setTransitionComplete],
  );

  useEffect(() => {
    let active = true;
    const isRouteActive = () => active && mountedRef.current;
    const path = normalizePath(pathname);

    const handleRouteTransition = async () => {
      const reduced = prefersReducedMotion();

      // Case 1: Initial load on Home page where intro should run
      if (shouldRunHomeIntro(path)) {
        lockTransitionScroll();
        const registered = await waitForHomeLoadingRegistration(isRouteActive);
        if (registered && isRouteActive()) {
          await homeLoadingPromiseRef.current;
          markHomeIntroCompleted();
        }
        if (!isRouteActive()) return;

        await revealTransition(reduced);
        unlockTransitionScroll();
        setReadyState(true, true);
        window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
        return;
      }

      // Case 2: Client navigation via navigateWithTransition
      if (inTransitionRef.current) {
        if (!isRouteActive()) return;
        await revealTransition(reduced);
        inTransitionRef.current = false;
        unlockTransitionScroll();
        setReadyState(true, true);
        window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
        return;
      }

      // Case 3: Initial direct load of any sub-page (e.g. /about, /gallery)
      resetTransitionOverlays();
      setReadyState(true, true);
      window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
    };

    void handleRouteTransition();

    return () => {
      active = false;
    };
  }, [pathname, setReadyState, waitForHomeLoadingRegistration]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      handlePageTransitionDocumentClick(event, { pathname, navigateWithTransition });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [navigateWithTransition, pathname]);

  return {
    homeReady,
    pageTransitionComplete,
    registerHomeLoading,
    navigateWithTransition,
  };
}
