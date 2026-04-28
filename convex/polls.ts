import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    options: v.array(v.string()),
    deadline: v.number(),
  },
  handler: async (ctx, args) => {
    const pollId = await ctx.db.insert("polls", {
      title: args.title,
      options: args.options,
      deadline: args.deadline,
      createdAt: Date.now(),
    });
    return pollId;
  },
});

export const get = query({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("polls")) },
  handler: async (ctx, args) => {
    const polls = [];
    for (const id of args.ids) {
      const poll = await ctx.db.get(id);
      if (poll) polls.push(poll);
    }
    return polls;
  },
});

export const deleteOldPolls = mutation({
  args: {},
  handler: async (ctx) => {
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const expiredPolls = await ctx.db
      .query("polls")
      .withIndex("by_deadline", (q) => q.lt("deadline", now - oneMonthInMs))
      .collect();

    for (const poll of expiredPolls) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_pollId", (q) => q.eq("pollId", poll._id))
        .collect();
      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
      await ctx.db.delete(poll._id);
    }
  },
});
