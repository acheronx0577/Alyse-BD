import Image from "next/image";
import { PageShell } from "../PageShell";

const GALLERY_ITEMS = [
  { emoji: null, caption: "Party cat HQ — featured!", featured: true },
  { emoji: "🎈", caption: "Balloon day" },
  { emoji: "🧁", caption: "Cupcake crown" },
  { emoji: "🌷", caption: "Spring vibes" },
  { emoji: "✨", caption: "Sparkle squad" },
];

export default function GalleryPage() {
  return (
    <PageShell variant="gallery">
      <section className="content-section gallery-page">
        <div className="section-intro">
          <h1>Birthday Gallery 🎁</h1>
          <p>Memories, smiles, and a very important party cat.</p>
        </div>

        <div className="gallery-grid">
          {GALLERY_ITEMS.map((item) => (
            <article
              className={`gallery-card${item.featured ? " featured" : ""}`}
              key={item.caption}
            >
              <div className={`gallery-thumb${item.featured ? " featured-thumb" : ""}`}>
                {item.featured ? (
                  <Image
                    src="/assets/party-cat-logo.webp"
                    alt="Cute birthday cat with party hat"
                    width={160}
                    height={107}
                  />
                ) : (
                  <span aria-hidden="true">{item.emoji}</span>
                )}
              </div>
              <div className="gallery-caption">{item.caption}</div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
