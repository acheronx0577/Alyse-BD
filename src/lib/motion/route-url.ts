import {
  isAllowedInternalPath,
  normalizePath,
} from "./route-path-helpers";

export function getSafeInternalUrl(href: string, origin: string): URL | null {
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }

  if (url.origin !== origin) return null;
  if (!isAllowedInternalPath(url.pathname)) return null;

  return url;
}

export function isSamePageUrl(target: URL, currentPathname: string): boolean {
  return normalizePath(currentPathname) === normalizePath(target.pathname);
}
