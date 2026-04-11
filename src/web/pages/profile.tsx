import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CreditCard as Edit2, LogOut, Settings, Heart, Music2, Clock, Loader as Loader2, Check, ChevronRight, TriangleAlert as AlertTriangle } from "lucide-react";
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
    <div className="p-4 md:p-8 pb-32 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>

      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1db954] to-[#0d7a37] flex items-center justify-center shrink-0 text-2xl font-bold text-black select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") saveDisplayName(); if (e.key === "Escape") setEditingName(false); }}
                  className="flex-1 bg-white/[0.06] border border-white/[0.15] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1db954]/60" />
                <button onClick={saveDisplayName} disabled={savingName}
                  className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center shrink-0 hover:bg-[#1ed760] transition-colors">
                  {savingName ? <Loader2 size={14} className="animate-spin text-black" /> : <Check size={14} className="text-black" strokeWidth={3} />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <p className="text-xl font-bold text-white truncate">{profile?.display_name || user.email?.split("@")[0]}</p>
                <button onClick={() => setEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#a7a7a7] hover:text-white"><Edit2 size={14} /></button>
              </div>
            )}
            <p className="text-sm text-[#a7a7a7] truncate mt-0.5">{user.email}</p>
            {joinDate && <p className="text-xs text-[#555] mt-1">Member since {joinDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Heart, label: "Liked Songs", value: likedCount, path: "/liked" },
            { icon: Music2, label: "Playlists", value: playlists.length, path: null },
            { icon: Clock, label: "Plays", value: historyCount, path: "/history" },
          ].map(({ icon: Icon, label, value, path }) => (
            <button key={label} onClick={() => path && setLocation(path)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] transition-all ${path ? "hover:bg-white/[0.08] cursor-pointer" : "cursor-default"}`}>
              <Icon size={18} className="text-[#1db954]" />
              <span className="text-lg font-bold text-white">{value.toLocaleString()}</span>
              <span className="text-[11px] text-[#a7a7a7]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {preferences?.setup_complete && (
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your Taste</h2>
            <button onClick={() => setLocation("/onboarding")} className="text-xs text-[#1db954] hover:underline flex items-center gap-1">
              Edit <ChevronRight size={12} />
            </button>
          </div>
          {preferences.genres.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {preferences.genres.map((g) => (
                  <span key={g} className="px-3 py-1.5 bg-[#1db954]/10 border border-[#1db954]/20 rounded-full text-xs font-semibold text-[#1db954]">{GENRE_LABELS[g] || g}</span>
                ))}
              </div>
            </div>
          )}
          {preferences.artist_names.length > 0 && (
            <div>
              <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Favorite Artists</p>
              <div className="flex flex-wrap gap-2">
                {preferences.artist_names.map((name) => (
                  <span key={name} className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full text-xs font-semibold text-white">{name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!preferences?.setup_complete && (
        <button onClick={() => setLocation("/onboarding")}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#1db954]/10 border border-[#1db954]/25 rounded-2xl mb-5 hover:bg-[#1db954]/15 transition-colors">
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-[#1db954]" />
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Set up your taste</p>
              <p className="text-xs text-[#a7a7a7]">Get personalized music recommendations</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#1db954]" />
        </button>
      )}

      {/* Embedded EQ Settings */}
      <div className="mb-8">
        <GlobalEqualizer />
      </div>

      <button
        onClick={handleSignOut}
        className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all ${
          confirmSignOut
            ? "bg-red-500/15 border border-red-500/30 text-red-400 animate-pulse"
            : "bg-white/[0.04] border border-white/[0.06] text-[#a7a7a7] hover:text-white hover:border-white/15"
        }`}
      >
        {confirmSignOut ? (
          <><AlertTriangle size={16} /> Tap again to confirm</>
        ) : (
          <><LogOut size={16} /> Sign Out</>
        )}
      </button>
    </div>
  );
}
