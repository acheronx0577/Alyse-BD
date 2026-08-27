"use client";

import { PageShell } from "../PageShell";
import BounceCards, { CardSizeVariant, useGalleryLayout } from "./BounceCards";

const GALLERY_IMAGES = [
  "/gallery/IMG_20230816_135126_135.webp",
  "/gallery/IMG_20221001_235315_816.jpg",
  "/gallery/IMG_20221001_232738_123.jpg",
  "/gallery/Screenshot_20260601_204204_ibisPaint_X.jpg",
  "/gallery/1769134481_E4FiPYyM.jpg",
  "/gallery/20221221_172619.jpg",
  "/gallery/20260621_152450.jpg",
  "/gallery/20260621_152433.jpg",
  "/gallery/Screenshot_20260601_230310_ibisPaint_X.jpg",
  "/gallery/20260621_145719.jpg",
];

const GALLERY_CAPTIONS = [
  "Subway 💚",
  "Ocean Drive 🌊",
  "Palm Beach 🌴",
  "Sketching ✏️",
  "Magic Hour ✨",
  "Golden Sun 🌅",
  "Blue Sky 🌤️",
  "Tree Top 🌿",
  "Art Mode 🎨",
  "Coast View 🌊",
];

const GALLERY_CARD_SIZES: CardSizeVariant[] = [
  "tall",      // Subway 💚 (portrait)
  "normal",    // Ocean Drive 🌊 (3:4)
  "landscape", // Palm Beach 🌴 (4:3)
  "tall",      // Sketching ✏️ (portrait sketch)
  "wide",      // Magic Hour ✨ (16:9 centerpiece rectangle)
  "wide",      // Golden Sun 🌅 (16:9 rectangle)
  "large",     // Blue Sky 🌤️ (4:3 large)
  "landscape", // Tree Top 🌿 (4:3)
  "tall",      // Art Mode 🎨 (portrait sketch)
  "large",     // Coast View 🌊 (4:3 large)
];

/* Coordinates spread out widely and gracefully across design canvas */
const DESKTOP_TRANSFORMS = [
  "rotate(-12deg) translate(-750px, -170px)",
  "rotate(6deg) translate(-250px, -185px)",
  "rotate(-5deg) translate(250px, -175px)",
  "rotate(11deg) translate(750px, -165px)",
  "rotate(4deg) translate(-480px, 20px)",    /* Magic Hour - Centerpiece */
  "rotate(-7deg) translate(480px, 20px)",    /* Golden Sun */
  "rotate(10deg) translate(0px, 15px)",
  "rotate(-8deg) translate(-620px, 210px)",
  "rotate(7deg) translate(-90px, 220px)",
  "rotate(-9deg) translate(560px, 215px)",
];

const LAPTOP_TRANSFORMS = [
  "rotate(-12deg) translate(-570px, -145px)",
  "rotate(6deg) translate(-190px, -155px)",
  "rotate(-5deg) translate(190px, -145px)",
  "rotate(11deg) translate(570px, -135px)",
  "rotate(4deg) translate(-365px, 15px)",    /* Magic Hour */
  "rotate(-7deg) translate(365px, 15px)",    /* Golden Sun */
  "rotate(10deg) translate(0px, 10px)",
  "rotate(-8deg) translate(-470px, 165px)",
  "rotate(7deg) translate(-70px, 175px)",
  "rotate(-9deg) translate(425px, 170px)",
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
    containerWidth: 1380,
    containerHeight: 550,
    transformStyles: LAPTOP_TRANSFORMS,
    hoverPushOffset: 150,
  },
  desktop: {
    className: "",
    containerWidth: 1800,
    containerHeight: 620,
    transformStyles: DESKTOP_TRANSFORMS,
    hoverPushOffset: 190,
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
            cardSizes={GALLERY_CARD_SIZES}
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
