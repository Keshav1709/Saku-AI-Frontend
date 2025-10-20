"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainSidebar } from "@/components/MainSidebar";

type WorkflowStatus = "active" | "draft";

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  integrations: string[];
  lastEdited?: string;
};

type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  integrations: string[];
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recent" | "templates">("recent");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates] = useState<WorkflowTemplate[]>([
    {
      id: "email-summarizer",
      name: "Email Summarizer",
      description: "Automatically summarize long emails and extract key action items for quick review.",
      integrations: ["gmail", "slack", "openai"]
    },
    {
      id: "meeting-scheduler",
      name: "Meeting Scheduler",
      description: "Coordinate meeting times across multiple participants and auto send calendar invites.",
      integrations: ["gmail", "outlook", "notion"]
    },
    {
      id: "data-backup",
      name: "Data Backup",
      description: "Automatically backup important files to cloud storage on a scheduled basis.",
      integrations: ["google-drive", "gmail", "notion"]
    },
    {
      id: "invoice-generator",
      name: "Invoice Generator",
      description: "Generate and send professional invoices with automated payment reminders.",
      integrations: ["gmail", "slack", "google-drive"]
    },
    {
      id: "social-media-poster",
      name: "Social Media Poster",
      description: "Schedule and post content across multiple social media platforms simultaneously.",
      integrations: ["notion", "google-drive", "gmail"]
    },
    {
      id: "lead-tracker",
      name: "Lead Tracker",
      description: "Track and manage sales leads with auto follow-up reminders & progress updates.",
      integrations: ["notion", "google-drive", "gmail"]
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem("saku_auth");
    if (!token) router.replace("/login");
    (async () => {
      try {
        const resp = await fetch('/api/workflows');
        const json = await resp.json();
        setWorkflows(json.workflows || []);
      } catch {}
    })();
  }, [router]);

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;
    try {
      const resp = await fetch('/api/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newWorkflowName, description: newWorkflowDescription }) });
      const json = await resp.json();
      if (json?.ok && json?.workflow) {
        setWorkflows((w) => [json.workflow, ...w]);
        setNewWorkflowName("");
        setNewWorkflowDescription("");
        setShowCreateModal(false);
        router.push(`/workflows/${json.workflow.id}/builder`);
      }
    } catch {}
  };

  const handleUseTemplate = (template: WorkflowTemplate) => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: template.name,
      description: template.description,
      status: "draft",
      integrations: template.integrations,
      lastEdited: "Just now"
    };

    const updatedWorkflows = [newWorkflow, ...workflows];
    setWorkflows(updatedWorkflows);
    localStorage.setItem("saku_workflows", JSON.stringify(updatedWorkflows));

    // Navigate to workflow builder
    router.push(`/workflows/${newWorkflow.id}/builder`);
  };

  const handleEditWorkflow = (workflowId: string) => {
    router.push(`/workflows/${workflowId}/builder`);
  };

  const getIntegrationIcon = (integration: string) => {
    const icons: { [key: string]: string } = {
      gmail: "📧",
      slack: "💬",
      openai: "🤖",
      outlook: "📅",
      notion: "📝",
      "google-drive": "📁",
      "microsoft-teams": "👥"
    };
    return icons[integration] || "🔗";
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold mb-1">Workflows</h1>
                <p className="text-sm text-neutral-600">Create workflow for making your work smoother</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Workflow
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b">
              <button
                onClick={() => setActiveTab("recent")}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "recent"
                    ? "text-black border-b-2 border-black"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "templates"
                    ? "text-black border-b-2 border-black"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Templates
              </button>
            </div>

            {/* Workflow Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === "recent" ? workflows : templates).map((item) => (
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors">
                  {/* Integration Icons */}
                  <div className="flex gap-2 mb-3">
                    {item.integrations.map((integration, index) => (
                      <div key={index} className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center text-sm">
                        {getIntegrationIcon(integration)}
                      </div>
                    ))}
                  </div>

                  {/* Status Badge */}
                  {activeTab === "recent" && (
                    <div className="flex justify-end mb-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {item.status === "active" ? "Active" : "Draft"}
                      </span>
                    </div>
                  )}

                  {/* Title and Description */}
                  <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-sm text-neutral-600 mb-3">{item.description}</p>

                  {/* Last Edited */}
                  {activeTab === "recent" && item.lastEdited && (
                    <p className="text-xs text-neutral-500 mb-3">Edited {item.lastEdited}</p>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => 
                      activeTab === "recent" 
                        ? handleEditWorkflow(item.id)
                        : handleUseTemplate(item as WorkflowTemplate)
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {activeTab === "recent" ? "Edit Workflow" : "Use"}
                  </button>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {activeTab === "recent" && workflows.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
                <p className="text-neutral-600 mb-4">Create your first workflow to automate your tasks</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                >
                  Create Workflow
                </button>
              </div>
            )}
        </div>
      </main>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Creating New Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Workflow Name"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="Write a short description"
                  rows={3}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName.trim()}
                className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
