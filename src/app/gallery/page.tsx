"use client";

import { PageShell } from "../PageShell";
import BounceCards from "./BounceCards";

const GALLERY_IMAGES = [
  "/gallery/party-cat.webp",
  "/gallery/spotlight-1.jpg",
  "/gallery/spotlight-2.jpg",
  "/gallery/spotlight-3.jpg",
  "/gallery/spotlight-4.jpg",
  "/gallery/spotlight-5.jpg",
  "/gallery/spotlight-6.jpg",
  "/gallery/spotlight-7.jpg",
  "/gallery/spotlight-8.jpg",
  "/gallery/spotlight-9.jpg",
  "/gallery/spotlight-10.jpg",
  "/gallery/spotlight-11.jpg",
  "/gallery/spotlight-12.jpg",
  "/gallery/spotlight-13.jpg",
  "/gallery/spotlight-14.jpg",
];

const GALLERY_CAPTIONS = [
  "Party cat HQ",
  "Glow hour",
  "Balloon day",
  "Birthday Cake!",
  "Cupcake crown",
  "Friends & Fun!",
  "Spring vibes",
  "Sparkle squad",
  "Love notes",
  "Confetti run",
  "Soft cuddles",
  "Pink parade",
  "Wish night",
  "Berry sweet",
  "Tiny cheers",
];

/* 3×5 with random tilts + wider gaps so cards don't stack */
const TRANSFORM_STYLES = [
  "rotate(-16deg) translate(-780px, -270px)",
  "rotate(11deg) translate(-390px, -300px)",
  "rotate(-7deg) translate(10px, -255px)",
  "rotate(14deg) translate(400px, -285px)",
  "rotate(-12deg) translate(780px, -260px)",
  "rotate(9deg) translate(-760px, 5px)",
  "rotate(-18deg) translate(-380px, 30px)",
  "rotate(5deg) translate(15px, -20px)",
  "rotate(-11deg) translate(395px, 25px)",
  "rotate(15deg) translate(770px, -10px)",
  "rotate(-13deg) translate(-785px, 275px)",
  "rotate(8deg) translate(-385px, 295px)",
  "rotate(-6deg) translate(5px, 265px)",
  "rotate(17deg) translate(390px, 290px)",
  "rotate(-10deg) translate(775px, 270px)",
];

export default function GalleryPage() {
  return (
    <PageShell variant="gallery">
      <section className="content-section gallery-page">
        <div className="section-intro">
          <h1>Birthday Gallery 🎁</h1>
          <p>Memories, smiles, and a very important party cat.</p>
        </div>

        <div className="gallery-bounce-wrap">
          <span className="gallery-sticker gallery-sticker-star" aria-hidden="true">
            ✦
          </span>
          <span className="gallery-sticker gallery-sticker-heart" aria-hidden="true">
            ♡
          </span>
          <span className="gallery-note gallery-note-left" aria-hidden="true">
            Birthday Cake!
          </span>
          <span className="gallery-note gallery-note-right" aria-hidden="true">
            Friends & Fun!
          </span>

          <BounceCards
            className="gallery-bounceCards"
            images={GALLERY_IMAGES}
            captions={GALLERY_CAPTIONS}
            containerWidth={1900}
            containerHeight={920}
            animationDelay={0.15}
            animationStagger={0.04}
            easeType="power2.out"
            transformStyles={TRANSFORM_STYLES}
            enableHover
            hoverPushOffset={220}
          />
        </div>
      </section>
    </PageShell>
  );
}
