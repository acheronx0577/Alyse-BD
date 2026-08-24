"use client";

import { useEffect, useRef, useState } from "react";

const SURPRISES = [
  { icon: "🎂", label: "Birthday wish", message: "You are the best friend anyone could ask for!" },
  { icon: "💗", label: "Secret hug", message: "Sending you the biggest birthday hug!" },
  { icon: "🐱", label: "Cat fact", message: "Party cat says you deserve extra treats today!" },
  { icon: "🎈", label: "Balloon pop", message: "Pop! Another reason you're amazing!" },
  { icon: "🧁", label: "Cupcake code", message: "Redeem: one unlimited cupcake pass." },
  { icon: "✨", label: "Sparkle note", message: "The world is brighter because you're in it." },
  { icon: "🌷", label: "Flower wish", message: "May your year bloom with joy and laughter." },
  { icon: "🎁", label: "Bonus gift", message: "Surprise! You're loved more than you know." },
];

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export function SurprisesSection() {
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set([0]));
  const [activeSurprise, setActiveSurprise] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  function reveal(index: number, opener: HTMLButtonElement) {
    openerRef.current = opener;
    setRevealed((prev) => new Set(prev).add(index));
    setActiveSurprise(index);
  }

  function closeModal() {
    const opener = openerRef.current;
    setActiveSurprise(null);
    openerRef.current = null;
    requestAnimationFrame(() => opener?.focus());
  }

  useEffect(() => {
    if (activeSurprise === null) return;

    const modal = modalRef.current;
    if (!modal) return;

    const modalEl = modal;
    const focusable = getFocusableElements(modalEl);
    focusable[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !modalEl.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !modalEl.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeSurprise]);

  const active = activeSurprise !== null ? SURPRISES[activeSurprise] : null;

  return (
    <section className="content-section surprises-section">
      <div className="section-intro">
        <h1>Surprises for Alyse 🎁</h1>
        <p>Tap a gift to reveal something special!</p>
      </div>

      <div className="surprise-grid">
        {SURPRISES.map((surprise, index) => {
          const isRevealed = revealed.has(index);

          return (
            <button
              key={surprise.label}
              type="button"
              className={`surprise-tile${isRevealed ? " revealed" : ""}`}
              onClick={(event) => reveal(index, event.currentTarget)}
            >
              <span className="icon" aria-hidden="true">
                {isRevealed ? surprise.icon : "🎁"}
              </span>
              <span className="label">{isRevealed ? surprise.label : "Tap me!"}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="surprise-modal-backdrop" onClick={closeModal} role="presentation">
          <div
            ref={modalRef}
            className="surprise-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="surprise-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="confetti-dot gold" aria-hidden="true" />
            <span className="confetti-dot sky" aria-hidden="true" />
            <span className="confetti-dot mint" aria-hidden="true" />
            <div className="surprise-modal-icon" aria-hidden="true">
              🎉
            </div>
            <strong id="surprise-modal-title">Surprise unlocked!</strong>
            <p>&ldquo;{active.message}&rdquo;</p>
            <button className="btn primary compact" type="button" onClick={closeModal}>
              Aww, thanks! ♥
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
