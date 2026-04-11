import { useState } from "react";
import { useLocation } from "wouter";
import { Hop as Home, Search, Library, Heart, Clock, Music2, Users, LogIn, ChevronRight, LogOut, Settings, X, Check, Sparkles } from "lucide-react";
import { useLikedStore, usePlayerStore } from "@/lib/store";
import { useLibraryStore } from "@/lib/libraryStore";
import { usePartyStore } from "@/lib/partyStore";
import { useAuthStore } from "@/lib/authStore";
import { useToastStore } from "@/lib/toastStore";
import { getHighQualityImage, decodeHtml } from "@/lib/api";
import Equalizer from "./equalizer";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { history: recentSongs, playlists } = useLibraryStore();
  const { likedSongs } = useLikedStore();
  const { currentSong, isPlaying, playSong } = usePlayerStore();
  const { roomId, hostParty, joinParty, leaveParty, partyUsers } = usePartyStore();
  const { user, profile, preferences, signOut } = useAuthStore();
  const toast = useToastStore();

  const [showPartyInput, setShowPartyInput] = useState(false);
  const [partyCode, setPartyCode] = useState("");
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const initials = (profile?.display_name || user?.email || "?")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  function handlePartyHost() {
    hostParty();
    setShowPartyInput(false);
    toast.success("Party room created!");
  }

  function handlePartyJoin() {
    if (!partyCode.trim()) return;
    joinParty(partyCode.trim().toUpperCase());
    setPartyCode("");
    setShowPartyInput(false);
    toast.info(`Joined room ${partyCode.trim().toUpperCase()}`);
  }

  async function handleSignOut() {
    if (!confirmSignOut) { setConfirmSignOut(true); setTimeout(() => setConfirmSignOut(false), 3000); return; }
    await signOut();
    setConfirmSignOut(false);
    toast.info("Signed out. See you soon!");
    setLocation("/");
  }

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[280px] shrink-0 h-full gap-2 p-2">
      {/* Logo + Nav */}
      <div className="neuglass rounded-2xl px-4 py-5 shadow-none border-none">
        <button
          onClick={() => setLocation("/landing")}
          className="flex items-center gap-2.5 mb-6 px-1 group"
        >
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center shrink-0 group-hover:shadow-[0_0_14px_rgba(29,185,84,0.5)] transition-all">
            <Music2 size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold tracking-tight group-hover:text-[#1db954] transition-colors">Melodify</span>
        </button>

        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  isActive ? "text-white bg-white/10 nav-active-indicator" : "text-[#b3b3b3] hover:text-white"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Watch Party */}
        <div className="mt-4 pt-4 border-t border-white/5">
          {roomId ? (
            <div className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold bg-primary/20 text-primary shadow-[0_0_10px_var(--color-primary)]`}>
              <div className="flex items-center gap-3">
                <Users size={20} />
                <span>Room: {roomId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-primary text-black px-1.5 py-0.5 rounded-full">{partyUsers}</span>
                <button onClick={() => { leaveParty(); toast.info("Left the party room."); }}
                  className="w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-colors">
                  <X size={10} />
                </button>
              </div>
            </div>
          ) : showPartyInput ? (
            <div className="space-y-2">
              <input
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                placeholder="Room code (or leave blank)"
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-primary/50 transition-all uppercase"
                onKeyDown={(e) => { if (e.key === "Enter") partyCode.trim() ? handlePartyJoin() : handlePartyHost(); if (e.key === "Escape") setShowPartyInput(false); }}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => partyCode.trim() ? handlePartyJoin() : handlePartyHost()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary/15 text-primary border border-primary/25 rounded-lg text-xs font-semibold hover:bg-primary/25 transition-colors">
                  <Check size={12} />
                  {partyCode.trim() ? "Join" : "Host New"}
                </button>
                <button onClick={() => { setShowPartyInput(false); setPartyCode(""); }}
                  className="py-1.5 px-3 bg-white/5 text-[#777] border border-white/5 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPartyInput(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold bg-white/5 text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Users size={20} />
                Listen Along
              </div>
              <ChevronRight size={14} className="opacity-50" />
            </button>
          )}
        </div>

        {/* Auth Section */}
        <div className="mt-3 space-y-1">
          {user ? (
            <>
              {preferences && !preferences.setup_complete && (
                <button
                  onClick={() => setLocation("/onboarding")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[#1db954] bg-[#1db954]/8 border border-[#1db954]/20 hover:bg-[#1db954]/15 transition-all duration-200"
                >
                  <Settings size={14} />
                  <span className="flex-1 text-left">Set up your music taste</span>
                  <ChevronRight size={12} />
                </button>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLocation("/profile")}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    location === "/profile" ? "bg-white/10 text-white" : "text-[#b3b3b3] hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1db954] to-[#0d7a37] flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                    {initials}
                  </div>
                  <span className="flex-1 text-left truncate">{profile?.display_name || user.email?.split("@")[0]}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  title={confirmSignOut ? "Click again to confirm" : "Sign Out"}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-all shrink-0 ${
                    confirmSignOut
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : "text-[#555] hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  <LogOut size={14} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setLocation("/auth")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-[#b3b3b3] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200"
            >
              <LogIn size={20} />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Library */}
      <div className="neuglass rounded-2xl flex-1 overflow-hidden flex flex-col shadow-none border-none">
        <div className="flex items-center gap-3 px-5 pt-4 pb-2 text-[#b3b3b3]">
          <Library size={20} />
          <span className="text-sm font-semibold">Your Library</span>
          {(likedSongs.length > 0 || recentSongs.length > 0) && (
            <span className="ml-auto text-xs text-[#444]">{likedSongs.length + recentSongs.length}</span>
          )}
        </div>

        <div className="flex gap-2 px-4 py-2">
          <button
            onClick={() => setLocation("/liked")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              location === "/liked" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <Heart size={12} /> Liked
          </button>
          <button
            onClick={() => setLocation("/history")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              location === "/history" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <Clock size={12} /> Recent
          </button>
          <button
            onClick={() => setLocation("/stats")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              location === "/stats" ? "bg-white text-black text-primary" : "bg-white/10 text-primary hover:bg-white/15"
            }`}
             title="Your Wrapped Stats"
          >
            <Sparkles size={12} /> Stats
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {likedSongs.length > 0 && (
            <button
              onClick={() => setLocation("/liked")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.07] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0">
                <Heart size={14} fill="white" className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">Liked Songs</p>
                <p className="text-[11px] text-[#a7a7a7]">{likedSongs.length} songs</p>
              </div>
            </button>
          )}

          {playlists.map(p => (
            <button
              key={p.id}
              onClick={() => setLocation(`/my-playlist/${p.id}`)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.07] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-md bg-[#282828] flex items-center justify-center shrink-0">
                <Music2 size={16} className="text-[#a7a7a7]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                <p className="text-[11px] text-[#a7a7a7]">{p.songs.length} songs</p>
              </div>
            </button>
          ))}

          {recentSongs.slice(0, 12).map((song) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <button
                key={song.id}
                onClick={() => playSong(song, [song], 0)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.07] transition-colors text-left group"
              >
                <img
                  src={getHighQualityImage(song.image)}
                  alt=""
                  className="w-10 h-10 rounded object-cover shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${isCurrent ? "text-primary" : "text-white"}`}>
                    {decodeHtml(song.name)}
                  </p>
                  <p className="text-[11px] text-[#a7a7a7] truncate">
                    {song.artists?.primary?.map((a) => decodeHtml(a.name)).join(", ")}
                  </p>
                </div>
                {isCurrent && isPlaying && <Equalizer className="shrink-0" />}
              </button>
            );
          })}

          {recentSongs.length === 0 && likedSongs.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center px-4 py-10">
              <p className="text-sm font-semibold text-white mb-1">Your library is empty</p>
              <p className="text-xs text-[#b3b3b3] mb-4">Start listening to fill it up</p>
              {!user && (
                <button
                  onClick={() => setLocation("/auth")}
                  className="px-4 py-1.5 bg-[#1db954] text-black rounded-full text-xs font-semibold hover:scale-105 transition-transform mb-2"
                >
                  Sign In
                </button>
              )}
              <button
                onClick={() => setLocation("/search")}
                className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-semibold hover:scale-105 transition-transform"
              >
                Browse Music
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
