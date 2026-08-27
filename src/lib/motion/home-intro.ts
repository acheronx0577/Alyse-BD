import { normalizePath } from "./routes";

let introCompleted = false;

export function shouldRunHomeIntro(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  if (normalizePath(pathname) !== "/") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return !introCompleted;
}

export function markHomeIntroCompleted(): void {
  introCompleted = true;
}
