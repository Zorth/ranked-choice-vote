import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    pollId: v.id("polls"),
    voterId: v.string(),
    rankings: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_poll_and_voter", (q) =>
        q.eq("pollId", args.pollId).eq("voterId", args.voterId)
      )
      .unique();

    if (existingVote) {
      await ctx.db.patch(existingVote._id, {
        rankings: args.rankings,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.insert("votes", {
        pollId: args.pollId,
        voterId: args.voterId,
        rankings: args.rankings,
        createdAt: Date.now(),
      });
    }
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

export const getMyVote = query({
  args: { pollId: v.id("polls"), voterId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_poll_and_voter", (q) =>
        q.eq("pollId", args.pollId).eq("voterId", args.voterId)
      )
      .unique();
  },
});
