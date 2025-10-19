"use client";

import { useState, useEffect } from "react";
import { MainSidebar } from "@/components/MainSidebar";

interface IntegrationData {
  messages?: any[];
  files?: any[];
  events?: any[];
}

export default function IntegrationsPage() {
  const [data, setData] = useState<IntegrationData>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gmail' | 'drive' | 'calendar'>('gmail');

  const fetchData = async (service: string, type: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations?service=${service}&type=${type}&maxResults=10`);
      const result = await response.json();
      
      if (service === 'gmail') {
        setData(prev => ({ ...prev, messages: result.messages || [] }));
      } else if (service === 'drive') {
        setData(prev => ({ ...prev, files: result.files || [] }));
      } else if (service === 'calendar') {
        setData(prev => ({ ...prev, events: result.events || [] }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${service} ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gmail') {
      fetchData('gmail', 'messages');
    } else if (activeTab === 'drive') {
      fetchData('drive', 'files');
    } else if (activeTab === 'calendar') {
      fetchData('calendar', 'events');
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <div className="flex">
        <MainSidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">Integration Data</h1>
            <p className="text-gray-600">View data from your connected integrations</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {(['gmail', 'drive', 'calendar'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {tab === 'gmail' ? 'Gmail' : tab === 'drive' ? 'Drive' : 'Calendar'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                {activeTab === 'gmail' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Gmail Messages</h2>
                    {data.messages?.length ? (
                      <div className="space-y-3">
                        {data.messages.map((message, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-black">{message.subject}</h3>
                                <p className="text-sm text-gray-600 mt-1">{message.sender}</p>
                                <p className="text-xs text-gray-500 mt-1">{message.date}</p>
                                <p className="text-sm text-gray-700 mt-2">{message.snippet}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No Gmail messages found. Make sure Gmail is connected.</p>
                    )}
                  </div>
                )}

                {activeTab === 'drive' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Google Drive Files</h2>
                    {data.files?.length ? (
                      <div className="space-y-3">
                        {data.files.map((file, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-black">{file.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{file.mimeType}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Created: {new Date(file.createdTime).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">Size: {file.size} bytes</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No Google Drive files found. Make sure Google Drive is connected.</p>
                    )}
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Calendar Events</h2>
                    {data.events?.length ? (
                      <div className="space-y-3">
                        {data.events.map((event, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-black">{event.summary}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  Start: {event.start?.dateTime || event.start?.date}
                                </p>
                                <p className="text-sm text-gray-600">
                                  End: {event.end?.dateTime || event.end?.date}
                                </p>
                                {event.description && (
                                  <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                                )}
                                {event.location && (
                                  <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No calendar events found. Make sure Google Calendar is connected.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
