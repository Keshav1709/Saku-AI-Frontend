"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // No auto-redirect on mount to avoid loops; we navigate only after successful login.

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Test credentials; adjust later. Also set cookie through API.
    if (username === "test" && password === "test123") {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error("Auth failed");
        localStorage.setItem("saku_auth", "ok");
        router.replace("/onboarding");
        return;
      } catch {
        // fallthrough to error below
      }
    }
    setError("Invalid credentials");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm border rounded-lg p-5 sm:p-6">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="test"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="test123"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" className="w-full bg-black text-white rounded py-2">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}


