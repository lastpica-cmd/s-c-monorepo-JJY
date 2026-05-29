import type { ChannelId } from "../domain/channel";
import type { ChannelConversation } from "../domain/conversation";
import type { MemberId } from "../domain/member";
import type { Message } from "../domain/message";

export type SendMessageCommand = {
  channelId: ChannelId;
  authorId: MemberId;
  body: string;
};

export interface ChannelChatRepository {
  getConversation(channelId: ChannelId): Promise<ChannelConversation>;
  sendMessage(command: SendMessageCommand): Promise<Message>;
}
