"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";

const LEFT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Alyse" },
  { href: "/gallery", label: "Gallery" },
] as const;

const RIGHT_LINKS = [
  { href: "/messages", label: "Messages" },
  { href: "/surprises", label: "Surprises" },
  { href: "/contact", label: "Contact" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

type NavLink = { readonly href: string; readonly label: string };

function NavLinks({
  links,
  pathname,
  className,
  ariaLabel,
}: {
  links: readonly NavLink[];
  pathname: string;
  className: string;
  ariaLabel: string;
}) {
  return (
    <nav className={className} aria-label={ariaLabel}>
      {links.map(({ href, label }) => {
        const active = isActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="nav">
      <NavLinks
        links={LEFT_LINKS}
        pathname={pathname}
        className="nav-group left"
        ariaLabel="Primary navigation"
      />
      <BrandLogo />
      <NavLinks
        links={RIGHT_LINKS}
        pathname={pathname}
        className="nav-group right"
        ariaLabel="Secondary navigation"
      />
    </header>
  );
}
