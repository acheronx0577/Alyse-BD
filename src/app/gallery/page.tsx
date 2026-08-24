"use client";

import { PageShell } from "../PageShell";
import BounceCards, { useGalleryLayout } from "./BounceCards";

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

/* Positions kept inside design canvas (1900×920) with rotation margin */
const DESKTOP_TRANSFORMS = [
  "rotate(-14deg) translate(-600px, -210px)",
  "rotate(10deg) translate(-300px, -228px)",
  "rotate(-6deg) translate(0px, -200px)",
  "rotate(12deg) translate(300px, -222px)",
  "rotate(-10deg) translate(600px, -205px)",
  "rotate(8deg) translate(-595px, 0px)",
  "rotate(-15deg) translate(-298px, 12px)",
  "rotate(4deg) translate(0px, -8px)",
  "rotate(-9deg) translate(298px, 10px)",
  "rotate(13deg) translate(595px, -4px)",
  "rotate(-11deg) translate(-600px, 210px)",
  "rotate(7deg) translate(-300px, 225px)",
  "rotate(-5deg) translate(0px, 200px)",
  "rotate(14deg) translate(300px, 218px)",
  "rotate(-8deg) translate(598px, 208px)",
];

const LAPTOP_TRANSFORMS = [
  "rotate(-14deg) translate(-450px, -175px)",
  "rotate(10deg) translate(-225px, -190px)",
  "rotate(-6deg) translate(0px, -168px)",
  "rotate(12deg) translate(225px, -185px)",
  "rotate(-10deg) translate(450px, -170px)",
  "rotate(8deg) translate(-448px, 0px)",
  "rotate(-15deg) translate(-222px, 10px)",
  "rotate(4deg) translate(0px, -6px)",
  "rotate(-9deg) translate(222px, 8px)",
  "rotate(13deg) translate(448px, -3px)",
  "rotate(-11deg) translate(-450px, 175px)",
  "rotate(7deg) translate(-225px, 188px)",
  "rotate(-5deg) translate(0px, 168px)",
  "rotate(14deg) translate(225px, 182px)",
  "rotate(-8deg) translate(448px, 172px)",
];

const MOBILE_TRANSFORMS = [
  "rotate(-12deg) translate(-102px, -168px)",
  "rotate(8deg) translate(0px, -178px)",
  "rotate(-6deg) translate(102px, -165px)",
  "rotate(10deg) translate(-102px, -82px)",
  "rotate(-12deg) translate(0px, -78px)",
  "rotate(7deg) translate(102px, -85px)",
  "rotate(-9deg) translate(-102px, 0px)",
  "rotate(5deg) translate(0px, 4px)",
  "rotate(-10deg) translate(102px, 0px)",
  "rotate(11deg) translate(-102px, 82px)",
  "rotate(-7deg) translate(0px, 86px)",
  "rotate(9deg) translate(102px, 80px)",
  "rotate(-13deg) translate(-102px, 165px)",
  "rotate(6deg) translate(0px, 170px)",
  "rotate(-8deg) translate(102px, 163px)",
];

const LAYOUT_CONFIG = {
  mobile: {
    className: " is-mobile",
    containerWidth: 360,
    containerHeight: 560,
    transformStyles: MOBILE_TRANSFORMS,
    hoverPushOffset: 55,
  },
  laptop: {
    className: " is-laptop",
    containerWidth: 1320,
    containerHeight: 720,
    transformStyles: LAPTOP_TRANSFORMS,
    hoverPushOffset: 120,
  },
  desktop: {
    className: "",
    containerWidth: 1900,
    containerHeight: 920,
    transformStyles: DESKTOP_TRANSFORMS,
    hoverPushOffset: 160,
  },
} as const;

export default function GalleryPage() {
  const layout = useGalleryLayout();
  const config = LAYOUT_CONFIG[layout];

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
            className={`gallery-bounceCards${config.className}`}
            images={GALLERY_IMAGES}
            captions={GALLERY_CAPTIONS}
            containerWidth={config.containerWidth}
            containerHeight={config.containerHeight}
            animationDelay={0.15}
            animationStagger={0.04}
            easeType="power2.out"
            transformStyles={config.transformStyles}
            enableHover
            hoverPushOffset={config.hoverPushOffset}
          />
        </div>
      </section>
    </PageShell>
  );
}
