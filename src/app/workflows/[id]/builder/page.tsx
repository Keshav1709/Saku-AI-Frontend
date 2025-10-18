"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

type ComponentType = "trigger" | "ai-processing" | "output";

type WorkflowComponent = {
  id: string;
  type: ComponentType;
  name: string;
  description: string;
  icon: string;
  category: string;
  service?: string;
  config?: any;
};

type WorkflowNode = {
  id: string;
  componentId: string;
  x: number;
  y: number;
  config?: any;
};

type WorkflowConnection = {
  from: string;
  to: string;
};

type Workflow = {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
};

const COMPONENTS: WorkflowComponent[] = [
  // Triggers
  {
    id: "email-trigger",
    type: "trigger",
    name: "Email Trigger",
    description: "Gmail, Outlook",
    icon: "📧",
    category: "TRIGGERS"
  },
  {
    id: "webhook",
    type: "trigger",
    name: "Webhook",
    description: "HTTP trigger",
    icon: "🔗",
    category: "TRIGGERS"
  },
  {
    id: "schedule",
    type: "trigger",
    name: "Schedule",
    description: "Time-based",
    icon: "⏰",
    category: "TRIGGERS"
  },
  // AI Processing
  {
    id: "text-summary",
    type: "ai-processing",
    name: "Text Summary",
    description: "GPT-4, Claude",
    icon: "🧠",
    category: "AI PROCESSING"
  },
  {
    id: "sentiment-analysis",
    type: "ai-processing",
    name: "Sentiment Analysis",
    description: "Analyze tone",
    icon: "⚡",
    category: "AI PROCESSING"
  },
  {
    id: "text-generation",
    type: "ai-processing",
    name: "Text Generation",
    description: "Generate content",
    icon: "✏️",
    category: "AI PROCESSING"
  },
  // Outputs
  {
    id: "slack-message",
    type: "output",
    name: "Slack Message",
    description: "Post to channel",
    icon: "💬",
    category: "OUTPUTS"
  },
  {
    id: "send-email",
    type: "output",
    name: "Send Email",
    description: "Reply or forward",
    icon: "📧",
    category: "OUTPUTS"
  },
  {
    id: "update-database",
    type: "output",
    name: "Update Database",
    description: "Store data",
    icon: "🗄️",
    category: "OUTPUTS"
  }
];

