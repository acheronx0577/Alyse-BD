const ALLOWED_MOTION_PATHS = new Set([
  "/",
  "/about",
  "/gallery",
  "/messages",
  "/surprises",
  "/contact",
]);

export function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  if (pathname === "/index.html") return "/";
  if (pathname.endsWith(".html")) {
    const stripped = pathname.slice(0, -5);
    return stripped === "/index" ? "/" : stripped;
  }
  return pathname;
}

export function isAllowedInternalPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return ALLOWED_MOTION_PATHS.has(normalized);
}
