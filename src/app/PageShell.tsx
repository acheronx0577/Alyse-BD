import { SiteNav } from "./SiteNav";
import { SiteCurtain } from "./SiteCurtain";

export function PageShell({
  children,
  variant = "content",
}: {
  children: React.ReactNode;
  variant?: "home" | "content" | "gallery" | "messages" | "surprises";
}) {
  return (
    <main
      className={`page${variant === "home" ? " page-home" : ""}${variant === "gallery" ? " page-fit page-gallery" : ""}${variant === "messages" ? " page-fit page-messages" : ""}${variant === "surprises" ? " page-fit page-surprises" : ""}`}
    >
      <SiteNav />
      {(variant === "messages" || variant === "surprises") && <SiteCurtain />}
      <div className="page-main">{children}</div>
      <div
        className="party-art party-art-fallback"
        role="img"
        aria-label="Birthday celebration decorations with balloons, gifts, and hearts"
      />
    </main>
  );
}
