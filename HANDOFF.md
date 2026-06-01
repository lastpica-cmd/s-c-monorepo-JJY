# Slack Clone Monorepo Handoff

## Current State

- Monorepo uses `pnpm` workspaces and Turborepo.
- Web app is `apps/web`, built with Next.js `16.2.6`.
- Runtime chat data source is Convex only.
- Clerk handles authentication with GitHub and Google providers enabled in the Clerk dashboard.
- Convex cloud dev deployment is configured locally through `apps/web/.env.local`.
- `apps/web/.env.local` and `apps/web/.convex` are intentionally ignored by Git.
- `convex001.png` is a local screenshot used during setup and is intentionally untracked.

## Important Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm convex:dev
pnpm convex:seed
```

During feature work, run `pnpm build` directly at the end of each loop before committing.

## Environment

`apps/web/.env.local` should contain:

```env
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...
NEXT_PUBLIC_CONVEX_SITE_URL=https://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

Do not commit `.env.local`.

## Implemented Milestones

- Initial Next.js app created through `create-next-app@latest`.
- Monorepo converted to `pnpm` + Turborepo.
- Slack-style single channel UI implemented with monochrome Linear-like styling.
- Convex added and switched from local anonymous deployment to cloud dev deployment.
- Clerk added with GitHub login, then Google provider support through provider-neutral sign-in copy.
- Signed-in user information appears in the lower-left desktop sidebar with a logout button.
- Channel chat data layer switched from mock repository/fallback to Convex.
- New messages are attributed to the signed-in Clerk user ID.

## Key Files

- `apps/web/src/features/channel-chat/channel-chat-screen.tsx`
  - Main channel UI.
  - Uses Convex query/mutation only.
  - Reads Clerk user info for member identity.

- `apps/web/convex/channelChat.ts`
  - Convex query/mutation for channel conversation, seeding, and sending messages.
  - Upserts current Clerk user into `members` on message send.

- `apps/web/convex/schema.ts`
  - Convex schema for `channels`, `members`, and `messages`.

- `apps/web/src/app/auth-shell.tsx`
  - Clerk sign-in gate and mobile account button.

- `apps/web/src/proxy.ts`
  - Clerk middleware/proxy for Next.js.

- `packages/channel-chat/src`
  - Domain/application types remain.
  - Mock infrastructure files were removed from runtime/public API.

## Recent Commits

```text
9e1b290 Switch channel chat data layer to Convex
af154ce Show signed-in user in sidebar
231a19a Make auth copy provider neutral
42774e0 Add Clerk GitHub authentication
336710a Configure Convex cloud development
```

## Known Notes

- Existing old seed messages in Convex may still have old mock author IDs. New messages use Clerk user IDs.
- `pnpm convex:dev` keeps Convex function syncing active during local development.
- `pnpm dev` starts the Next.js app locally.
- If local setup is lost, log in to Convex again and make sure `apps/web/.env.local` points to the cloud dev URL, not `http://127.0.0.1:3210`.

## Suggested Next Work

1. Clean or migrate old mock-authored messages in Convex dev DB.
2. Add a proper membership model if multiple channels/workspaces are introduced.
3. Use Convex auth integration with Clerk JWT templates for server-side identity verification.
4. Add tests around message body validation and Convex mapping.
