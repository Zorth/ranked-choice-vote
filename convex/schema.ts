import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  polls: defineTable({
    title: v.string(),
    options: v.array(v.string()),
    deadline: v.number(),
    createdAt: v.number(),
  }).index("by_deadline", ["deadline"]),
  votes: defineTable({
    pollId: v.id("polls"),
    rankings: v.array(v.number()), // array of option indices
    createdAt: v.number(),
  }).index("by_pollId", ["pollId"]),
});
