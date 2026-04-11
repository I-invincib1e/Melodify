import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Music2, Play, Headphones, Radio, Download, Users, Mic2, Search, Zap, ChevronRight, Star } from "lucide-react";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-up");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function Waveform({ bars = 36, className = "" }: { bars?: number; className?: string }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.random() * 0.7 + 0.3;
        const dur = (Math.random() * 0.6 + 0.5).toFixed(2);
        const delay = (Math.random() * 0.6).toFixed(2);
        return (
          <div
            key={i}
            className="wave-bar bg-[#1db954]/60"
            style={{
              height: `${Math.round(h * 48)}px`,
              "--dur": `${dur}s`,
              animationDelay: `${delay}s`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

function NowPlayingCard() {
  const [progress, setProgress] = useState(38);

  useEffect(() => {
    const iv = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.15)), 100);
    return () => clearInterval(iv);
  }, []);

  const albums = [
    { name: "Kesariya", artist: "Arijit Singh", grad: "from-rose-600 via-orange-500 to-amber-400" },
    { name: "Brown Munde", artist: "AP Dhillon", grad: "from-amber-500 via-yellow-400 to-lime-400" },
    { name: "Raataan Lambiyan", artist: "Jubin Nautiyal", grad: "from-sky-500 via-blue-500 to-violet-500" },
  ];
  const song = albums[Math.floor((progress / 100) * albums.length) % albums.length];

  return (
    <div
      className="w-[300px] animate-card-float animate-border-glow bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl"
      style={{ "--dur": "5s", "--card-rot": "-2deg" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1 h-5 items-end">
          {[14, 20, 10, 18, 12].map((h, i) => (
            <div key={i} className="eq-bar" style={{ "--eq-h": `${h}px`, animationDelay: `${i * 0.12}s` } as React.CSSProperties} />
          ))}
        </div>
        <span className="text-[11px] text-[#1db954] font-semibold uppercase tracking-widest ml-1">Now Playing</span>
      </div>

      <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${song.grad} mb-4 relative overflow-hidden shadow-xl`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full bg-black/40 backdrop-blur border border-white/20 animate-vinyl flex items-center justify-center"
          >
            <div className="w-3 h-3 rounded-full bg-white/60" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <p className="text-white font-bold text-base truncate">{song.name}</p>
      <p className="text-[#a7a7a7] text-sm mb-4">{song.artist}</p>

      <div className="mb-3">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#1db954] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-[#555] mt-1">
          <span>{Math.floor((progress / 100) * 3)}:{String(Math.floor(((progress / 100) * 180) % 60)).padStart(2, "0")}</span>
          <span>3:45</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {["⏮", "⏸", "⏭"].map((icon, i) => (
          <button key={i}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${i === 1 ? "bg-[#1db954] text-black hover:bg-[#1ed760] text-base" : "text-[#a7a7a7] hover:text-white hover:bg-white/10 text-sm"}`}>
            {icon}
          </button>
        ))}
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#a7a7a7] hover:text-white hover:bg-white/10 transition-all text-sm">❤</button>
      </div>
    </div>
  );
}

const GENRES = [
  "Bollywood", "Punjabi", "Romantic", "Hip-Hop", "Electronic", "Classical",
  "Sufi", "Devotional", "Party", "Sad Songs", "Retro", "Pop", "Indie",
  "Jazz", "Rock", "Lofi", "Motivational", "Dance", "Meditation", "A.R. Rahman",
  "Arijit Singh", "Diljit Dosanjh", "AP Dhillon", "Shreya Ghoshal",
];

const FEATURES = [
  { icon: Zap, title: "Personalized For You", desc: "AI-driven recommendations that learn from your listening habits and grow smarter every session.", accent: "#1db954" },
  { icon: Users, title: "Listen Together", desc: "Real-time party rooms to sync music with friends across the world. One beat, many hearts.", accent: "#f59e0b" },
  { icon: Download, title: "Offline Mode", desc: "Download any track, album or playlist and enjoy uninterrupted music without Wi-Fi.", accent: "#3b82f6" },
  { icon: Mic2, title: "Karaoke & Lyrics", desc: "Full song lyrics synced in real time. Sing along, word by word, beat by beat.", accent: "#ec4899" },
  { icon: Search, title: "Instant Search", desc: "Search by song, artist, album, or even a lyric fragment. Results in under a second.", accent: "#a78bfa" },
  { icon: Headphones, title: "HD Audio", desc: "Crisp, studio-grade audio quality. Hear every layer of the music as the artist intended.", accent: "#f97316" },
];

