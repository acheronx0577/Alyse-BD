let lockCount = 0;
let previousOverflow = "";

export function lockTransitionScroll(): void {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
  lockCount += 1;
}

export function unlockTransitionScroll(): void {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
    document.documentElement.style.overflow = "";
  }
}
