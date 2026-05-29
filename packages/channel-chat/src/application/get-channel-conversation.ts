import type { ChannelId } from "../domain/channel";
import type { ChannelChatRepository } from "./channel-chat-repository";

export function getChannelConversation(
  repository: ChannelChatRepository,
  channelId: ChannelId,
) {
  return repository.getConversation(channelId);
}
