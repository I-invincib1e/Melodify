import { useLikedStore, usePlayerStore } from "@/lib/store";
import { formatDuration } from "@/lib/api";
import SongRow from "@/components/song-row";
import { Play, Shuffle, Heart, Clock, ArrowLeft, Music } from "lucide-react";

export default function LikedPage() {
  const { likedSongs } = useLikedStore();
  const { playSong } = usePlayerStore();

  const totalDuration = likedSongs.reduce((sum, s) => sum + (s.duration || 0), 0);

  const playAll = () => {
    if (likedSongs.length > 0) playSong(likedSongs[0], likedSongs, 0);
  };

  const shufflePlay = () => {
    if (likedSongs.length === 0) return;
    const idx = Math.floor(Math.random() * likedSongs.length);
    playSong(likedSongs[idx], likedSongs, idx);
  };

  return (
    <div className="pb-32 animate-fade-in">
      {/* Header */}
      <div className="relative p-4 md:p-6 pb-8"
        style={{ background: `linear-gradient(180deg, rgba(69,10,245,0.4) 0%, rgba(18,18,18,0) 100%)` }}>
        <button onClick={() => window.history.back()}
          className="mb-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-center md:items-end">
          <div className="w-44 h-44 md:w-56 md:h-56 rounded-md bg-gradient-to-br from-[#450af5] via-[#8e8ee5] to-[#c4efd9] flex items-center justify-center shadow-2xl shadow-black/50 shrink-0">
            <Heart size={64} fill="white" className="text-white drop-shadow-lg" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] uppercase font-semibold text-white/60 tracking-wider mb-1">Playlist</p>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3">Liked Songs</h1>
            <div className="flex items-center gap-2 text-sm text-[#b3b3b3] justify-center md:justify-start">
              <span>{likedSongs.length} song{likedSongs.length !== 1 ? "s" : ""}</span>
              {likedSongs.length > 0 && (
                <><span className="text-[#a7a7a7]">•</span><span>{formatDuration(totalDuration)}</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6">
        {likedSongs.length > 0 ? (
          <>
            <div className="flex items-center gap-4 py-4">
              <button onClick={playAll}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform hover:brightness-110 shadow-lg shadow-primary/20">
                <Play size={22} fill="black" className="text-black ml-0.5" />
              </button>
              <button onClick={shufflePlay}
                className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-white/[0.12] transition-all">
                <Shuffle size={18} />
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 px-3 py-2 border-b border-white/[0.06] text-[#a7a7a7] text-[11px] uppercase tracking-wider font-medium">
              <div className="w-7 text-center">#</div>
              <div className="w-10" />
              <div className="flex-1">Title</div>
              <div className="hidden lg:block w-[200px]">Album</div>
              <div className="w-10 text-right"><Clock size={14} /></div>
            </div>

            <div className="stagger-children">
              {likedSongs.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} queue={likedSongs} showIndex showAlbumName />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mb-5">
              <Music size={36} className="text-[#727272]" />
            </div>
            <p className="text-lg font-semibold text-white mb-1">Songs you like will appear here</p>
            <p className="text-sm text-[#a7a7a7]">Save songs by tapping the heart icon</p>
          </div>
        )}
      </div>
    </div>
  );
}
