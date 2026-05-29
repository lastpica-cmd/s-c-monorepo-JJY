import type {
  ChannelChatRepository,
  SendMessageCommand,
} from "../../application/channel-chat-repository";
import type { ChannelId } from "../../domain/channel";
import type { ChannelConversation } from "../../domain/conversation";
import type { Message } from "../../domain/message";
import { createMessage } from "../../domain/message";
import { createMockChannelConversation } from "./mock-channel-data";

export class MockChannelChatRepository implements ChannelChatRepository {
  private conversation: ChannelConversation;

  constructor(seed: ChannelConversation = createMockChannelConversation()) {
    this.conversation = structuredClone(seed);
  }

  async getConversation(channelId: ChannelId): Promise<ChannelConversation> {
    this.ensureChannel(channelId);
    return structuredClone(this.conversation);
  }

  async sendMessage(command: SendMessageCommand): Promise<Message> {
    this.ensureChannel(command.channelId);

    const message = createMessage({
      id: `message-${crypto.randomUUID()}`,
      channelId: command.channelId,
      authorId: command.authorId,
      body: command.body,
    });

    this.conversation.messages = [...this.conversation.messages, message];
    return structuredClone(message);
  }

  private ensureChannel(channelId: ChannelId) {
    if (channelId !== this.conversation.channel.id) {
      throw new Error(`Channel ${channelId} was not found.`);
    }
  }
}
