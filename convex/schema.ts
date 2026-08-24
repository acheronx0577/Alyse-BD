import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    text: v.string(),
    sticker: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
    notified: v.boolean(),
  }).index("by_createdAt", ["createdAt"]),

  rateLimits: defineTable({
    scope: v.string(),
    key: v.string(),
    createdAt: v.number(),
  }).index("by_scope_key", ["scope", "key"]),
});
