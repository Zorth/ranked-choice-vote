import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    pollId: v.id("polls"),
    rankings: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("votes", {
      pollId: args.pollId,
      rankings: args.rankings,
      createdAt: Date.now(),
    });
  },
});

export const getByPoll = query({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_pollId", (q) => q.eq("pollId", args.pollId))
      .collect();
  },
});
