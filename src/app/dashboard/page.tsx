import { MainSidebar } from "@/components/MainSidebar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <div className="flex">
        <MainSidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">Hello, Romeo</h1>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search Gmail, Slack, Docs & Web"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
            
            {/* Quick Access Apps */}
            <div className="flex items-center gap-4 mt-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.94 15.54a1 1 0 01-1.42-1.42l4.24-4.24a1 1 0 011.42 0l1.41 1.41 2.83-2.83a1 1 0 011.42 0l4.24 4.24a1 1 0 010 1.42l-4.24 4.24a1 1 0 01-1.42 0l-2.83-2.83-1.41 1.41a1 1 0 01-1.42 0l-4.24-4.24z"/>
                </svg>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">N</div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">31</div>
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Tasks Section */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Tasks</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <button className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
                    + New Task
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 mb-4">
                <button className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium">Tasks</button>
                <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium">Approvals (2)</button>
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-black">Review marketing Budget proposal</div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Today 3:00
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        i === 1 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {i === 1 ? 'high' : 'low'}
                      </span>
                      <button className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Mark As Complete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today Schedule Section */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold text-black mb-4">Today Schedule</h2>
              
              <div className="space-y-3">
                {[
                  { title: "Team Standup", time: "9:00 AM • 15 min", icon: "check", participants: 8 },
                  { title: "Review marketing budget proposal", time: "9:00 AM • 15 min", icon: "doc", participants: 8 },
                  { title: "Client Demo Call", time: "9:00 AM • 15 min", icon: "phone", participants: 8 },
                  { title: "Client Demo Call", time: "9:00 AM • 15 min", icon: "phone", participants: 8 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {item.icon === "check" && (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {item.icon === "doc" && (
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {item.icon === "phone" && (
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-black">{item.title}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm">{item.participants}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions Section */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold text-black mb-4">AI Suggestions</h2>
              
              <div className="space-y-3">
                {[
                  {
                    title: "Review pending approvals",
                    description: "2 high-priority items awaiting your approval for over 15 minutes",
                    priority: "high",
                    button: "Review Now"
                  },
                  {
                    title: "Schedule follow-up with Sarah Chen",
                    description: "No response to your email from 3 days ago about Q3 campaign results",
                    priority: "medium",
                    button: "Schedule Meeting"
                  },
                  {
                    title: "Prepare for tomorrow's standup",
                    description: "2 high-priority items awaiting your approval for over 15 minutes",
                    priority: "low",
                    button: "Review Now"
                  }
                ].map((suggestion, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-black mb-1">{suggestion.title}</h3>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                        suggestion.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                      {suggestion.button}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Trace Section */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold text-black mb-4">AI Trace</h2>
              
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium text-black">User Query Received</span>
                        </div>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                      <span className="text-xs text-gray-500">0.1s</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">10:30:15</div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-black">Q Search Query</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-6">Q3 marketing strategy Discussion</div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-black">Sources</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-6">Gmail, Slack, Docs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


