"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type Conversation = { id: string; title?: string; createdAt?: string };

type ProfileData = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  role: string;
  department: string;
  primaryEmail: string;
  language: string;
  preferenceEmail: string;
};

export function MainSidebar({ 
  onNew, 
  onSelect, 
  selectedId 
}: { 
  onNew?: () => void; 
  onSelect?: (id: string) => void; 
  selectedId?: string | null 
}) {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Romeo",
    lastName: "Saha",
    jobTitle: "",
    role: "",
    department: "",
    primaryEmail: "",
    language: "English",
    preferenceEmail: "Romeosahal2@gmail.com"
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    // Load conversations from backend minimal index if available, fallback localStorage
    (async () => {
      try {
        // We don't yet have a list endpoint; use local storage list for now
        const raw = localStorage.getItem("saku_sessions");
        const parsed = raw ? (JSON.parse(raw) as Conversation[]) : [];
        setConversations(parsed);
      } catch {
        const raw = localStorage.getItem("saku_sessions");
        const parsed = raw ? (JSON.parse(raw) as Conversation[]) : [];
        setConversations(parsed);
      }
    })();

    // Load profile data from localStorage
    const savedProfile = localStorage.getItem("saku_profile");
    if (savedProfile) {
      try {
        const data = JSON.parse(savedProfile);
        setProfileData(data);
      } catch (error) {
        console.error("Failed to parse profile data:", error);
      }
    }

    // Load profile photo from localStorage
    const savedPhoto = localStorage.getItem("saku_profile_photo");
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }

    // Listen for storage changes to update profile in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "saku_profile" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          setProfileData(data);
        } catch (error) {
          console.error("Failed to parse updated profile data:", error);
        }
      }
      if (e.key === "saku_profile_photo") {
        setProfilePhoto(e.newValue);
      }
    };

    // Listen for custom events for real-time updates within the same tab
    const handleProfileUpdate = (e: CustomEvent) => {
      setProfileData(e.detail);
    };

    const handlePhotoUpdate = (e: CustomEvent) => {
      setProfilePhoto(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleProfileUpdate as EventListener);
    window.addEventListener("profilePhotoUpdated", handlePhotoUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdate as EventListener);
      window.removeEventListener("profilePhotoUpdated", handlePhotoUpdate as EventListener);
    };
  }, []);

  const navItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: "/chat",
      label: "New Chat",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      href: "/workflows",
      label: "WorkFlows",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      href: "/meetings",
      label: "Meetings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      href: "/insights",
      label: "Insights",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      href: "/settings",
      label: "Settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="font-semibold text-black">SakuAI</span>
      </div>

      {/* Workspace Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-black">
          <span className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-medium">P</span>
          <span>My Workspace</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "#" && pathname.startsWith(item.href));
          
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
                isActive
                  ? "text-white bg-black"
                  : "text-black hover:bg-neutral-50"
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Chats Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-black">Chats</div>
          {onNew && (
            <button 
              onClick={onNew}
              className="w-6 h-6 bg-black text-white rounded flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-xs text-neutral-600 py-2">No conversations</div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect?.(conversation.id)}
                className={`w-full text-left px-2 py-2 rounded text-xs transition-colors ${
                  selectedId === conversation.id 
                    ? "bg-black text-white" 
                    : "text-black hover:bg-neutral-100"
                }`}
              >
                <div className="truncate font-medium">{conversation.title}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {new Date(conversation.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded cursor-pointer">
        <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
          {profilePhoto ? (
            <Image
              src={profilePhoto}
              alt="Profile"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-black">
            {profileData.firstName && profileData.lastName 
              ? `${profileData.firstName} ${profileData.lastName}` 
              : profileData.firstName || "User"
            }
          </div>
          <div className="text-xs text-black">
            {profileData.primaryEmail || profileData.preferenceEmail || "No email"}
          </div>
        </div>
        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </aside>
  );
}
