"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    
    if (session) {
      // User is authenticated, redirect to onboarding
      router.replace("/onboarding");
    } else {
      // User is not authenticated, redirect to login
      router.replace("/auth/login");
    }
  }, [session, isPending, router]);

  // Show loading while checking authentication
  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f8f9]">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-black flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">⚡</span>
          </div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </main>
    );
  }

  // This should not be reached due to the redirects above, but just in case
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f8f9] py-10">
      <div className="text-center max-w-xl px-4 sm:px-6">
        <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-black flex items-center justify-center">
          <span className="text-white text-xl">⚡</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">Meet Saku AI</h1>
        <p className="text-neutral-600 mb-6">Your proactive AI assistant that works seamlessly across all your apps and workflows.</p>
        <a href="/auth/login" className="inline-block bg-black text-white rounded px-4 py-2">Get Started</a>
      </div>
    </main>
  );
}
