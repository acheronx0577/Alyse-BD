"use client";

import { createContext, useContext } from "react";

export type MotionContextValue = {
  homeReady: boolean;
  pageTransitionComplete: boolean;
  registerHomeLoading: (promise: Promise<void> | null) => void;
  navigateWithTransition: (href: string) => Promise<void>;
};

const defaultMotionContext: MotionContextValue = {
  homeReady: false,
  pageTransitionComplete: false,
  registerHomeLoading: () => {},
  navigateWithTransition: async () => {},
};

export const MotionContext = createContext<MotionContextValue>(defaultMotionContext);

export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}