export default function WorkflowBuilder() {
  const router = useRouter();
  const params = useParams();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [workflow, setWorkflow] = useState<Workflow>({
    id: params.id as string,
    name: "New Workflow 1",
    description: "Create workflow for making your work smoother",
    nodes: [],
    connections: []
  });
  const [zoom, setZoom] = useState(100);
  const [chatMessage, setChatMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragComponent, setDragComponent] = useState<WorkflowComponent | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("saku_auth");
    if (!token) router.replace("/login");

    // Load workflow data
    const savedWorkflows = localStorage.getItem("saku_workflows");
    if (savedWorkflows) {
      try {
        const workflows = JSON.parse(savedWorkflows);
        const currentWorkflow = workflows.find((w: Workflow) => w.id === params.id);
        if (currentWorkflow) {
          setWorkflow(currentWorkflow);
        } else {
          // Create example workflow for demo
          const exampleWorkflow: Workflow = {
            id: params.id as string,
            name: "Email Summarizer Workflow",
            description: "Automatically summarize emails and send to Slack",
            nodes: [
              {
                id: "node-1",
                componentId: "email-trigger",
                x: 100,
                y: 100,
                config: { service: "Gmail" }
              },
              {
                id: "node-2",
                componentId: "text-summary",
                x: 400,
                y: 100,
                config: { service: "GPT-4", maxWords: 100 }
              },
              {
                id: "node-3",
                componentId: "slack-message",
                x: 700,
                y: 100,
                config: { channel: "#email-summaries" }
              }
            ],
            connections: [
              { from: "node-1", to: "node-2" },
              { from: "node-2", to: "node-3" }
            ]
          };
          setWorkflow(exampleWorkflow);
        }
      } catch {}
    }
  }, [params.id, router]);

  const handleDragStart = (e: React.DragEvent, component: WorkflowComponent) => {
    setIsDragging(true);
    setDragComponent(component);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragComponent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      componentId: dragComponent.id,
      x: x - 100, // Center the node
      y: y - 50,
      config: {}
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    setIsDragging(false);
    setDragComponent(null);
  };

  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    }));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  const handleSaveWorkflow = () => {
    const savedWorkflows = localStorage.getItem("saku_workflows");
    const workflows = savedWorkflows ? JSON.parse(savedWorkflows) : [];
    const updatedWorkflows = workflows.map((w: Workflow) =>
      w.id === workflow.id ? workflow : w
    );
    localStorage.setItem("saku_workflows", JSON.stringify(updatedWorkflows));
  };

  const handleExecute = () => {
    // Simulate workflow execution
    console.log("Executing workflow:", workflow);
    // Here you would typically send the workflow to a backend service
  };

  const handleDryRun = () => {
    // Simulate dry run
    console.log("Dry run workflow:", workflow);
    // Here you would typically test the workflow without actually executing it
  };

  const getComponentById = (id: string) => {
    return COMPONENTS.find(c => c.id === id);
  };

  const getComponentColor = (type: ComponentType) => {
    switch (type) {
      case "trigger": return "border-green-500";
      case "ai-processing": return "border-purple-500";
      case "output": return "border-blue-500";
      default: return "border-gray-500";
    }
  };

  const getConnectionColor = (fromNode: WorkflowNode, toNode: WorkflowNode) => {
    const fromComponent = getComponentById(fromNode.componentId);
    const toComponent = getComponentById(toNode.componentId);
    
    if (fromComponent?.type === "trigger" && toComponent?.type === "ai-processing") {
      return "#10b981"; // green
    } else if (fromComponent?.type === "ai-processing" && toComponent?.type === "output") {
      return "#8b5cf6"; // purple
    }
    return "#6b7280"; // gray
  };

  const groupedComponents = COMPONENTS.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, WorkflowComponent[]>);

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      {/* Left Sidebar - Chat */}
      <aside className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold">New Chat</h2>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
              <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
                <span className="text-xs">🤖</span>
              </div>
              <span>Ask your AI</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Beta</span>
            </div>

            <div className="bg-neutral-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-neutral-700 mb-2">
                "When an email comes, summarize it and send to Slack' → auto-generates blocks."
              </p>
              <p className="text-xs text-neutral-500">
                Creating a workflow based on your requirement....
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <div className="relative">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="e.g: When an email comes, summarize it and send to Slack' auto-generates blocks."
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="p-1 text-neutral-400 hover:text-neutral-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button className="p-1 text-neutral-400 hover:text-neutral-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button className="p-1 text-neutral-400 hover:text-neutral-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{workflow.name}</h1>
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-600">{workflow.description}</p>
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-1 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button onClick={handleZoomIn} className="p-1 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <span className="text-sm text-neutral-600">{zoom}%</span>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            backgroundImage: `
              radial-gradient(circle, #d1d5db 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {workflow.connections.map((connection, index) => {
              const fromNode = workflow.nodes.find(n => n.id === connection.from);
              const toNode = workflow.nodes.find(n => n.id === connection.to);
              
              if (!fromNode || !toNode) return null;

              const startX = fromNode.x + 200; // End of source node
              const startY = fromNode.y + 50; // Middle of source node
              const endX = toNode.x; // Start of target node
              const endY = toNode.y + 50; // Middle of target node

              const color = getConnectionColor(fromNode, toNode);

              return (
                <g key={index}>
                  <defs>
                    <marker
                      id={`arrowhead-${index}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={color}
                      />
                    </marker>
                  </defs>
                  <path
                    d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY} ${endX} ${endY}`}
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                    markerEnd={`url(#arrowhead-${index})`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Workflow Nodes */}
          {workflow.nodes.map((node) => {
            const component = getComponentById(node.componentId);
            if (!component) return null;

            return (
              <div
                key={node.id}
                className={`absolute bg-white border-2 ${getComponentColor(component.type)} rounded-lg p-3 min-w-[200px] cursor-move shadow-sm`}
                style={{
                  left: node.x,
                  top: node.y,
                  zIndex: 2
                }}
                draggable
                onDragStart={(e) => {
                  // Handle node dragging
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{component.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{component.name}</div>
                    <div className="text-xs text-neutral-500">{component.description}</div>
                  </div>
                </div>
                {node.config?.service && (
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>{node.config.service}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                {node.config?.maxWords && (
                  <div className="text-xs text-neutral-600 mt-1">
                    Max {node.config.maxWords} Words
                  </div>
                )}
                {node.config?.channel && (
                  <div className="text-xs text-neutral-600 mt-1">
                    {node.config.channel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="bg-white border-t p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-neutral-600">Last executed 5 mins ago</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDryRun}
              className="px-4 py-2 border border-neutral-300 rounded text-sm hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
              Dry Run
            </button>
            <button
              onClick={handleExecute}
              className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-black/90 transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Execute
            </button>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Components */}
      <aside className="w-80 bg-white border-l">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Components</h2>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search components..."
              className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(groupedComponents).map(([category, components]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">{category}</h3>
              <div className="space-y-2">
                {components.map((component) => (
                  <div
                    key={component.id}
                    className="p-3 border border-neutral-200 rounded cursor-move hover:border-neutral-300 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{component.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{component.name}</div>
                        <div className="text-xs text-neutral-500">{component.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
