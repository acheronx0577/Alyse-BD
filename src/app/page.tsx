import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <header className="nav">
        <nav className="nav-group left" aria-label="Primary navigation">
          <Link href="#home">Home</Link>
          <Link href="#about">About Alyse</Link>
          <Link href="#gallery">Gallery</Link>
        </nav>

        <Link className="brand" href="#home" aria-label="Birthday home">
          <Image
            src="/assets/party-cat-logo.png"
            alt="Cute birthday cat"
            width={160}
            height={160}
            priority
          />
        </Link>

        <nav className="nav-group right" aria-label="Secondary navigation">
          <Link href="#messages">Messages</Link>
          <Link href="#surprises">Surprises</Link>
          <Link href="#contact">Contact</Link>
        </nav>
      </header>

      <section className="hero" id="home">
        <h1>
          Happy Birthday Alyse!
          <span className="heart-float">♥</span>
        </h1>

        <p className="subtitle">
          Wishing you a day that&apos;s as sweet, bright, and amazing as you
          are! You deserve all the happiness in the world!
          <span className="sparkle">✦</span>
        </p>

        <div className="actions">
          <Link className="btn primary" href="#celebrate">
            Celebrate Alyse <span aria-hidden="true">♥</span>
          </Link>

          <Link className="btn secondary" href="#gallery">
            Birthday Gallery <span aria-hidden="true">🎁</span>
          </Link>
        </div>
      </section>

      <span className="heart h1">♡</span>
      <span className="heart h2">♡</span>
      <span className="heart h3">♡</span>
      <span className="heart h4">♡</span>
      <span className="heart h5">♡</span>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="party-art"
        src="/assets/party-cats.png"
        alt="Cute birthday cats celebrating with cake, gifts, balloons, hearts and yarn"
      />
    </main>
  );
}
