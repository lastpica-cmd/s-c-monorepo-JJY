import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({
    name: v.string(),
    description: v.string(),
    memberCount: v.number(),
    activeMembers: v.array(v.string()),
  }).index("by_name", ["name"]),
  members: defineTable({
    externalId: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
    presence: v.union(v.literal("online"), v.literal("away"), v.literal("offline")),
    avatarInitials: v.string(),
  }).index("by_external_id", ["externalId"]),
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.string(),
    body: v.string(),
    createdAt: v.string(),
    reactions: v.array(
      v.object({
        value: v.string(),
        count: v.number(),
      }),
    ),
  }).index("by_channel_created", ["channelId", "createdAt"]),
});
