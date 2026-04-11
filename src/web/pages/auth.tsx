import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Music2, Eye, EyeOff, ArrowRight, Loader as Loader2, CircleCheck as CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";
import { useToastStore } from "@/lib/toastStore";

interface LoginForm { email: string; password: string }
interface SignupForm { displayName: string; email: string; password: string; confirmPassword: string }

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [, setLocation] = useLocation();
  const { fetchProfile, fetchPreferences } = useAuthStore();
  const toast = useToastStore();

  const loginForm = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });
  const signupForm = useForm<SignupForm>({ defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" } });

  async function handleLogin(data: LoginForm) {
    setLoading(true); setError("");
    const { error: e } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (e) { setError(e.message); setLoading(false); return; }
    await Promise.all([fetchProfile(), fetchPreferences()]);
    const { preferences } = useAuthStore.getState();
    setLoading(false);
    toast.success("Welcome back!");
    if (!preferences?.setup_complete) {
      setLocation("/onboarding");
    } else {
      setLocation("/");
    }
  }

  async function handleSignup(data: SignupForm) {
    if (!data.displayName.trim()) {
      signupForm.setError("displayName", { message: "Name is required" }); return;
    }
    if (data.password.length < 6) {
      signupForm.setError("password", { message: "Password must be at least 6 characters" }); return;
    }
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
    toast.success("Account created! Let's set up your taste.");
    setLocation("/onboarding");
  }

  async function handlePasswordReset() {
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    const { error: e } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
    setResetLoading(false);
    if (e) { toast.error(e.message); return; }
    setResetSent(true);
  }

  const inputClass = "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#1db954]/60 focus:bg-white/[0.08] transition-all";

  if (showReset) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#1db954]/5 blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-full bg-[#1db954] flex items-center justify-center">
              <Music2 size={18} className="text-black" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Melodify</span>
          </div>
          <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#1db954]/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-[#1db954]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-sm text-[#a7a7a7] mb-6">
                  We've sent a reset link to <strong className="text-white">{resetEmail}</strong>.
                </p>
                <button onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }}
                  className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold py-3 rounded-lg transition-all">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-2">Reset your password</h2>
                <p className="text-sm text-[#a7a7a7] mb-6">Enter your email and we'll send a reset link.</p>
                <div className="space-y-4">
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com" className={inputClass}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePasswordReset(); }} />
                  <button onClick={handlePasswordReset} disabled={resetLoading || !resetEmail.trim()}
                    className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2">
                    {resetLoading ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
                  </button>
                  <button onClick={() => setShowReset(false)} className="w-full text-[#a7a7a7] hover:text-white text-sm py-2 transition-colors">
                    Back to Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
                <input {...loginForm.register("email", { required: true })} type="email" placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => setShowReset(true)} className="text-xs text-[#1db954] hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <input {...loginForm.register("password", { required: true })} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`${inputClass} pr-11`} />
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
                <input {...signupForm.register("email", { required: true })} type="email" placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <input {...signupForm.register("password")} type={showPassword ? "text" : "password"} placeholder="At least 6 characters" className={`${inputClass} pr-11`} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && <p className="text-[#ff4d4d] text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
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
