"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type SettingsTab = "profile" | "integrations" | "monitoring" | "tags" | "billing" | "policies" | "advanced";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profileData, setProfileData] = useState({
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "google-calendar", name: "Google Calendar", description: "john@acme.com", icon: "📅", connected: true },
    { id: "outlook-calendar", name: "Outlook Calendar", description: "Microsoft 365 & Exchange", icon: "📆", connected: false },
    { id: "slack", name: "Slack", description: "acme.slack.com", icon: "💬", connected: true },
    { id: "discord", name: "Discord", description: "Voice and text chat", icon: "🎮", connected: false },
    { id: "notion", name: "Notion", description: "Workspace: Acme Team", icon: "📝", connected: true },
    { id: "google-drive", name: "Google Drive", description: "googledrive.com", icon: "📁", connected: true },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("saku_auth");
    if (!token) router.replace("/login");

    // Load saved profile data
    const saved = localStorage.getItem("saku_profile");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProfileData(data);
      } catch {}
    }

    // Load profile photo
    const savedPhoto = localStorage.getItem("saku_profile_photo");
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        localStorage.setItem("saku_profile_photo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoFile(null);
    localStorage.removeItem("saku_profile_photo");
  };

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Auto-save
    setTimeout(() => {
      const updated = { ...profileData, [field]: value };
      localStorage.setItem("saku_profile", JSON.stringify(updated));
    }, 500);
  };

  const handleSaveChanges = () => {
    localStorage.setItem("saku_profile", JSON.stringify(profileData));
    alert("Changes saved successfully!");
  };

  const handleCancel = () => {
    const saved = localStorage.getItem("saku_profile");
    if (saved) {
      setProfileData(JSON.parse(saved));
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
  };

  const navItems = [
    { key: "profile" as SettingsTab, label: "Profile & Account" },
    { key: "integrations" as SettingsTab, label: "Integrations" },
    { key: "monitoring" as SettingsTab, label: "Monitoring" },
    { key: "tags" as SettingsTab, label: "Tags" },
    { key: "billing" as SettingsTab, label: "Payment & Billing" },
    { key: "policies" as SettingsTab, label: "Policies" },
    { key: "advanced" as SettingsTab, label: "Advanced" }
  ];

  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Account Settings</h1>
          <p className="text-sm text-neutral-600">Create workflow for making your work smoother</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Left Sidebar Navigation */}
          <aside className="bg-white rounded-lg border p-3">
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeTab === item.key
                      ? "bg-[#e5e7eb] text-black font-medium"
                      : "text-neutral-700 hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="bg-white rounded-lg border p-6 lg:p-8">
            {activeTab === "profile" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Profile & Account</h2>
                  <p className="text-sm text-neutral-600">Manage your personal information, preferences, and account settings.</p>
                </div>

                {/* Account Information Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Account Information</h3>
                  <p className="text-sm text-neutral-600 mb-6">Update your personal details and preferences.</p>

                  {/* Profile Photo */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Profile Photo</label>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        {profilePhoto ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-200 bg-neutral-100">
                            <Image
                              src={profilePhoto}
                              alt="Profile"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center border-2 border-neutral-300">
                            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full border border-neutral-300 flex items-center justify-center">
                          <svg className="w-3 h-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-2">This will be displayed on your profile.</p>
                        <div className="flex gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                          {profilePhoto && (
                            <button
                              onClick={handleRemovePhoto}
                              className="px-3 py-1.5 text-sm text-neutral-700 hover:text-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  {/* Job Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1.5">Job Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="e.g : Product Designer"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Role & Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Role</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profileData.role}
                          onChange={(e) => handleInputChange("role", e.target.value)}
                          className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                          placeholder="e.g : Executive"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Department</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profileData.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                          placeholder="e.g : Information Technology"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1.5">Primary Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profileData.primaryEmail}
                        onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="e.g : Romeosahal2@gmail.com"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-4">Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Languages</label>
                      <div className="relative">
                        <select
                          value={profileData.language}
                          onChange={(e) => handleInputChange("language", e.target.value)}
                          className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white appearance-none"
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Chinese</option>
                          <option>Japanese</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Primary Email</label>
                      <input
                        type="email"
                        value={profileData.preferenceEmail}
                        onChange={(e) => handleInputChange("preferenceEmail", e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="Romeosahal2@gmail.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t">
                  <p className="text-xs text-neutral-500">Changes will be saved automatically</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-neutral-300 rounded text-sm hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-black/90 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Integrations</h2>
                  <p className="text-sm text-neutral-600">Connect and manage integrations with your favorite apps and services.</p>
                </div>

                {/* Calendar Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Calendar</h3>
                  <p className="text-sm text-neutral-600 mb-4">Connect your calendar apps to automatically sync meetings and events.</p>
                  
                  <div className="space-y-3">
                    {integrations.filter(int => int.id.includes("calendar")).map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
                            {integration.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{integration.name}</h4>
                              {integration.connected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600">{integration.description}</p>
                          </div>
                        </div>
                        {integration.connected ? (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Manage
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-black/90 transition-colors"
                          >
                            + Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Communication</h3>
                  <p className="text-sm text-neutral-600 mb-4">Connect messaging and video conferencing tools.</p>
                  
                  <div className="space-y-3">
                    {integrations.filter(int => ["slack", "discord"].includes(int.id)).map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
                            {integration.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{integration.name}</h4>
                              {integration.connected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600">{integration.description}</p>
                          </div>
                        </div>
                        {integration.connected ? (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Manage
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-black/90 transition-colors"
                          >
                            + Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Productivity Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Productivity</h3>
                  <p className="text-sm text-neutral-600 mb-4">Connect project management and productivity tools.</p>
                  
                  <div className="space-y-3">
                    {integrations.filter(int => int.id === "notion").map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
                            {integration.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{integration.name}</h4>
                              {integration.connected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600">{integration.description}</p>
                          </div>
                        </div>
                        {integration.connected ? (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Manage
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-black/90 transition-colors"
                          >
                            + Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Storage</h3>
                  <p className="text-sm text-neutral-600 mb-4">Connect drives and storage tools</p>
                  
                  <div className="space-y-3">
                    {integrations.filter(int => int.id === "google-drive").map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
                            {integration.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{integration.name}</h4>
                              {integration.connected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600">{integration.description}</p>
                          </div>
                        </div>
                        {integration.connected ? (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Manage
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            className="px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-black/90 transition-colors"
                          >
                            + Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content placeholders */}
            {activeTab !== "profile" && activeTab !== "integrations" && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2 capitalize">{activeTab}</h2>
                <p className="text-neutral-600">This section is coming soon.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
