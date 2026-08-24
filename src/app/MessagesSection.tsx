"use client";

import { useAction, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { TurnstileField, type TurnstileFieldHandle } from "./TurnstileField";

const STICKERS = ["🎂", "💗", "🐱", "🎈"] as const;

function relativeTime(timestamp: number) {
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export function MessagesSection() {
  const messages = useQuery(api.messages.list);
  const submitMessage = useAction(api.messages.submit);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);

  const [author, setAuthor] = useState("");
  const [draft, setDraft] = useState("");
  const [selectedSticker, setSelectedSticker] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    try {
      await submitMessage({
        author,
        text: trimmed,
        sticker: STICKERS[selectedSticker],
        turnstileToken: turnstileRef.current?.getToken(),
      });
      setDraft("");
      turnstileRef.current?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that message. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="content-section messages-section">
      <div className="section-intro">
        <h1>Birthday Messages 💌</h1>
        <p>Leave a note for Alyse — confetti included!</p>
      </div>

      <div className="messages-layout">
        <div className="message-feed">
          {messages === undefined && <p>Loading messages…</p>}

          {messages?.length === 0 && <p>No messages yet — be the first to write one!</p>}

          {messages?.map((message) => (
            <article className="message-card" key={message.id}>
              <div className="meta">
                <span className="avatar" aria-hidden="true">
                  {message.sticker}
                </span>
                {message.author} · {relativeTime(message.createdAt)}
              </div>
              <p>{message.text}</p>
            </article>
          ))}
        </div>

        <div className="compose-box">
          <strong>Write a message</strong>
          <input
            aria-label="Your name"
            placeholder="Your name"
            maxLength={40}
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
          <textarea
            aria-label="Message for Alyse"
            placeholder="Say something sweet to Alyse…"
            maxLength={500}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="sticker-row" role="group" aria-label="Pick a sticker">
            {STICKERS.map((sticker, index) => (
              <button
                key={sticker}
                type="button"
                className={`sticker${selectedSticker === index ? " selected" : ""}`}
                aria-label={`Sticker ${sticker}`}
                aria-pressed={selectedSticker === index}
                onClick={() => setSelectedSticker(index)}
              >
                {sticker}
              </button>
            ))}
          </div>
          <TurnstileField ref={turnstileRef} />
          <button
            className="btn primary compact full-width"
            type="button"
            onClick={handleSend}
            disabled={sending || !draft.trim()}
          >
            {sending ? "Sending…" : "Send with love ♥"}
          </button>

          {error && (
            <p className="contact-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
