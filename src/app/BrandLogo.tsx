import Link from "next/link";

export function BrandLogo() {
  return (
    <Link className="brand" href="/" aria-label="Birthday home">
      <span className="brand-logo">
        <img
          className="brand-logo-default"
          src="/assets/party-cat-logo.webp"
          alt="Cute birthday cat with party hat"
          width={160}
          height={107}
        />
        <img
          className="brand-logo-hover"
          src="/assets/party-cat-hover.webp"
          alt=""
          aria-hidden="true"
          width={160}
          height={107}
        />
      </span>
    </Link>
  );
}
