import { SiteNav } from "./SiteNav";

export function PageShell({
  children,
  variant = "content",
}: {
  children: React.ReactNode;
  variant?: "home" | "content" | "gallery";
}) {
  return (
    <main
      className={`page${variant === "home" ? " page-home" : ""}${variant === "gallery" ? " page-fit" : ""}`}
    >
      <SiteNav />
      <div className="page-main">{children}</div>
      <div
        className="party-art party-art-fallback"
        role="img"
        aria-label="Birthday celebration decorations with balloons, gifts, and hearts"
      />
    </main>
  );
}
