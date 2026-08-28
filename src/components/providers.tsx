"use client";

import { AppShell } from "@/components/app-shell";
import { MembersProvider } from "@/components/members-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MembersProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
    </MembersProvider>
  );
}
