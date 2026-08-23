export function BrandLogo() {
  return (
    <a className="brand" href="#home" aria-label="Birthday home">
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
    </a>
  );
}
