import {
  getSafeInternalUrl,
  isSamePageUrl,
} from "./routes";
import {
  shouldIgnoreTransitionLink,
} from "./page-transition-link";

export type PageTransitionClickHandler = {
  pathname: string;
  navigateWithTransition: (href: string) => void;
};

function resolveTransitionTarget(
  link: HTMLAnchorElement,
  href: string | null,
  origin: string,
) {
  if (href?.startsWith("#")) {
    return { kind: "hash" as const };
  }

  const safeUrl = getSafeInternalUrl(href ?? "", origin);
  if (!safeUrl) {
    return { kind: "ignore" as const };
  }

  return { kind: "navigate" as const, safeUrl };
}

export function handlePageTransitionDocumentClick(
  event: MouseEvent,
  handler: PageTransitionClickHandler,
): void {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("a");
  if (!(link instanceof HTMLAnchorElement)) return;

  const href = link.getAttribute("href");
  if (shouldIgnoreTransitionLink(link, href, event)) return;

  const resolved = resolveTransitionTarget(link, href, window.location.origin);
  if (resolved.kind === "ignore" || resolved.kind === "hash") return;

  event.preventDefault();

  if (isSamePageUrl(resolved.safeUrl, handler.pathname)) {
    return;
  }

  void handler.navigateWithTransition(
    resolved.safeUrl.pathname + resolved.safeUrl.search + resolved.safeUrl.hash,
  );
}
