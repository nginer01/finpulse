"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/landing", "/login"];

/**
 * AuthGuard — wraps all pages in the root layout.
 * - Not authenticated: only /landing and /login are accessible; everything else redirects to /landing.
 * - Authenticated: all routes accessible, no forced redirects.
 * - Shows a loading spinner while auth state is resolving (no flash of protected content).
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, loading } = useAuth();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn && !isPublic) {
      router.replace("/landing");
    }
  }, [isLoggedIn, loading, isPublic, router]);

  // While auth is loading, show spinner only for protected routes
  if (loading && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in on a protected route — don't render content (redirect is firing)
  if (!loading && !isLoggedIn && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
