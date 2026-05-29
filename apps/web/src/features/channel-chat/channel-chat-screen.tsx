"use client";

import {
  GENERAL_CHANNEL_ID,
  MockChannelChatRepository,
  getChannelConversation,
  sendChannelMessage,
  type ChannelConversation,
  type Member,
  type Message,
} from "@slack-clone/channel-chat";
import { FormEvent, useEffect, useMemo, useState } from "react";

function byId<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function PresenceDot({ presence }: { presence: Member["presence"] }) {
  const className =
    presence === "online"
      ? "bg-black"
      : presence === "away"
        ? "bg-zinc-500"
        : "bg-zinc-300";

  return (
    <span
      aria-label={presence}
      className={`inline-block size-2 rounded-full ${className}`}
    />
  );
}

function MessageRow({
  message,
  member,
  isCurrentMember,
}: {
  message: Message;
  member: Member;
  isCurrentMember: boolean;
}) {
  return (
    <article className="group grid grid-cols-[36px_1fr] gap-3 rounded-md px-2 py-2 transition-colors hover:bg-zinc-50">
      <div className="flex size-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 text-[11px] font-semibold text-zinc-950">
        {member.avatarInitials}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-950">
            {isCurrentMember ? "You" : member.displayName}
          </span>
          <span className="text-xs text-zinc-500">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-800">
          {message.body}
        </p>
        {message.reactions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.reactions.map((reaction) => (
              <span
                key={reaction.value}
                className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-700"
              >
                {reaction.value} {reaction.count}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ChannelChatScreen() {
  const repository = useMemo(() => new MockChannelChatRepository(), []);
  const [conversation, setConversation] = useState<ChannelConversation | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    getChannelConversation(repository, GENERAL_CHANNEL_ID).then((data) => {
      if (mounted) {
        setConversation(data);
      }
    });

    return () => {
      mounted = false;
    };
  }, [repository]);

  const membersById = useMemo(
    () => byId(conversation?.members ?? []),
    [conversation?.members],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conversation || draft.trim().length === 0) {
      return;
    }

    setIsSending(true);

    try {
      await sendChannelMessage(repository, {
        channelId: conversation.channel.id,
        authorId: conversation.currentMemberId,
        body: draft,
      });

      const nextConversation = await getChannelConversation(
        repository,
        conversation.channel.id,
      );
      setConversation(nextConversation);
      setDraft("");
    } finally {
      setIsSending(false);
    }
  }

  if (!conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-zinc-500">
        Loading channel
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-white text-zinc-950">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-zinc-950 p-3 text-white lg:flex lg:flex-col">
        <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
          <div className="text-sm font-semibold">Mono Workspace</div>
          <div className="mt-1 text-xs text-zinc-400">8 members</div>
        </div>

        <nav className="mt-5 space-y-1">
          {["Threads", "Mentions", "Files"].map((item) => (
            <button
              key={item}
              className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          <div className="px-3 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Channels
          </div>
          <button className="mt-2 flex w-full items-center rounded-md bg-white px-3 py-2 text-left text-sm font-medium text-zinc-950">
            # {conversation.channel.name}
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">
                # {conversation.channel.name}
              </h1>
              <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600">
                Mock
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {conversation.channel.description}
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-zinc-500">
              {conversation.channel.memberCount} members
            </span>
            <div className="flex -space-x-2">
              {conversation.channel.activeMembers.map((memberId) => {
                const member = membersById.get(memberId);

                if (!member) {
                  return null;
                }

                return (
                  <div
                    key={member.id}
                    className="flex size-7 items-center justify-center rounded-md border border-white bg-zinc-100 text-[10px] font-semibold text-zinc-950"
                    title={member.displayName}
                  >
                    {member.avatarInitials}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[1fr_280px]">
          <div className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-1">
                <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <h2 className="text-sm font-semibold">
                    Welcome to #{conversation.channel.name}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    This slice is backed by an in-memory mock repository. The UI
                    talks to application use cases, while domain validation owns
                    message rules.
                  </p>
                </div>

                {conversation.messages.map((message) => {
                  const member = membersById.get(message.authorId);

                  if (!member) {
                    return null;
                  }

                  return (
                    <MessageRow
                      key={message.id}
                      message={message}
                      member={member}
                      isCurrentMember={
                        message.authorId === conversation.currentMemberId
                      }
                    />
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-zinc-200 bg-white px-3 py-3 sm:px-6"
            >
              <div className="mx-auto max-w-3xl rounded-lg border border-zinc-300 bg-white p-2 shadow-[0_1px_0_rgba(0,0,0,0.04)] focus-within:border-zinc-950">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message #${conversation.channel.name}`}
                  rows={3}
                  className="block max-h-40 min-h-20 w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-zinc-950 outline-none placeholder:text-zinc-400"
                />
                <div className="flex items-center justify-between border-t border-zinc-100 px-2 pt-2">
                  <div className="text-xs text-zinc-500">
                    {draft.trim().length}/2000
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || draft.trim().length === 0}
                    className="rounded-md bg-zinc-950 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    {isSending ? "Sending" : "Send"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside className="hidden border-l border-zinc-200 bg-zinc-50 p-4 xl:block">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Members
            </div>
            <div className="mt-3 space-y-2">
              {conversation.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-md px-2 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-[10px] font-semibold">
                      {member.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {member.displayName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {member.role}
                      </div>
                    </div>
                  </div>
                  <PresenceDot presence={member.presence} />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
