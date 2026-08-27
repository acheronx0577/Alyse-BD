import Image from "next/image";
import Link from "next/link";
import { PageShell } from "./PageShell";

export default function Home() {
  return (
    <PageShell variant="home">
      <section className="hero">
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
          <Link className="btn primary" href="/surprises">
            Celebrate Alyse <span aria-hidden="true">♥</span>
          </Link>

          <Link className="btn secondary" href="/gallery">
            Birthday Gallery <span aria-hidden="true">🎁</span>
          </Link>
        </div>

        <span className="heart h1">♡</span>
        <span className="heart h2">♡</span>
        <span className="heart h3">♡</span>
        <span className="heart h4">♡</span>
        <span className="heart h5">♡</span>
      </section>

      <div
        className="birthday-bottom-img"
        style={{
          width: "80%",
          marginTop: "auto",
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: "0",
          position: "relative" as const,
          zIndex: 1,
        }}
      >
        <Image
          src="/birthday-bottom.png"
          alt="Cute Sanrio birthday characters celebrating"
          width={1792}
          height={560}
          style={{ width: "100%", height: "auto" }}
          priority
        />
      </div>
    </PageShell>
  );
}
