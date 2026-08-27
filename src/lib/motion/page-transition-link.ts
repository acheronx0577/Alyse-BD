const BLOCKED_HREF_PREFIXES = ["mailto:", "tel:", "javascript:"] as const;

function isBlockedTransitionHref(href: string): boolean {
  return href === "#" || BLOCKED_HREF_PREFIXES.some((prefix) => href.startsWith(prefix));
}

function isModifiedNavigationClick(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function hasExternalNavigationTarget(link: HTMLAnchorElement): boolean {
  const target = link.getAttribute("target");
  return Boolean(target && target !== "_self");
}

export function shouldIgnoreTransitionLink(
  link: HTMLAnchorElement,
  href: string | null,
  event: MouseEvent,
): boolean {
  if (!href || isBlockedTransitionHref(href)) return true;
  if (link.hasAttribute("download") || hasExternalNavigationTarget(link)) return true;
  if (event.defaultPrevented || isModifiedNavigationClick(event)) return true;
  return event.button !== 0;
}
