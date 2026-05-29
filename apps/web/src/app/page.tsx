import { AuthShell } from "./auth-shell";
import { ChannelChatScreen } from "@/features/channel-chat/channel-chat-screen";

export default function Home() {
  return (
    <AuthShell>
      <ChannelChatScreen />
    </AuthShell>
  );
}
