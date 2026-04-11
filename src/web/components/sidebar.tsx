import { useLocation } from "wouter";
import { Hop as Home, Search, Library, Heart, Clock, Music2, Users, LogIn, ChevronRight } from "lucide-react";
import { useLikedStore, usePlayerStore } from "@/lib/store";
import { useLibraryStore } from "@/lib/libraryStore";
import { usePartyStore } from "@/lib/partyStore";
import { useAuthStore } from "@/lib/authStore";
import { getHighQualityImage, decodeHtml } from "@/lib/api";
import Equalizer from "./equalizer";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { history: recentSongs, playlists } = useLibraryStore();
  const { likedSongs } = useLikedStore();
  const { currentSong, isPlaying, playSong } = usePlayerStore();
  const { roomId, hostParty, joinParty, leaveParty, partyUsers } = usePartyStore();
  const { user, profile } = useAuthStore();

  const initials = (profile?.display_name || user?.email || "?")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handlePartyAction = () => {
    if (roomId) leaveParty();
    else {
      const code = prompt("Enter Room Code to join, or leave blank to Host:");
      if (code) joinParty(code.toUpperCase());
      else hostParty();
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[280px] shrink-0 h-full gap-2 p-2">
      {/* Logo + Nav */}
      <div className="neuglass rounded-2xl px-4 py-5 shadow-none border-none">
        <div className="flex items-center gap-2.5 mb-6 px-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Music2 size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold tracking-tight">Melodify</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-white bg-white/10 nav-active-indicator"
                    : "text-[#b3b3b3] hover:text-white"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Watch Party Quick Action */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <button 
            onClick={handlePartyAction}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              roomId ? "bg-primary/20 text-primary shadow-[0_0_10px_var(--color-primary)]" : "bg-white/5 text-[#b3b3b3] hover:text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              {roomId ? `Room: ${roomId}` : "Listen Along"}
            </div>
            {roomId && <span className="text-[10px] bg-primary text-black px-1.5 py-0.5 rounded-full">{partyUsers}</span>}
          </button>
        </div>

        {/* Auth Section */}
        <div className="mt-3">
          {user ? (
            <button
              onClick={() => setLocation("/profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                location === "/profile" ? "bg-white/10 text-white" : "text-[#b3b3b3] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1db954] to-[#0d7a37] flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                {initials}
              </div>
              <span className="flex-1 text-left truncate">{profile?.display_name || user.email?.split("@")[0]}</span>
              <ChevronRight size={14} className="shrink-0 opacity-50" />
            </button>
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
        </div>

        {/* Filter chips */}
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
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {/* Liked Songs entry */}
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

          {/* Custom Playlists */}
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

          {/* Recently played */}
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

          {/* Empty state */}
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
