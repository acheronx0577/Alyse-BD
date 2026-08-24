import { PageShell } from "../PageShell";

const ABOUT_PILLS = [
  "☀️ Sunshine energy",
  "🎂 Cake enthusiast",
  "💗 Big heart",
  "🐱 Cat lover",
];

export default function AboutPage() {
  return (
    <PageShell variant="about">
      <section className="content-section">
        <div className="about-grid">
          <div className="about-photo" aria-hidden="true">
            🌸
          </div>
          <div className="about-copy">
            <h1>Meet Alyse ✨</h1>
            <p>
              She lights up every room with kindness, laughter, and the kind of
              warmth that makes ordinary days feel special.
            </p>
            <p>
              Today we&apos;re celebrating <em>her</em> — the friend who
              remembers birthdays, sends the best memes, and always has room for
              one more cupcake.
            </p>
            <div className="pill-list">
              {ABOUT_PILLS.map((pill) => (
                <span className="pill" key={pill}>
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
