"use client";

import { FormEvent, useState } from "react";
import { submitContact } from "./actions/contact";

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setSubmitting(true);

    const form = event.currentTarget;

    try {
      const result = await submitContact(new FormData(form));
      if (result.ok) {
        setSent(true);
        form.reset();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="content-section">
      <div className="section-intro">
        <h1>Contact 💬</h1>
        <p>Questions about the party? Party cat is listening.</p>
      </div>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Your name</label>
          <input id="contact-name" name="name" type="text" placeholder="Friend of Alyse" required />

          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            placeholder="Party details, gift ideas, or just hi!"
            required
          />

          <button className="btn primary compact" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send message 🎀"}
          </button>

          {error && (
            <p className="contact-error" role="alert">
              {error}
            </p>
          )}

          {sent && (
            <p className="contact-success" role="status">
              Message sent with love! Party cat will reply soon ♥
            </p>
          )}
        </form>

        <aside className="contact-side">
          <div className="big-cat" aria-hidden="true">
            🐱🎉
          </div>
          <strong>Party Cat HQ</strong>
          <p>Replies within 24 hrs · Always cute · Never grumpy</p>
        </aside>
      </div>
    </section>
  );
}
