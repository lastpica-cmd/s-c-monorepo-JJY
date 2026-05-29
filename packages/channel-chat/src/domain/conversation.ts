import type { Channel } from "./channel";
import type { Member } from "./member";
import type { Message } from "./message";

export type ChannelConversation = {
  channel: Channel;
  members: Member[];
  messages: Message[];
  currentMemberId: Member["id"];
};
