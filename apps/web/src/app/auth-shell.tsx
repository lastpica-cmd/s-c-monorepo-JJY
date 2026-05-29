"use client";

import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-zinc-500">
        Loading authentication
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-zinc-950">
        <section className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Mono Workspace
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Use an approved account to enter the workspace.
          </p>
          <SignInButton mode="modal">
            <button className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
              Continue to sign in
            </button>
          </SignInButton>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="fixed right-4 top-3 z-50 rounded-md border border-zinc-200 bg-white p-1 shadow-[0_1px_0_rgba(0,0,0,0.04)] lg:hidden">
        <UserButton />
      </div>
      {children}
    </>
  );
}
