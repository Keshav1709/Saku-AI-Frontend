"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("saku_auth");
    }
    router.replace("/login");
  }

  const linkCls = (path: string) =>
    `px-3 py-2 rounded ${pathname === path ? "bg-black text-white" : "hover:bg-black/5"}`;

  return (
    <header className="h-12 border-b flex items-center justify-between px-4">
      <div className="font-medium">SakuAI</div>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/chat" className={linkCls("/chat")}>
          Chat
        </Link>
        <Link href="/upload" className={linkCls("/upload")}>
          Upload
        </Link>
        <Link href="/docs" className={linkCls("/docs")}>
          Documents
        </Link>
        <button className="ml-4 underline" onClick={logout}>
          Logout
        </button>
      </nav>
    </header>
  );
}


