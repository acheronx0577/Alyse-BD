import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { verifyTurnstileToken } from "./botVerification";
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const record = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactMessages", {
      ...args,
      createdAt: Date.now(),
      notified: false,
    });
  },
});

export const markNotified = internalMutation({
  args: { id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { notified: true });
  },
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendNotification(input: { name: string; email: string; message: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Party Cat HQ <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn("Resend is not configured; contact message stored without notification.");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `New birthday site message from ${input.name}`,
      html: `
        <h2>New message from the birthday site</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${detail}`);
  }

  return true;
}

export const submit = action({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: true } | { ok: false; error: string }> => {
    const name = args.name.trim();
    const email = args.email.trim();
    const message = args.message.trim();

    if (!name || !email || !message) {
      return { ok: false, error: "Please fill in all fields." };
    }
    if (
      name.length > MAX_NAME_LENGTH ||
      email.length > MAX_EMAIL_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return { ok: false, error: "That's a bit too long — please shorten it." };
    }
    if (!EMAIL_PATTERN.test(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    const rateCheck = await ctx.runMutation(internal.rateLimit.checkAndRecord, {
      scope: "contact",
      key: email.toLowerCase(),
    });
    if (!rateCheck.allowed) {
      return { ok: false, error: "Too many messages. Please try again later." };
    }

    const botCheck = await verifyTurnstileToken(args.turnstileToken ?? "");
    if (!botCheck.ok) {
      return { ok: false, error: botCheck.error };
    }

    const id: Id<"contactMessages"> = await ctx.runMutation(internal.contact.record, {
      name,
      email,
      message,
    });

    try {
      const notified = await sendNotification({ name, email, message });
      if (notified) {
        await ctx.runMutation(internal.contact.markNotified, { id });
      }
    } catch (error) {
      // The message is safely stored, so treat delivery failure as non-fatal.
      console.error("Failed to send contact notification email", error);
    }

    return { ok: true };
  },
});
