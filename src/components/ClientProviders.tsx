"use client";

import type { ReactNode } from "react";
import UserProfileProvider from "@/components/UserProfileProvider";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <UserProfileProvider>{children}</UserProfileProvider>;
}
