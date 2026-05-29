import type { ChannelId } from "./channel";
import type { MemberId } from "./member";

export type MessageId = string;

export type Message = {
  id: MessageId;
  channelId: ChannelId;
  authorId: MemberId;
  body: string;
  createdAt: string;
  reactions: MessageReaction[];
};

export type MessageReaction = {
  value: string;
  count: number;
};

export function createMessage(input: {
  id: MessageId;
  channelId: ChannelId;
  authorId: MemberId;
  body: string;
  createdAt?: string;
}): Message {
  const body = input.body.trim();

  if (body.length === 0) {
    throw new Error("Message body cannot be empty.");
  }

  if (body.length > 2000) {
    throw new Error("Message body cannot exceed 2000 characters.");
  }

  return {
    id: input.id,
    channelId: input.channelId,
    authorId: input.authorId,
    body,
    createdAt: input.createdAt ?? new Date().toISOString(),
    reactions: [],
  };
}
