import type { ChannelConversation } from "../../domain/conversation";

export const GENERAL_CHANNEL_ID = "channel-general";

export function createMockChannelConversation(): ChannelConversation {
  return {
    channel: {
      id: GENERAL_CHANNEL_ID,
      name: "general",
      description: "Product, engineering, and launch notes for the team.",
      memberCount: 8,
      activeMembers: ["member-you", "member-rin", "member-noah"],
    },
    currentMemberId: "member-you",
    members: [
      {
        id: "member-you",
        displayName: "You",
        role: "member",
        presence: "online",
        avatarInitials: "YU",
      },
      {
        id: "member-rin",
        displayName: "Rin Park",
        role: "owner",
        presence: "online",
        avatarInitials: "RP",
      },
      {
        id: "member-noah",
        displayName: "Noah Kim",
        role: "member",
        presence: "online",
        avatarInitials: "NK",
      },
      {
        id: "member-lee",
        displayName: "Mina Lee",
        role: "member",
        presence: "away",
        avatarInitials: "ML",
      },
    ],
    messages: [
      {
        id: "message-1",
        channelId: GENERAL_CHANNEL_ID,
        authorId: "member-rin",
        body: "Morning. I tightened the launch checklist and moved the risky auth items to the top.",
        createdAt: "2026-05-29T00:10:00.000Z",
        reactions: [{ value: "ack", count: 3 }],
      },
      {
        id: "message-2",
        channelId: GENERAL_CHANNEL_ID,
        authorId: "member-noah",
        body: "Good call. I can pair on the session expiry path after standup.",
        createdAt: "2026-05-29T00:12:00.000Z",
        reactions: [],
      },
      {
        id: "message-3",
        channelId: GENERAL_CHANNEL_ID,
        authorId: "member-you",
        body: "I'll wire the mock channel data today so the UI can move without waiting on the API contract.",
        createdAt: "2026-05-29T00:15:00.000Z",
        reactions: [{ value: "ship", count: 2 }],
      },
      {
        id: "message-4",
        channelId: GENERAL_CHANNEL_ID,
        authorId: "member-rin",
        body: "Perfect. Keep the domain clean so swapping the repository later stays boring.",
        createdAt: "2026-05-29T00:17:00.000Z",
        reactions: [],
      },
    ],
  };
}
