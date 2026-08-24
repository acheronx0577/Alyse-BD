"use client";

import { useAction } from "convex/react";
import { FormEvent, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { TurnstileField, type TurnstileFieldHandle } from "./TurnstileField";

export function ContactSection() {
  const submitContact = useAction(api.contact.submit);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await submitContact({
        name: formData.get("name")?.toString() ?? "",
        email: formData.get("email")?.toString() ?? "",
        message: formData.get("message")?.toString() ?? "",
        turnstileToken: turnstileRef.current?.getToken(),
      });

      if (result.ok) {
        setSent(true);
        form.reset();
        turnstileRef.current?.reset();
      } else {
        setError(result.error);
        turnstileRef.current?.reset();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
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
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Friend of Alyse"
            maxLength={80}
            required
          />

          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            maxLength={254}
            required
          />

          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            placeholder="Party details, gift ideas, or just hi!"
            maxLength={2000}
            required
          />

          <TurnstileField ref={turnstileRef} />

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
