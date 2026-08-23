"use client";

import { useState } from "react";

const STICKERS = ["🎂", "💗", "🐱", "🎈"] as const;

type Message = {
  id: string;
  avatar: string;
  author: string;
  time: string;
  text: string;
};

const SEED_MESSAGES: Message[] = [
  {
    id: "seed-sam",
    avatar: "🎀",
    author: "Sam",
    time: "2 min ago",
    text: "Happy birthday Alyse!! Hope your day is full of cake and cat cuddles 🐱🎂",
  },
  {
    id: "seed-jordan",
    avatar: "⭐",
    author: "Jordan",
    time: "15 min ago",
    text: "You make every room brighter. Have the BEST birthday ever!! ✨",
  },
  {
    id: "seed-riley",
    avatar: "🌈",
    author: "Riley",
    time: "1 hr ago",
    text: "Party cat approves this celebration. 🎉🐾",
  },
];

export function MessagesSection() {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const [selectedSticker, setSelectedSticker] = useState(0);

  function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      {
        id: crypto.randomUUID(),
        avatar: STICKERS[selectedSticker],
        author: "You",
        time: "Just now",
        text: trimmed,
      },
      ...prev,
    ]);
    setDraft("");
  }

  return (
    <section className="content-section">
      <div className="section-intro">
        <h1>Birthday Messages 💌</h1>
        <p>Leave a note for Alyse — confetti included!</p>
      </div>

      <div className="messages-layout">
        <div className="message-feed">
          {messages.map((message) => (
            <article className="message-card" key={message.id}>
              <div className="meta">
                <span className="avatar" aria-hidden="true">
                  {message.avatar}
                </span>
                {message.author} · {message.time}
              </div>
              <p>{message.text}</p>
            </article>
          ))}
        </div>

        <div className="compose-box">
          <strong>Write a message</strong>
          <textarea
            aria-label="Message for Alyse"
            placeholder="Say something sweet to Alyse…"
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
          <button className="btn primary compact full-width" type="button" onClick={handleSend}>
            Send with love ♥
          </button>
        </div>
      </div>
    </section>
  );
}