const TESTIMONIALS = [
  { name: "Priya M.", handle: "@priyabeats", text: "The Listen Along feature changed how I enjoy music with my college friends. We're always in sync now!", rating: 5 },
  { name: "Rajan K.", handle: "@rajansounds", text: "The recommendations are scarily accurate. It figured out my taste in like two days.", rating: 5 },
  { name: "Ananya S.", handle: "@ananya_indie", text: "Karaoke mode + lyrics sync is incredible. I use it every single day without fail.", rating: 5 },
];

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const el = document.querySelector(".landing-body");
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 40);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.06]" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setLocation("/landing")}>
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center">
            <Music2 size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Melodify</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[["Features", "#features"], ["How it Works", "#how"], ["Testimonials", "#testimonials"]].map(([label, href]) => (
            <a key={label} href={href}
              className="text-sm font-medium text-[#a7a7a7] hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/auth")}
            className="hidden md:block text-sm font-medium text-[#a7a7a7] hover:text-white transition-colors px-3 py-1.5">
            Sign In
          </button>
          <button onClick={() => setLocation("/")}
            className="px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black text-sm font-bold rounded-full transition-all hover:scale-105">
            Launch App
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-[#1db954]/8 blur-[140px] animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#1db954]/5 blur-[120px] animate-blob" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#1db954]/3 blur-[100px]" />

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] h-48 opacity-10">
          <Waveform bars={80} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#1db954]/10 border border-[#1db954]/25 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
            <span className="text-[#1db954] text-xs font-semibold uppercase tracking-widest">Now Streaming</span>
          </div>

          <h1 className="text-[56px] md:text-[72px] lg:text-[80px] font-black text-white leading-[1.0] tracking-tight mb-6">
            Every sound.{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#1db954] via-[#4ade80] to-[#1db954] bg-clip-text text-transparent animate-gradient">
                Every mood.
              </span>
            </span>
          </h1>

          <p className="text-lg text-[#888] leading-relaxed mb-10 max-w-lg">
            Melodify is where 100 million tracks meet your personal taste. Discover, stream, and share music that moves you — anywhere, anytime.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <button onClick={() => setLocation("/auth")}
              className="group flex items-center gap-2 px-7 py-4 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full text-base transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(29,185,84,0.4)]">
              Get Started Free
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setLocation("/")}
              className="flex items-center gap-2 px-7 py-4 border border-white/15 text-white font-semibold rounded-full text-base hover:bg-white/[0.06] transition-all">
              <Play size={16} fill="white" />
              Launch App
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {["from-rose-400 to-pink-600", "from-amber-400 to-orange-600", "from-sky-400 to-blue-600", "from-emerald-400 to-teal-600"].map((g, i) => (
                <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} border-2 border-[#080808] flex items-center justify-center text-xs font-bold text-white`}>
                  {["P", "R", "A", "K"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="#f59e0b" className="text-amber-400" />)}
              </div>
              <p className="text-xs text-[#666]">Loved by <span className="text-white font-semibold">50M+</span> listeners</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end relative">
          <div className="relative">
            <div className="absolute -inset-12 pointer-events-none">
              <div className="absolute inset-0 animate-ripple rounded-full border border-[#1db954]/20" />
              <div className="absolute inset-4 animate-ripple rounded-full border border-[#1db954]/15" style={{ animationDelay: "0.7s" }} />
              <div className="absolute inset-8 animate-ripple rounded-full border border-[#1db954]/10" style={{ animationDelay: "1.4s" }} />
            </div>

            <NowPlayingCard />

            <div
              className="absolute -top-14 -right-12 w-[180px] animate-card-float bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl"
              style={{ "--dur": "3.5s", "--card-rot": "4deg", animationDelay: "0.5s" } as React.CSSProperties}
            >
              <p className="text-[11px] text-[#555] mb-2 uppercase tracking-wider">Trending Now</p>
              {["Kesariya", "Brown Munde", "Calm Down"].map((s, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="text-[10px] text-[#333] w-3">{i + 1}</span>
                  <div className={`w-5 h-5 rounded shrink-0 bg-gradient-to-br ${["from-rose-500 to-orange-400", "from-amber-500 to-yellow-400", "from-sky-500 to-blue-600"][i]}`} />
                  <span className="text-[11px] text-[#ccc] font-medium truncate">{s}</span>
                </div>
              ))}
            </div>

            <div
              className="absolute -bottom-10 -left-14 w-[160px] animate-card-float bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl"
              style={{ "--dur": "4.2s", "--card-rot": "-3deg", animationDelay: "1s" } as React.CSSProperties}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
                <span className="text-[10px] text-[#1db954] font-semibold">LIVE PARTY</span>
              </div>
              <p className="text-xs text-white font-semibold mb-1">Suraj's Room</p>
              <p className="text-[10px] text-[#666] mb-2">Punjabi Vibes · 8 listeners</p>
              <div className="flex -space-x-2">
                {["from-pink-400 to-rose-600", "from-yellow-400 to-orange-500", "from-teal-400 to-cyan-600"].map((g, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border border-[#111]`} />
                ))}
                <div className="w-6 h-6 rounded-full bg-white/10 border border-[#111] flex items-center justify-center text-[9px] text-white">+5</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GenreMarquee() {
  const row1 = [...GENRES, ...GENRES];
  const row2 = [...GENRES.slice(12), ...GENRES.slice(0, 12), ...GENRES.slice(12), ...GENRES.slice(0, 12)];
  return (
    <section className="py-12 overflow-hidden border-y border-white/[0.04]">
      <div className="marquee-container mb-3">
        <div className="animate-ticker flex gap-3" style={{ animationDuration: "30s" }}>
          {row1.map((g, i) => (
            <span key={i} className="shrink-0 px-4 py-2 bg-white/[0.05] border border-white/[0.07] rounded-full text-sm font-medium text-[#ccc] hover:bg-[#1db954]/10 hover:border-[#1db954]/25 hover:text-[#1db954] transition-all cursor-default">
              {g}
            </span>
          ))}
        </div>
      </div>
      <div className="marquee-container">
        <div className="animate-ticker flex gap-3" style={{ animationDuration: "40s", animationDirection: "reverse" }}>
          {row2.map((g, i) => (
            <span key={i} className="shrink-0 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-full text-sm font-medium text-[#888] hover:bg-[#1db954]/8 hover:border-[#1db954]/20 hover:text-[#1db954] transition-all cursor-default">
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-28 max-w-7xl mx-auto px-6">
      <div className="reveal-up mb-16">
        <p className="text-[#1db954] text-xs font-bold uppercase tracking-[0.2em] mb-3">Features</p>
        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
          Built for how<br />you actually listen.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="reveal-up group bg-[#0c0c0c] hover:bg-[#111] p-8 transition-all duration-300 relative overflow-hidden"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(300px circle at 50% 50%, ${f.accent}08 0%, transparent 70%)` }}
            />
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300"
              style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}
            >
              <f.icon size={22} style={{ color: f.accent }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
            <div className="mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-semibold" style={{ color: f.accent }}>Learn more</span>
              <ChevronRight size={12} style={{ color: f.accent }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Create your account", desc: "Sign up for free in under 30 seconds. No credit card required." },
    { n: "02", title: "Set your taste", desc: "Tell us your genres, favorite artists, and moods. The more you share, the better it gets." },
    { n: "03", title: "Start listening", desc: "Your personalized home screen is ready immediately. Stream, download, or share." },
  ];
  return (
    <section id="how" className="py-28 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="reveal-up mb-20 max-w-lg">
          <p className="text-[#1db954] text-xs font-bold uppercase tracking-[0.2em] mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Up and running in minutes.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="reveal-up relative" style={{ transitionDelay: `${i * 100}ms` }}>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+60px)] right-0 h-px bg-gradient-to-r from-[#1db954]/30 to-transparent" />
              )}
              <div className="flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-[#1db954]/10 border border-[#1db954]/20 flex items-center justify-center mb-6">
                  <span className="text-[#1db954] font-black text-lg">{s.n}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "100M+", label: "Songs in Library" },
    { value: "50M+", label: "Active Listeners" },
    { value: "150+", label: "Countries Covered" },
  ];
  return (
    <section className="py-20 bg-[#0d0d0d] border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
          {stats.map((s, i) => (
            <div key={i} className="reveal-up flex flex-col items-center py-10 md:py-6" style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="text-[56px] md:text-[72px] font-black text-white leading-none mb-3 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                {s.value}
              </div>
              <p className="text-sm text-[#555] font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-28 max-w-7xl mx-auto px-6">
      <div className="reveal-up mb-16">
        <p className="text-[#1db954] text-xs font-bold uppercase tracking-[0.2em] mb-3">Testimonials</p>
        <h2 className="text-4xl md:text-5xl font-black text-white">People who listen.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="reveal-up bg-[#0e0e0e] border border-white/[0.06] rounded-2xl p-7 hover:border-white/[0.12] transition-all duration-300 group" style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-1 mb-5">
              {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="#f59e0b" className="text-amber-400" />)}
            </div>
            <p className="text-[#bbb] text-[15px] leading-relaxed mb-6 italic">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${["from-rose-400 to-pink-600", "from-amber-400 to-orange-600", "from-sky-400 to-blue-600"][i]} flex items-center justify-center text-sm font-bold text-white`}>
                {t.name[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-[#555] text-xs">{t.handle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  const [, setLocation] = useLocation();
  return (
    <section className="py-28 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="reveal-up relative">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#1db954]/8 blur-[100px] rounded-full" />
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-end gap-[3px] h-14">
              {Array.from({ length: 20 }).map((_, i) => {
                const h = [30, 45, 55, 40, 60, 48, 38, 52, 44, 58, 42, 50, 36, 54, 46, 56, 40, 48, 34, 52][i];
                const dur = [0.6, 0.8, 0.7, 0.9, 0.75, 0.65, 0.85, 0.7, 0.8, 0.6][i % 10];
                const delay = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.1, 0.2, 0.15][i % 10];
                return (
                  <div key={i} className="wave-bar bg-[#1db954]"
                    style={{ height: `${h}%`, "--dur": `${dur}s`, animationDelay: `${delay}s` } as React.CSSProperties} />
                );
              })}
            </div>
          </div>

          <p className="text-[#1db954] text-xs font-bold uppercase tracking-[0.25em] mb-4">Free Forever</p>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Start listening<br />
            <span className="bg-gradient-to-r from-[#1db954] via-[#4ade80] to-[#1db954] bg-clip-text text-transparent animate-gradient">
              right now.
            </span>
          </h2>
          <p className="text-lg text-[#666] mb-10 max-w-md mx-auto">
            No subscription needed. No credit card. Just you and the music.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setLocation("/auth")}
              className="group px-10 py-4 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full text-base transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(29,185,84,0.35)] flex items-center gap-2 justify-center">
              Create Free Account
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setLocation("/")}
              className="px-10 py-4 border border-white/15 text-white font-semibold rounded-full text-base hover:bg-white/[0.06] transition-all flex items-center gap-2 justify-center">
              <Play size={16} fill="white" /> Explore as Guest
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [, setLocation] = useLocation();
  return (
    <footer className="border-t border-white/[0.05] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1db954] flex items-center justify-center">
              <Music2 size={14} className="text-black" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-white">Melodify</span>
          </div>

          <div className="flex items-center gap-8">
            {["Privacy", "Terms", "About", "Contact"].map((link) => (
              <a key={link} href="#" className="text-xs text-[#555] hover:text-[#aaa] transition-colors font-medium">{link}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#1db954]" />
            <p className="text-xs text-[#444]">Made with love for music lovers</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#333]">© 2026 Melodify. A college mini-project.</p>
          <button onClick={() => setLocation("/")} className="text-xs text-[#1db954] hover:underline">Launch App →</button>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="landing-body bg-[#080808] text-white" style={{ height: "100vh", overflowY: "auto", overflowX: "hidden" }}>
      <NavBar />
      <HeroSection />
      <GenreMarquee />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
