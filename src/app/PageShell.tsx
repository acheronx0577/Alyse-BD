import { SiteNav } from "./SiteNav";

export function PageShell({
  children,
  variant = "content",
}: {
  children: React.ReactNode;
  variant?: "home" | "content";
}) {
  return (
    <main className={`page${variant === "home" ? " page-home" : ""}`}>
      <SiteNav />
      {children}
      <div
        className="party-art party-art-fallback"
        role="img"
        aria-label="Birthday celebration decorations with balloons, gifts, and hearts"
      />
    </main>
  );
}
