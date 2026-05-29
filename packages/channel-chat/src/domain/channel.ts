import type { Member } from "./member";

export type ChannelId = string;

export type Channel = {
  id: ChannelId;
  name: string;
  description: string;
  memberCount: number;
  activeMembers: Member["id"][];
};
