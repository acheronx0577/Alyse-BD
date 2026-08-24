import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const WINDOW_MS = 60 * 60 * 1000;

const LIMITS = {
  contact: 5,
  messages: 15,
} as const;

export const checkAndRecord = internalMutation({
  args: {
    scope: v.union(v.literal("contact"), v.literal("messages")),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const limit = LIMITS[args.scope];
    const windowStart = Date.now() - WINDOW_MS;

    const recent = await ctx.db
      .query("rateLimits")
      .withIndex("by_scope_key", (q) => q.eq("scope", args.scope).eq("key", args.key))
      .filter((q) => q.gt(q.field("createdAt"), windowStart))
      .collect();

    if (recent.length >= limit) {
      return { allowed: false as const };
    }

    await ctx.db.insert("rateLimits", {
      scope: args.scope,
      key: args.key,
      createdAt: Date.now(),
    });

    return { allowed: true as const };
  },
});
