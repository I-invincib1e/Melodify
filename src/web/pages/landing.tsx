import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Play, Headphones, Download, Users, Mic as Mic2, Search, Zap, ChevronRight, Star, ArrowRight, Radio } from "lucide-react";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-up");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Logo mark inline ─── */
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

/* ─── Waveform decoration ─── */
function Waveform({ bars = 36, className = "" }: { bars?: number; className?: string }) {
  const heights = useRef(
    Array.from({ length: bars }, () => Math.round(Math.random() * 70 + 15))
  ).current;
  const durs = useRef(
    Array.from({ length: bars }, () => (Math.random() * 0.6 + 0.5).toFixed(2))
  ).current;
  const delays = useRef(
    Array.from({ length: bars }, () => (Math.random() * 0.6).toFixed(2))
  ).current;
  return (
    <div className={`flex items-end gap-[3px] ${className}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="wave-bar bg-[#1db954]/50"
          style={{ height: `${h}px`, "--dur": `${durs[i]}s`, animationDelay: `${delays[i]}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─── Animated now-playing card ─── */
const SONGS = [
  { name: "Kesariya", artist: "Arijit Singh", grad: "from-rose-600 via-orange-500 to-amber-400" },
  { name: "Brown Munde", artist: "AP Dhillon", grad: "from-amber-500 via-yellow-400 to-lime-400" },
  { name: "Raataan Lambiyan", artist: "Jubin Nautiyal", grad: "from-sky-500 via-blue-500 to-violet-500" },
];

function NowPlayingCard() {
  const [progress, setProgress] = useState(38);
  const songIdx = Math.floor((progress / 100) * SONGS.length) % SONGS.length;
  const song = SONGS[songIdx];

  useEffect(() => {
    const iv = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.12)), 100);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="w-72 animate-card-float animate-border-glow bg-[#0f0f0f]/95 backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-5 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
      style={{ "--dur": "5s", "--card-rot": "-2deg" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-[3px] h-4 items-end">
          {[13, 18, 9, 16].map((h, i) => (
            <div key={i} className="eq-bar" style={{ "--eq-h": `${h}px`, animationDelay: `${i * 0.12}s` } as React.CSSProperties} />
          ))}
        </div>
        <span className="text-[10px] text-[#1db954] font-bold uppercase tracking-[0.18em] ml-1">Now Playing</span>
      </div>

      <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${song.grad} mb-4 relative overflow-hidden shadow-lg`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur border border-white/20 animate-vinyl flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      </div>

      <p className="text-white font-bold text-sm truncate leading-tight">{song.name}</p>
      <p className="text-[#777] text-xs mb-4 mt-0.5">{song.artist}</p>

      <div className="mb-3.5">
        <div className="w-full h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full bg-[#1db954] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-[#444] mt-1.5">
          <span>{Math.floor((progress / 100) * 3)}:{String(Math.floor(((progress / 100) * 180) % 60)).padStart(2, "0")}</span>
          <span>3:45</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {(["⏮", "⏸", "⏭"] as const).map((icon, i) => (
          <button
            key={i}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-sm ${
              i === 1
                ? "bg-[#1db954] text-black hover:bg-[#1ed760] hover:scale-105"
                : "text-[#666] hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {icon}
          </button>
        ))}
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#444] hover:text-red-400 hover:bg-white/[0.08] transition-all text-sm">
          ♥
        </button>
      </div>
    </div>
  );
}

/* ─── Genre ticker ─── */
const GENRES = [
  "Bollywood", "Punjabi", "Romantic", "Hip-Hop", "Electronic", "Classical",
  "Sufi", "Devotional", "Party", "Sad Songs", "Retro", "Pop", "Indie",
  "Jazz", "Rock", "Lofi", "Motivational", "Dance", "Meditation", "A.R. Rahman",
  "Arijit Singh", "Diljit Dosanjh", "AP Dhillon", "Shreya Ghoshal",
];

function GenreTicker() {
  const row1 = [...GENRES, ...GENRES];
  const row2 = [...GENRES.slice(12), ...GENRES.slice(0, 12), ...GENRES.slice(12), ...GENRES.slice(0, 12)];
  return (
    <section className="py-10 overflow-hidden border-y border-white/[0.04]">
      <div className="marquee-container mb-2.5">
        <div className="animate-ticker flex gap-2.5" style={{ animationDuration: "32s" }}>
          {row1.map((g, i) => (
            <span key={i} className="shrink-0 px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-[13px] font-medium text-[#999] hover:bg-[#1db954]/10 hover:border-[#1db954]/25 hover:text-[#1db954] transition-all cursor-default">
              {g}
            </span>
          ))}
        </div>
      </div>
      <div className="marquee-container">
        <div className="animate-ticker flex gap-2.5" style={{ animationDuration: "44s", animationDirection: "reverse" }}>
          {row2.map((g, i) => (
            <span key={i} className="shrink-0 px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-[13px] font-medium text-[#666] hover:bg-[#1db954]/8 hover:border-[#1db954]/18 hover:text-[#1db954] transition-all cursor-default">
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const FEATURES = [
  {
    icon: Zap,
    title: "Personalized For You",
    desc: "AI-driven recommendations that learn your taste and get sharper every session.",
    accent: "#1db954",
    visual: (
      <div className="flex items-end gap-1 h-12">
        {[30, 50, 40, 60, 45, 55, 35, 48].map((h, i) => (
          <div key={i} className="w-[6px] rounded-sm bg-gradient-to-t from-[#1db954] to-[#4ade80]" style={{ height: `${h}%`, opacity: 0.6 + i * 0.05 }} />
        ))}
      </div>
    ),
  },
  {
    icon: Users,
    title: "Listen Together",
    desc: "Real-time party rooms — sync music with friends no matter where they are.",
    accent: "#f59e0b",
    visual: (
      <div className="flex -space-x-2">
        {["from-rose-400 to-pink-600", "from-amber-400 to-orange-500", "from-sky-400 to-blue-600", "from-emerald-400 to-teal-600"].map((g, i) => (
          <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-[#0c0c0c] flex items-center justify-center text-[10px] font-bold text-white`}>
            {["P", "R", "A", "K"][i]}
          </div>
        ))}
        <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-[#0c0c0c] flex items-center justify-center text-[9px] text-white">+4</div>
      </div>
    ),
  },
  {
    icon: Download,
    title: "Offline Mode",
    desc: "Download any track or playlist. Enjoy uninterrupted music without Wi-Fi.",
    accent: "#60a5fa",
    visual: (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#60a5fa]/15 border border-[#60a5fa]/25 flex items-center justify-center">
          <Download size={14} className="text-[#60a5fa]" />
        </div>
        <div className="flex-1 space-y-1.5">
          {[80, 60, 90].map((w, i) => (
            <div key={i} className="h-[3px] rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#60a5fa]/60" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Mic2,
    title: "Karaoke & Lyrics",
    desc: "Lyrics synced word-by-word in real time. Sing along, every song, every time.",
    accent: "#f472b6",
    visual: (
      <div className="space-y-1.5">
        {["♪ Tum ho toh", "lagta hai", "jahan mera..."].map((line, i) => (
          <p key={i} className={`text-[11px] leading-tight ${i === 0 ? "text-[#f472b6] font-semibold" : "text-[#444]"}`}>{line}</p>
        ))}
      </div>
    ),
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "Find by song, artist, album, or lyric fragment. Results in under a second.",
    accent: "#a78bfa",
    visual: (
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2">
        <Search size={13} className="text-[#555] shrink-0" />
        <span className="text-[12px] text-[#555]">Tum hi ho...</span>
        <div className="ml-auto w-1 h-4 bg-[#a78bfa] animate-pulse rounded-full" />
      </div>
    ),
  },
  {
    icon: Headphones,
    title: "HD Audio",
    desc: "Studio-grade audio quality. Hear every layer as the artist intended.",
    accent: "#fb923c",
    visual: (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#fb923c]/15 border border-[#fb923c]/25 flex items-center justify-center">
          <Headphones size={14} className="text-[#fb923c]" />
        </div>
        <div className="text-[10px] text-[#fb923c] font-bold tracking-widest">320 kbps</div>
      </div>
    ),
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-28 max-w-7xl mx-auto px-6">
      <div className="reveal-up mb-16">
        <p className="text-[#1db954] text-[11px] font-bold uppercase tracking-[0.22em] mb-4">Features</p>
        <h2 className="text-4xl md:text-[52px] font-bold text-white leading-[1.08] tracking-tight">
          Built for how<br />you actually listen.
        </h2>
      </div>

      {/* Alternating feature rows for desktop */}
      <div className="hidden lg:flex flex-col gap-4">
        {/* Row 1: large card + 2 smaller */}
        <div className="grid grid-cols-12 gap-4">
          <FeatureCard f={FEATURES[0]} className="col-span-5 row-span-1" large />
          <FeatureCard f={FEATURES[1]} className="col-span-4 row-span-1" />
          <FeatureCard f={FEATURES[2]} className="col-span-3 row-span-1" />
        </div>
        {/* Row 2: 3 smaller + large */}
        <div className="grid grid-cols-12 gap-4">
          <FeatureCard f={FEATURES[3]} className="col-span-3" />
          <FeatureCard f={FEATURES[4]} className="col-span-4" />
          <FeatureCard f={FEATURES[5]} className="col-span-5" large />
        </div>
      </div>

      {/* Mobile grid */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
        {FEATURES.map((f, i) => <FeatureCard key={i} f={f} />)}
      </div>
    </section>
  );
}

function FeatureCard({
  f,
  className = "",
  large = false,
}: {
  f: (typeof FEATURES)[0];
  className?: string;
  large?: boolean;
}) {
  return (
    <div
      className={`reveal-up group bg-[#0d0d0d] hover:bg-[#111] border border-white/[0.06] hover:border-white/[0.1] rounded-xl p-7 transition-all duration-300 relative overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(350px circle at 30% 60%, ${f.accent}07 0%, transparent 70%)` }}
      />
      <div className="flex flex-col gap-5 h-full">
        <div className="flex items-start justify-between">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shrink-0"
            style={{ background: `${f.accent}14`, border: `1px solid ${f.accent}22` }}
          >
            <f.icon size={20} style={{ color: f.accent }} />
          </div>
          {large && (
            <div className="opacity-60 group-hover:opacity-100 transition-opacity">
              {f.visual}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-white mb-1.5 leading-snug">{f.title}</h3>
          <p className="text-[13px] text-[#5a5a5a] leading-relaxed">{f.desc}</p>
        </div>
        {!large && (
          <div className="mt-auto opacity-50 group-hover:opacity-80 transition-opacity">
            {f.visual}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Create your account", desc: "Sign up free in under 30 seconds. No credit card required." },
    { n: "02", title: "Set your taste", desc: "Pick genres and artists you love. Your feed personalizes instantly." },
    { n: "03", title: "Start listening", desc: "Your home screen is ready. Stream, download, and share freely." },
  ];
  return (
    <section id="how" className="py-28 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="reveal-up mb-20">
          <p className="text-[#1db954] text-[11px] font-bold uppercase tracking-[0.22em] mb-4">Process</p>
          <h2 className="text-4xl md:text-[52px] font-bold text-white tracking-tight leading-[1.08]">
            Up and running<br />in minutes.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-7 left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          {steps.map((s, i) => (
            <div key={i} className="reveal-up" style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="w-14 h-14 rounded-2xl bg-[#1db954]/[0.08] border border-[#1db954]/[0.18] flex items-center justify-center mb-6">
                <span className="text-[#1db954] font-bold text-lg">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2.5">{s.title}</h3>
              <p className="text-[13px] text-[#555] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
function StatsSection() {
  const stats = [
    { value: "100M+", label: "Songs in Library", mono: true },
    { value: "50M+", label: "Active Listeners", mono: true },
    { value: "150+", label: "Countries", mono: true },
  ];
  return (
    <section className="py-16 border-y border-white/[0.04] bg-[#0c0c0c]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
          {stats.map((s, i) => (
            <div key={i} className="reveal-up flex flex-col items-center py-10 md:py-8" style={{ transitionDelay: `${i * 110}ms` }}>
              <div className="font-mono text-[60px] md:text-[72px] font-bold text-white leading-none mb-2 tracking-tight">
                {s.value}
              </div>
              <p className="text-[11px] text-[#444] font-medium uppercase tracking-[0.2em]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { name: "Priya M.", handle: "@priyabeats", text: "The Listen Along feature changed how I enjoy music with my college friends. We're always in sync now!", rating: 5, grad: "from-rose-400 to-pink-600" },
  { name: "Rajan K.", handle: "@rajansounds", text: "The recommendations are scarily accurate. It figured out my taste in like two days — it's wild.", rating: 5, grad: "from-amber-400 to-orange-600" },
  { name: "Ananya S.", handle: "@ananya_indie", text: "Karaoke mode + lyrics sync is incredible. I use it every single day without fail.", rating: 5, grad: "from-sky-400 to-blue-600" },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-28 max-w-7xl mx-auto px-6">
      <div className="reveal-up mb-16">
        <p className="text-[#1db954] text-[11px] font-bold uppercase tracking-[0.22em] mb-4">Testimonials</p>
        <h2 className="text-4xl md:text-[52px] font-bold text-white tracking-tight">People who listen.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="reveal-up bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.1] transition-all duration-300"
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={13} fill="#f59e0b" className="text-amber-400" />
              ))}
            </div>
            <p className="text-[#aaa] text-[14px] leading-[1.7] mb-5">"{t.text}"</p>
            <div className="flex items-center gap-2.5 pt-4 border-t border-white/[0.05]">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                {t.name[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{t.name}</p>
                <p className="text-[#444] text-[11px]">{t.handle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const [, setLocation] = useLocation();
  return (
    <section className="py-28 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[280px] bg-[#1db954]/[0.06] blur-[90px] rounded-full" />
        </div>

        <div className="reveal-up flex justify-center mb-8">
          <div className="flex items-end gap-[3px] h-10">
            {[28, 42, 52, 38, 56, 44, 34, 50, 40, 54, 38, 46, 32, 50, 42, 52, 36, 44, 30, 48].map((h, i) => (
              <div
                key={i}
                className="wave-bar bg-[#1db954]"
                style={{ height: `${h}%`, "--dur": `${0.55 + (i % 5) * 0.08}s`, animationDelay: `${(i % 8) * 0.06}s` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        <div className="reveal-up">
          <p className="text-[#1db954] text-[11px] font-bold uppercase tracking-[0.25em] mb-5">Free Forever</p>
          <h2 className="text-5xl md:text-7xl font-bold text-white leading-[1.0] tracking-tight mb-5">
            Start listening<br />right now.
          </h2>
          <p className="text-[#555] text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            No subscription. No credit card.<br />Just you and the music.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <button
              onClick={() => setLocation("/auth")}
              className="group px-9 py-4 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(29,185,84,0.3)] flex items-center gap-2 justify-center"
            >
              Create Free Account
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setLocation("/")}
              className="px-9 py-4 border border-white/[0.12] text-white font-semibold rounded-full text-[15px] hover:bg-white/[0.05] transition-all flex items-center gap-2 justify-center"
            >
              <Play size={14} fill="white" />
              Explore as Guest
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Navbar ─── */
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const el = document.querySelector(".landing-body");
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 48);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0a0a]/96 backdrop-blur-xl border-b border-white/[0.05]" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          className="flex items-center gap-2.5"
          onClick={() => setLocation("/landing")}
        >
          <LogoMark size={32} />
          <span className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>
            Melodify
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {[["Features", "#features"], ["Process", "#how"], ["Reviews", "#testimonials"]].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[13px] font-medium text-[#666] hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/auth")}
            className="hidden md:block text-[13px] font-medium text-[#666] hover:text-white transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={() => setLocation("/")}
            className="px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black text-[13px] font-bold rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Launch App
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#1db954]/[0.06] blur-[130px]" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-[#1db954]/[0.04] blur-[110px]" />
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] h-40 opacity-[0.07] pointer-events-none">
          <Waveform bars={90} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#1db954]/[0.09] border border-[#1db954]/[0.22] rounded-full px-3.5 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse inline-block" />
            <span className="text-[#1db954] text-[11px] font-bold uppercase tracking-[0.2em]">Now Streaming</span>
          </div>

          <h1
            className="text-[52px] md:text-[68px] lg:text-[76px] font-bold text-white leading-[0.97] tracking-[-0.02em] mb-6"
            style={{ fontFamily: "Syne, system-ui, sans-serif" }}
          >
            Every sound.{" "}
            <span className="bg-gradient-to-r from-[#1db954] via-[#4ade80] to-[#1db954] bg-clip-text text-transparent animate-gradient">
              Every mood.
            </span>
          </h1>

          <p className="text-[17px] text-[#666] leading-[1.7] mb-10 max-w-md">
            Melodify puts 100 million tracks in your pocket — discovered, streamed, and shared around your personal taste.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <button
              onClick={() => setLocation("/auth")}
              className="group flex items-center gap-2 px-7 py-3.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(29,185,84,0.35)] active:scale-[0.98]"
            >
              Get Started Free
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 px-7 py-3.5 border border-white/[0.12] text-white font-semibold rounded-full text-[15px] hover:bg-white/[0.05] transition-all active:scale-[0.98]"
            >
              <Play size={14} fill="white" />
              Launch App
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex -space-x-2.5">
              {["from-rose-400 to-pink-600", "from-amber-400 to-orange-600", "from-sky-400 to-blue-600", "from-emerald-400 to-teal-600"].map((g, i) => (
                <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} border-2 border-[#0a0a0a] flex items-center justify-center text-[11px] font-bold text-white`}>
                  {["P", "R", "A", "K"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="#f59e0b" className="text-amber-400" />)}
              </div>
              <p className="text-[12px] text-[#444]">Loved by <span className="text-white font-semibold">50M+</span> listeners</p>
            </div>
          </div>
        </div>

        {/* Right: floating cards */}
        <div className="flex justify-center lg:justify-end relative">
          <div className="relative">
            {/* Ripple rings */}
            <div className="absolute -inset-10 pointer-events-none">
              <div className="absolute inset-0 animate-ripple rounded-full border border-[#1db954]/[0.15]" />
              <div className="absolute inset-4 animate-ripple rounded-full border border-[#1db954]/[0.1]" style={{ animationDelay: "0.7s" }} />
              <div className="absolute inset-8 animate-ripple rounded-full border border-[#1db954]/[0.07]" style={{ animationDelay: "1.4s" }} />
            </div>

            <NowPlayingCard />

            {/* Trending card */}
            <div
              className="absolute -top-12 -right-10 w-44 animate-card-float bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl p-3 shadow-xl"
              style={{ "--dur": "3.5s", "--card-rot": "4deg", animationDelay: "0.5s" } as React.CSSProperties}
            >
              <p className="text-[10px] text-[#444] mb-2 uppercase tracking-wider font-medium">Trending</p>
              {["Kesariya", "Brown Munde", "Calm Down"].map((s, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="text-[10px] text-[#333] w-3 font-mono">{i + 1}</span>
                  <div className={`w-5 h-5 rounded shrink-0 bg-gradient-to-br ${["from-rose-500 to-orange-400", "from-amber-500 to-yellow-400", "from-sky-500 to-blue-600"][i]}`} />
                  <span className="text-[11px] text-[#bbb] font-medium truncate">{s}</span>
                </div>
              ))}
            </div>

            {/* Party card */}
            <div
              className="absolute -bottom-8 -left-12 w-40 animate-card-float bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl p-3 shadow-xl"
              style={{ "--dur": "4.2s", "--card-rot": "-3deg", animationDelay: "1s" } as React.CSSProperties}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse" />
                <span className="text-[10px] text-[#1db954] font-bold tracking-wider">LIVE PARTY</span>
              </div>
              <p className="text-[11px] text-white font-semibold mb-0.5">Suraj's Room</p>
              <p className="text-[10px] text-[#444] mb-2">Punjabi Vibes · 8 listeners</p>
              <div className="flex -space-x-1.5">
                {["from-pink-400 to-rose-600", "from-yellow-400 to-orange-500", "from-teal-400 to-cyan-600"].map((g, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full bg-gradient-to-br ${g} border border-[#0f0f0f]`} />
                ))}
                <div className="w-5 h-5 rounded-full bg-white/10 border border-[#0f0f0f] flex items-center justify-center text-[8px] text-white">+5</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const [, setLocation] = useLocation();
  return (
    <footer className="border-t border-white/[0.05] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <LogoMark size={28} />
              <span className="text-[15px] font-bold text-white" style={{ fontFamily: "Syne, system-ui, sans-serif" }}>Melodify</span>
            </div>
            <p className="text-[12px] text-[#333] max-w-[200px] leading-relaxed">Music for every moment, every mood.</p>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            {["Privacy", "Terms", "About", "Contact"].map((link) => (
              <a key={link} href="#" className="text-[12px] text-[#3a3a3a] hover:text-[#888] transition-colors font-medium">
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Radio size={13} className="text-[#1db954]" />
            <p className="text-[11px] text-[#2e2e2e]">Made for music lovers</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#282828]">© 2026 Melodify. A college mini-project for educational purposes.</p>
          <button onClick={() => setLocation("/")} className="text-[11px] text-[#1db954]/70 hover:text-[#1db954] transition-colors">
            Launch App →
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="landing-body bg-[#0a0a0a] text-white" style={{ height: "100vh", overflowY: "auto", overflowX: "hidden" }}>
      <NavBar />
      <HeroSection />
      <GenreTicker />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
