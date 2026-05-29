import { createMockChannelConversation } from "@slack-clone/channel-chat";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CHANNEL_NAME = "general";

export const getConversation = query({
  args: {},
  handler: async (ctx) => {
    const channel = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", CHANNEL_NAME))
      .unique();

    if (!channel) {
      return null;
    }

    const members = await ctx.db.query("members").collect();
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_created", (q) => q.eq("channelId", channel._id))
      .collect();

    return {
      channel: {
        id: channel._id,
        name: channel.name,
        description: channel.description,
        memberCount: channel.memberCount,
        activeMembers: channel.activeMembers,
      },
      currentMemberId: "member-you",
      members: members.map((member) => ({
        id: member.externalId,
        displayName: member.displayName,
        role: member.role,
        presence: member.presence,
        avatarInitials: member.avatarInitials,
      })),
      messages: messages.map((message) => ({
        id: message._id,
        channelId: channel._id,
        authorId: message.authorId,
        body: message.body,
        createdAt: message.createdAt,
        reactions: message.reactions,
      })),
    };
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", CHANNEL_NAME))
      .unique();

    if (existingChannel) {
      return existingChannel._id;
    }

    const seedData = createMockChannelConversation();
    const channelId = await ctx.db.insert("channels", {
      name: seedData.channel.name,
      description: seedData.channel.description,
      memberCount: seedData.channel.memberCount,
      activeMembers: seedData.channel.activeMembers,
    });

    for (const member of seedData.members) {
      await ctx.db.insert("members", {
        externalId: member.id,
        displayName: member.displayName,
        role: member.role,
        presence: member.presence,
        avatarInitials: member.avatarInitials,
      });
    }

    for (const message of seedData.messages) {
      await ctx.db.insert("messages", {
        channelId,
        authorId: message.authorId,
        body: message.body,
        createdAt: message.createdAt,
        reactions: message.reactions,
      });
    }

    return channelId;
  },
});

export const send = mutation({
  args: {
    channelId: v.id("channels"),
    authorId: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const body = args.body.trim();

    if (body.length === 0) {
      throw new Error("Message body cannot be empty.");
    }

    if (body.length > 2000) {
      throw new Error("Message body cannot exceed 2000 characters.");
    }

    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: args.authorId,
      body,
      createdAt: new Date().toISOString(),
      reactions: [],
    });
  },
});
