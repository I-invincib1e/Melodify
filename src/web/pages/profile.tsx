import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CreditCard as Edit2, LogOut, Settings, Heart, Music2, Clock, Loader as Loader2, Check, ChevronRight, TriangleAlert as AlertTriangle, Sparkles, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";
import { useLikedStore } from "@/lib/store";
import { useLibraryStore } from "@/lib/libraryStore";
import { useToastStore } from "@/lib/toastStore";
import GlobalEqualizer from "@/components/global-equalizer";

const GENRE_LABELS: Record<string, string> = {
  hindi: "Hindi", punjabi: "Punjabi", romantic: "Romantic", pop: "Pop",
  electronic: "Electronic", classical: "Classical", sufi: "Sufi",
  devotional: "Devotional", rap: "Rap / Hip-Hop", party: "Party",
  sad: "Sad / Emotional", retro: "Retro / Old",
};

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, profile, preferences, fetchProfile, signOut } = useAuthStore();
  const { likedSongs } = useLikedStore();
  const { playlists } = useLibraryStore();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const toast = useToastStore();

  useEffect(() => {
    if (!user) { setLocation("/auth"); return; }
    setNewName(profile?.display_name || "");
    supabase.from("listening_history").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setHistoryCount(count || 0));
    supabase.from("liked_songs").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setLikedCount(count || likedSongs.length));
  }, [user, profile]);

  async function saveDisplayName() {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    await supabase.from("profiles").update({ display_name: newName.trim(), updated_at: new Date().toISOString() }).eq("id", user.id);
    await fetchProfile();
    setSavingName(false);
    setEditingName(false);
    toast.success("Profile name updated!");
  }

  async function handleSignOut() {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      setTimeout(() => setConfirmSignOut(false), 3500);
      return;
    }
    await signOut();
    toast.info("Signed out. See you soon!");
    setLocation("/");
  }

  if (!user) return null;

  const initials = (profile?.display_name || user.email || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="min-h-full pb-64 overflow-x-hidden">
      {/* Immersive Hero Header */}
      <div className="relative h-[300px] w-full flex items-end px-6 md:px-12 pb-8 overflow-hidden">
        {/* Dynamic Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1db954]/20 to-transparent z-0" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#1db954]/10 blur-[120px] rounded-full z-0 animate-pulse" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 w-full max-w-5xl mx-auto">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[#1db954] to-[#0d7a37] flex items-center justify-center text-4xl md:text-6xl font-black text-black shadow-2xl shadow-black/50 select-none border-4 border-white/10">
              {initials}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black border-4 border-[#121212] shadow-xl">
              <Sparkles size={18} fill="black" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left min-w-0">
            <p className="text-[10px] md:text-xs font-black text-[#1db954] uppercase tracking-[0.3em] mb-2 drop-shadow-sm">Subscriber Profile</p>
            {editingName ? (
              <div className="flex items-center justify-center md:justify-start gap-2 max-w-sm mx-auto md:mx-0">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") saveDisplayName(); if (e.key === "Escape") setEditingName(false); }}
                  className="w-full bg-white/[0.06] border border-white/[0.15] rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-[#1db954]" />
                <button onClick={saveDisplayName} disabled={savingName}
                  className="w-12 h-12 rounded-xl bg-[#1db954] flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
                  {savingName ? <Loader2 size={20} className="animate-spin text-black" /> : <Check size={20} className="text-black" strokeWidth={3} />}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center md:justify-start gap-4 group">
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter truncate drop-shadow-lg">
                  {profile?.display_name || user.email?.split("@")[0]}
                </h1>
                <button onClick={() => setEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/5 hover:bg-white/10 text-white shadow-lg"><Edit2 size={18} /></button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-4 text-sm font-medium text-[#a7a7a7]">
              <span className="flex items-center gap-2 text-white">
                <Music2 size={14} className="text-[#1db954]" /> {playlists.length} Playlists
              </span>
              <span className="flex items-center gap-2">
                <Clock size={14} /> Joined {joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Heart, label: "Liked Songs", value: likedCount, path: "/liked", color: "text-rose-500" },
            { icon: Music2, label: "Playlists Created", value: playlists.length, path: null, color: "text-[#1db954]" },
            { icon: Clock, label: "Songs Played", value: historyCount, path: "/history", color: "text-blue-400" },
          ].map(({ icon: Icon, label, value, path, color }) => (
            <button key={label} onClick={() => path && setLocation(path)}
              className={`neuglass p-6 rounded-3xl flex items-center justify-between group transition-all duration-300 ${path ? "hover:translate-y-[-4px] hover:bg-white/[0.06]" : "cursor-default"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center ${color}`}>
                  <Icon size={22} fill="currentColor" className="opacity-80" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white leading-none">{value.toLocaleString()}</p>
                  <p className="text-[11px] font-bold text-[#555] uppercase tracking-widest mt-1">{label}</p>
                </div>
              </div>
              {path && <ChevronRight size={18} className="text-[#333] group-hover:text-white transition-colors" />}
            </button>
          ))}
        </div>

        {/* Settings & Personalization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <h2 className="text-xs font-black text-[#555] uppercase tracking-[0.4em] mb-4 pl-1">Personalization</h2>
          </div>

          {/* Preferences Card */}
          <div className="lg:col-span-5 space-y-4">
            {preferences?.setup_complete ? (
              <div className="neuglass rounded-3xl p-8 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <User size={120} />
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white">Your Taste</h3>
                  <button onClick={() => setLocation("/onboarding")} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-[#1db954] hover:text-black transition-all">
                    <Edit2 size={16} />
                  </button>
                </div>

                <div className="space-y-6 relative z-10">
                  {preferences.genres.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-3">Favorite Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.genres.map((g) => (
                          <span key={g} className="px-3 py-1.5 bg-[#1db954]/10 border border-[#1db954]/20 rounded-lg text-xs font-bold text-[#1db954]">{GENRE_LABELS[g] || g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {preferences.artist_names.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-3">Top Artists</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.artist_names.map((name) => (
                          <span key={name} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors">{name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => setLocation("/onboarding")}
                className="neuglass w-full p-8 rounded-3xl text-left group hover:bg-[#1db954]/5 transition-colors h-full flex flex-col justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1db954]/10 flex items-center justify-center text-[#1db954] mb-4">
                  <Settings size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Configure Your Profile</h3>
                <p className="text-sm text-[#a7a7a7] mb-6">Complete your taste setup to unlock personalized recommendations throughout the app.</p>
                <div className="flex items-center gap-2 text-[#1db954] font-bold text-sm">
                  Start Onboarding <ChevronRight size={16} />
                </div>
              </button>
            )}
          </div>

          {/* Equalizer Column */}
          <div className="lg:col-span-7">
             <GlobalEqualizer />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className={`w-full md:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all ${
              confirmSignOut
                ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "bg-white/5 text-[#a7a7a7] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-transparent"
            }`}
          >
            {confirmSignOut ? (
              <><AlertTriangle size={18} /> Confirm Sign Out</>
            ) : (
              <><LogOut size={18} /> Disconnect Account</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
