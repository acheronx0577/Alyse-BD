"use client";

import type { ReactNode } from "react";
import { MotionContext } from "./motion-context";
import { TransitionOverlay } from "./TransitionOverlay";
import { usePageTransitionProvider } from "./usePageTransitionProvider";

type PageTransitionProviderProps = {
  children: ReactNode;
};

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const contextValue = usePageTransitionProvider();

  return (
    <MotionContext.Provider value={contextValue}>
      <TransitionOverlay />
      {children}
    </MotionContext.Provider>
  );
}
