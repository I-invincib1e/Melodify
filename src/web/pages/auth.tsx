import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, Loader as Loader2, CircleCheck as CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";
import { useToastStore } from "@/lib/toastStore";

interface LoginForm { email: string; password: string }
interface SignupForm { displayName: string; email: string; password: string; confirmPassword: string }

/* ─── Inline logo ─── */
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#1db954" />
      <path d="M8.5 28 L8.5 13 L13.5 13 L20 22.5 L26.5 13 L31.5 13 L31.5 28 L27.5 28 L27.5 19.5 L21.2 28.2 L18.8 28.2 L12.5 19.5 L12.5 28 Z" fill="#0a0a0a" />
      <rect x="16" y="30.5" width="3" height="2" rx="1" fill="#0a0a0a" />
      <rect x="21" y="30.5" width="3" height="2" rx="1" fill="#0a0a0a" />
    </svg>
  );
}

/* ─── Left brand panel ─── */
function BrandPanel() {
  const moods = ["Late Night Drives", "Morning Energy", "Focus Mode", "Party Vibes", "Chill Sundays"];
  return (
    <div className="hidden lg:flex flex-col justify-between auth-panel-left h-full px-14 py-14 relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#1db954]/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full bg-[#1db954]/[0.04] blur-[80px] pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <LogoMark size={36} />
        <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
          Melodify
        </span>
      </div>

      {/* Central copy */}
      <div className="relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1db954]/[0.09] border border-[#1db954]/[0.2] rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse inline-block" />
            <span className="text-[#1db954] text-[10px] font-bold uppercase tracking-[0.2em]">100M+ Songs</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-[1.1] tracking-tight" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
            Music that<br />moves with you.
          </h2>
          <p className="text-[#4a4a4a] text-[14px] leading-[1.7] mt-4 max-w-xs">
            Personalized streams, real-time lyrics, party rooms, offline mode — everything you need to make every moment feel like it has a soundtrack.
          </p>
        </div>

        {/* Mood pills */}
        <div className="flex flex-wrap gap-2">
          {moods.map((m, i) => (
            <span
              key={m}
              className="px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors"
              style={{
                background: i === 0 ? "rgba(29,185,84,0.1)" : "rgba(255,255,255,0.03)",
                borderColor: i === 0 ? "rgba(29,185,84,0.25)" : "rgba(255,255,255,0.06)",
                color: i === 0 ? "#1db954" : "#3a3a3a",
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom waveform */}
      <div className="flex items-end gap-[3px] h-12 relative z-10 opacity-20">
        {Array.from({ length: 28 }).map((_, i) => {
          const h = [20, 40, 60, 35, 55, 28, 48, 65, 38, 52, 25, 45, 58, 32, 50, 22, 42, 62, 30, 54, 26, 44, 60, 36, 50, 28, 46, 56][i];
          return (
            <div
              key={i}
              className="wave-bar bg-[#1db954]"
              style={{ height: `${h}%`, "--dur": `${0.6 + (i % 6) * 0.1}s`, animationDelay: `${(i % 8) * 0.08}s` } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Field component ─── */
function Field({
  label,
  error,
  children,
  right,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-[#555] uppercase tracking-[0.12em]">{label}</label>
        {right}
      </div>
      {children}
      {error && <p className="text-red-400 text-[12px] mt-1.5">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-[14px] text-white placeholder-[#3a3a3a] focus:outline-none focus:border-[#1db954]/50 focus:bg-white/[0.07] transition-all duration-200";

/* ─── Password reset view ─── */
function PasswordResetView({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToastStore();

  async function handleReset() {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-[#1db954]/12 border border-[#1db954]/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={26} className="text-[#1db954]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>Check your inbox</h2>
        <p className="text-[13px] text-[#555] mb-7 leading-relaxed">
          Reset link sent to <span className="text-white font-semibold">{email}</span>.
        </p>
        <button
          onClick={onBack}
          className="w-full h-12 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-xl text-[14px] transition-all"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[22px] font-bold text-white mb-1.5" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
        Reset password
      </h2>
      <p className="text-[13px] text-[#444] mb-7">Enter your email and we'll send a reset link.</p>
      <div className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
            onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }}
          />
        </Field>
        <button
          onClick={handleReset}
          disabled={loading || !email.trim()}
          className="w-full h-12 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold rounded-xl text-[14px] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : "Send Reset Link"}
        </button>
        <button onClick={onBack} className="w-full text-[#444] hover:text-white text-[13px] py-2 transition-colors">
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}

/* ─── Main auth page ─── */
export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
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
    setLocation(preferences?.setup_complete ? "/" : "/onboarding");
  }

  async function handleSignup(data: SignupForm) {
    if (!data.displayName.trim()) {
      signupForm.setError("displayName", { message: "Name is required" }); return;
    }
    if (data.password.length < 6) {
      signupForm.setError("password", { message: "At least 6 characters" }); return;
    }
    if (data.password !== data.confirmPassword) {
      signupForm.setError("confirmPassword", { message: "Passwords do not match" }); return;
    }
    setLoading(true); setError("");
    const { error: e } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.displayName } },
    });
    setLoading(false);
    if (e) { setError(e.message); return; }
    toast.success("Account created! Let's set up your taste.");
    setLocation("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex overflow-hidden">
      {/* Left panel — brand (desktop only) */}
      <div className="lg:w-[480px] lg:shrink-0">
        <BrandPanel />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-y-auto">
        {/* Subtle bg gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1db954]/[0.03] blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-[400px] py-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <LogoMark size={30} />
            <span className="text-[17px] font-bold text-white" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>Melodify</span>
          </div>

          {showReset ? (
            <PasswordResetView onBack={() => setShowReset(false)} />
          ) : mode === "login" ? (
            /* ── Sign In ── */
            <div>
              <h1 className="text-[26px] font-bold text-white mb-1" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
                Welcome back
              </h1>
              <p className="text-[13px] text-[#444] mb-8">Sign in to continue your music journey.</p>

              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <Field label="Email">
                  <input
                    {...loginForm.register("email", { required: true })}
                    type="email"
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Password"
                  right={
                    <button
                      type="button"
                      onClick={() => setShowReset(true)}
                      className="text-[11px] text-[#1db954] hover:underline"
                    >
                      Forgot password?
                    </button>
                  }
                >
                  <div className="relative">
                    <input
                      {...loginForm.register("password", { required: true })}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>

                {error && (
                  <p className="text-red-400 text-[13px] bg-red-400/[0.08] border border-red-400/[0.18] rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-xl text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <>Sign In <ArrowRight size={15} /></>}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] text-[#2e2e2e] font-medium">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <button
                  onClick={() => setLocation("/")}
                  className="w-full h-11 border border-white/[0.07] text-[#444] hover:text-white hover:border-white/[0.14] rounded-xl text-[13px] font-medium transition-all"
                >
                  Continue as Guest
                </button>
              </div>

              <p className="text-center text-[13px] text-[#3a3a3a] mt-7">
                No account yet?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-[#1db954] font-semibold hover:underline"
                >
                  Create one free
                </button>
              </p>
            </div>
          ) : (
            /* ── Sign Up ── */
            <div>
              <h1 className="text-[26px] font-bold text-white mb-1" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
                Create account
              </h1>
              <p className="text-[13px] text-[#444] mb-8">Free forever. No credit card required.</p>

              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <Field label="Display Name" error={signupForm.formState.errors.displayName?.message}>
                  <input
                    {...signupForm.register("displayName")}
                    type="text"
                    placeholder="Your name"
                    className={inputCls}
                  />
                </Field>

                <Field label="Email">
                  <input
                    {...signupForm.register("email", { required: true })}
                    type="email"
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </Field>

                <Field label="Password" error={signupForm.formState.errors.password?.message}>
                  <div className="relative">
                    <input
                      {...signupForm.register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password" error={signupForm.formState.errors.confirmPassword?.message}>
                  <input
                    {...signupForm.register("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    className={inputCls}
                  />
                </Field>

                {error && (
                  <p className="text-red-400 text-[13px] bg-red-400/[0.08] border border-red-400/[0.18] rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-xl text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <>Create Account <ArrowRight size={15} /></>}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] text-[#2e2e2e] font-medium">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <button
                  onClick={() => setLocation("/")}
                  className="w-full h-11 border border-white/[0.07] text-[#444] hover:text-white hover:border-white/[0.14] rounded-xl text-[13px] font-medium transition-all"
                >
                  Continue as Guest
                </button>
              </div>

              <p className="text-center text-[13px] text-[#3a3a3a] mt-7">
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-[#1db954] font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
