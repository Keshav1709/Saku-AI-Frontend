import { MainSidebar } from "@/components/MainSidebar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <div className="flex">
        <MainSidebar />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-2xl border p-6">
            <h1 className="text-xl font-semibold mb-2 text-black">Chat With AI</h1>
            <p className="text-neutral-800 mb-6">Break down lengthy texts into concise summaries to grasp.</p>
            <div className="rounded-xl border p-12 text-center">
              <div className="text-3xl mb-2 text-black font-semibold">Welcome Saku AI</div>
              <p className="text-neutral-800 mb-6">Get Started By Script A Task And Chat Can Do The Rest.. Not Sure Where To Start?</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "Write Copy",
                  "Image Generation",
                  "Research",
                  "Generate Article",
                  "Data Analytics",
                  "Generate Code",
                ].map((b) => (
                  <button key={b} className="px-4 py-2 rounded border hover:bg-black/5 text-black font-medium">
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


