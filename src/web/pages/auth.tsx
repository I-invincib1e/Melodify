import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Music2, Eye, EyeOff, ArrowRight, Loader as Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LoginForm { email: string; password: string }
interface SignupForm { displayName: string; email: string; password: string; confirmPassword: string }

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });
  const signupForm = useForm<SignupForm>({ defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" } });

  async function handleLogin(data: LoginForm) {
    setLoading(true); setError("");
    const { error: e } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    setLoading(false);
    if (e) { setError(e.message); return; }
    setLocation("/");
  }

  async function handleSignup(data: SignupForm) {
    if (data.password !== data.confirmPassword) {
      signupForm.setError("confirmPassword", { message: "Passwords do not match" }); return;
    }
    setLoading(true); setError("");
    const { error: e } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { display_name: data.displayName } },
    });
    setLoading(false);
    if (e) { setError(e.message); return; }
    setLocation("/onboarding");
  }

  const inputClass = "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#1db954]/60 focus:bg-white/[0.08] transition-all";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#1db954]/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1db954]/4 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-full bg-[#1db954] flex items-center justify-center">
            <Music2 size={18} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Melodify</span>
        </div>

        <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
          <div className="flex mb-8 bg-white/[0.05] rounded-xl p-1">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === m ? "bg-white text-black shadow" : "text-[#a7a7a7] hover:text-white"}`}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <h1 className="text-xl font-bold text-white mb-6">Welcome back</h1>
              <div>
                <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider block mb-1.5">Email</label>
                <input {...loginForm.register("email")} type="email" placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <input {...loginForm.register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`${inputClass} pr-11`} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-[#ff4d4d] text-sm bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 rounded-lg px-4 py-3">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
              </button>
              <button type="button" onClick={() => setLocation("/")} className="w-full text-[#a7a7a7] hover:text-white text-sm py-2 transition-colors">Continue as Guest</button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <h1 className="text-xl font-bold text-white mb-6">Create your account</h1>
              <div>
                <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider block mb-1.5">Display Name</label>
                <input {...signupForm.register("displayName")} type="text" placeholder="Your name" className={inputClass} />
                {signupForm.formState.errors.displayName && <p className="text-[#ff4d4d] text-xs mt-1">{signupForm.formState.errors.displayName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider block mb-1.5">Email</label>
                <input {...signupForm.register("email")} type="email" placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <input {...signupForm.register("password")} type={showPassword ? "text" : "password"} placeholder="At least 6 characters" className={`${inputClass} pr-11`} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider block mb-1.5">Confirm Password</label>
                <input {...signupForm.register("confirmPassword")} type={showPassword ? "text" : "password"} placeholder="Repeat password" className={inputClass} />
                {signupForm.formState.errors.confirmPassword && <p className="text-[#ff4d4d] text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
              </div>
              {error && <p className="text-[#ff4d4d] text-sm bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 rounded-lg px-4 py-3">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
              </button>
              <button type="button" onClick={() => setLocation("/")} className="w-full text-[#a7a7a7] hover:text-white text-sm py-2 transition-colors">Continue as Guest</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
