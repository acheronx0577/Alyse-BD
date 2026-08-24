import { SiteNav } from "./SiteNav";
import { SiteCurtain } from "./SiteCurtain";

export function PageShell({
  children,
  variant = "content",
}: {
  children: React.ReactNode;
  variant?: "home" | "content" | "gallery" | "messages" | "surprises" | "contact" | "about";
}) {
  return (
    <main
      className={`page${variant === "home" ? " page-fit page-home" : ""}${variant === "gallery" ? " page-fit page-gallery" : ""}${variant === "messages" ? " page-fit page-messages" : ""}${variant === "surprises" ? " page-fit page-surprises" : ""}${variant === "contact" ? " page-fit page-contact" : ""}${variant === "about" ? " page-fit page-about" : ""}`}
    >
      <SiteNav />
      <SiteCurtain />
      <div className="page-main">{children}</div>
      <div
        className="party-art party-art-fallback"
        role="img"
        aria-label="Birthday celebration decorations with balloons, gifts, and hearts"
      />
    </main>
  );
}
