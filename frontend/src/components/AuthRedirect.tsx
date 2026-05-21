"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * AuthRedirect — redirects to /login if user is not authenticated.
 * Wrap page content with this for pages that require full auth (no teaser).
 *
 * TODO: replace isLoggedIn with real auth check.
 */
export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // TODO: replace with real auth check
  const isLoggedIn = false;

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
