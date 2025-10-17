export default function Signup() {
  return (
    <main className="min-h-screen bg-[#f7f8f9] py-6 px-4">
      <div className="mx-auto w-full max-w-6xl bg-white rounded-2xl shadow-sm p-6 sm:p-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl bg-[#f7f8f9] border min-h-[260px] sm:min-h-[420px] flex flex-col">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight mb-3">Automate Your Tasks With Saku AI</h1>
            <p className="text-neutral-600">Automate your ideas in to reality fast & quick !</p>
          </div>
          <div className="flex-1 flex items-center justify-center text-neutral-400">Illustration</div>
        </div>
        <div className="rounded-xl bg-[#f7f8f9] border p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-center text-lg font-medium mb-6">Create Account</h2>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2 mb-4" placeholder="you@email.com" />
            <button className="w-full bg-black text-white rounded py-2">Continue</button>
            <div className="text-center text-xs mt-2">Already have an account? <a href="/login" className="underline">Login</a></div>
            <div className="relative my-4 text-center text-xs text-neutral-500">
              <span className="bg-[#f7f8f9] px-3">or</span>
              <div className="h-px bg-neutral-200 -z-10 -mt-3"></div>
            </div>
            <button className="w-full border rounded py-2">Sign in with Google</button>
          </div>
        </div>
      </div>
    </main>
  );
}


