import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { verifyTurnstileToken } from "./botVerification";

const MAX_TEXT_LENGTH = 500;
const MAX_AUTHOR_LENGTH = 40;
const ALLOWED_STICKERS = ["🎂", "💗", "🐱", "🎈"];

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);

    return messages.map((message) => ({
      id: message._id,
      author: message.author,
      text: message.text,
      sticker: message.sticker,
      createdAt: message.createdAt,
    }));
  },
});

export const insert = internalMutation({
  args: {
    author: v.string(),
    text: v.string(),
    sticker: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      author: args.author,
      text: args.text,
      sticker: args.sticker,
      createdAt: Date.now(),
    });
  },
});

export const submit = action({
  args: {
    author: v.optional(v.string()),
    text: v.string(),
    sticker: v.string(),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) {
      throw new Error("Message cannot be empty.");
    }
    if (text.length > MAX_TEXT_LENGTH) {
      throw new Error(`Message must be ${MAX_TEXT_LENGTH} characters or fewer.`);
    }

    const author = (args.author ?? "").trim().slice(0, MAX_AUTHOR_LENGTH) || "Anonymous";
    const sticker = ALLOWED_STICKERS.includes(args.sticker) ? args.sticker : ALLOWED_STICKERS[0];

    const rateCheck = await ctx.runMutation(internal.rateLimit.checkAndRecord, {
      scope: "messages",
      key: author.toLowerCase(),
    });
    if (!rateCheck.allowed) {
      throw new Error("Too many messages. Please try again later.");
    }

    const botCheck = await verifyTurnstileToken(args.turnstileToken ?? "");
    if (!botCheck.ok) {
      throw new Error(botCheck.error);
    }

    await ctx.runMutation(internal.messages.insert, {
      author,
      text,
      sticker,
    });
  },
});
