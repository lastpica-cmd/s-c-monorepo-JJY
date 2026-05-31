import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const CHANNEL_NAME = "general";
const initialChannel = {
  name: CHANNEL_NAME,
  description: "Product, engineering, and launch notes for the team.",
  memberCount: 4,
  activeMembers: ["member-rin", "member-noah"],
};
const initialMembers = [
  {
    externalId: "member-rin",
    displayName: "Rin Park",
    role: "owner" as const,
    presence: "online" as const,
    avatarInitials: "RP",
  },
  {
    externalId: "member-noah",
    displayName: "Noah Kim",
    role: "member" as const,
    presence: "online" as const,
    avatarInitials: "NK",
  },
  {
    externalId: "member-lee",
    displayName: "Mina Lee",
    role: "member" as const,
    presence: "away" as const,
    avatarInitials: "ML",
  },
];
const initialMessages = [
  {
    authorId: "member-rin",
    body: "Morning. I tightened the launch checklist and moved the risky auth items to the top.",
    createdAt: "2026-05-29T00:10:00.000Z",
    reactions: [{ value: "ack", count: 3 }],
  },
  {
    authorId: "member-noah",
    body: "Good call. I can pair on the session expiry path after standup.",
    createdAt: "2026-05-29T00:12:00.000Z",
    reactions: [],
  },
  {
    authorId: "member-rin",
    body: "Perfect. Keep the domain clean so swapping the repository later stays boring.",
    createdAt: "2026-05-29T00:17:00.000Z",
    reactions: [],
  },
];

const currentUserValidator = v.object({
  externalId: v.string(),
  displayName: v.string(),
  email: v.optional(v.string()),
});

type CurrentUser = {
  externalId: string;
  displayName: string;
  email?: string;
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function mapMember(member: Doc<"members">) {
  return {
    id: member.externalId,
    displayName: member.displayName,
    role: member.role,
    presence: member.presence,
    avatarInitials: member.avatarInitials,
  };
}

function mapCurrentUser(user: CurrentUser) {
  return {
    id: user.externalId,
    displayName: user.displayName,
    role: "member" as const,
    presence: "online" as const,
    avatarInitials: initialsFromName(user.displayName) || "ME",
  };
}

async function findGeneralChannel(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query("channels")
    .withIndex("by_name", (q) => q.eq("name", CHANNEL_NAME))
    .unique();
}

async function ensureCurrentMember(ctx: MutationCtx, user: CurrentUser) {
  const existingMember = await ctx.db
    .query("members")
    .withIndex("by_external_id", (q) => q.eq("externalId", user.externalId))
    .unique();

  const nextMember = {
    externalId: user.externalId,
    displayName: user.displayName,
    email: user.email,
    role: "member" as const,
    presence: "online" as const,
    avatarInitials: initialsFromName(user.displayName) || "ME",
  };

  if (!existingMember) {
    return await ctx.db.insert("members", nextMember);
  }

  await ctx.db.patch(existingMember._id, {
    displayName: nextMember.displayName,
    email: nextMember.email,
    presence: nextMember.presence,
    avatarInitials: nextMember.avatarInitials,
  });

  return existingMember._id;
}

async function syncChannelMembership(
  ctx: MutationCtx,
  channelId: Id<"channels">,
  userExternalId: string,
) {
  const channel = await ctx.db.get(channelId);

  if (!channel) {
    throw new Error("Channel was not found.");
  }

  const activeMembers = channel.activeMembers.includes(userExternalId)
    ? channel.activeMembers
    : [...channel.activeMembers, userExternalId];
  const members = await ctx.db.query("members").collect();

  await ctx.db.patch(channelId, {
    activeMembers,
    memberCount: members.length,
  });
}

export const getConversation = query({
  args: {
    currentUser: currentUserValidator,
  },
  handler: async (ctx, args) => {
    const channel = await findGeneralChannel(ctx);

    if (!channel) {
      return null;
    }

    const persistedMembers = await ctx.db.query("members").collect();
    const hasCurrentMember = persistedMembers.some(
      (member) => member.externalId === args.currentUser.externalId,
    );
    const members = hasCurrentMember
      ? persistedMembers.map(mapMember)
      : [...persistedMembers.map(mapMember), mapCurrentUser(args.currentUser)];
    const activeMembers = channel.activeMembers.includes(
      args.currentUser.externalId,
    )
      ? channel.activeMembers
      : [...channel.activeMembers, args.currentUser.externalId];
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_created", (q) => q.eq("channelId", channel._id))
      .collect();

    return {
      channel: {
        id: channel._id,
        name: channel.name,
        description: channel.description,
        memberCount: Math.max(channel.memberCount, members.length),
        activeMembers,
      },
      currentMemberId: args.currentUser.externalId,
      members,
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
    const existingChannel = await findGeneralChannel(ctx);

    if (existingChannel) {
      return existingChannel._id;
    }

    const channelId = await ctx.db.insert("channels", {
      name: initialChannel.name,
      description: initialChannel.description,
      memberCount: initialChannel.memberCount,
      activeMembers: initialChannel.activeMembers,
    });

    for (const member of initialMembers) {
      await ctx.db.insert("members", {
        externalId: member.externalId,
        displayName: member.displayName,
        role: member.role,
        presence: member.presence,
        avatarInitials: member.avatarInitials,
      });
    }

    for (const message of initialMessages) {
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
    currentUser: currentUserValidator,
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

    await ensureCurrentMember(ctx, args.currentUser);
    await syncChannelMembership(ctx, args.channelId, args.currentUser.externalId);

    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: args.currentUser.externalId,
      body,
      createdAt: new Date().toISOString(),
      reactions: [],
    });
  },
});
