import type {
  ChannelChatRepository,
  SendMessageCommand,
} from "./channel-chat-repository";

export function sendChannelMessage(
  repository: ChannelChatRepository,
  command: SendMessageCommand,
) {
  return repository.sendMessage(command);
}
