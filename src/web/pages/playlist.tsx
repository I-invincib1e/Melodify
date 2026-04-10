import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { getPlaylist, getHighQualityImage, decodeHtml, formatDuration, type Playlist } from "@/lib/api";
import { usePlayerStore } from "@/lib/store";
import SongRow from "@/components/song-row";
import { Play, Shuffle, ArrowLeft, Clock } from "lucide-react";

export default function PlaylistPage() {
  const [, params] = useRoute("/playlist/:id");
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayerStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      setPlaylist(null);
      getPlaylist(params.id).then(setPlaylist).catch(console.error).finally(() => setLoading(false));
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-48 h-48 skeleton-shimmer rounded-md shrink-0" />
          <div className="space-y-4 flex-1 pt-4">
            <div className="h-3 w-16 skeleton-shimmer rounded" />
            <div className="h-10 w-72 skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <p className="text-white text-lg font-semibold">Playlist not found</p>
        <button onClick={() => setLocation("/")} className="text-primary mt-3 text-sm font-medium hover:underline">Go home</button>
      </div>
    );
  }

  const image = getHighQualityImage(playlist.image);
  const songs = playlist.songs || [];
  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);

  const playAll = () => { if (songs.length > 0) playSong(songs[0], songs, 0); };

  return (
    <div className="pb-32 animate-fade-in">
      <div className="relative p-4 md:p-6 pb-8"
        style={{ background: `linear-gradient(180deg, rgba(120,60,180,0.3) 0%, rgba(18,18,18,0) 100%)` }}>
        <button onClick={() => window.history.back()}
          className="mb-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-center md:items-end">
          {image && (
            <img src={image} alt={decodeHtml(playlist.name)}
              className="w-44 h-44 md:w-56 md:h-56 rounded-md object-cover shadow-2xl shadow-black/50 shrink-0" />
          )}
          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] uppercase font-semibold text-white/60 tracking-wider mb-1">Playlist</p>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
              {decodeHtml(playlist.name)}
            </h1>
            {playlist.description && (
              <p className="text-sm text-[#a7a7a7] mb-2 line-clamp-2">{decodeHtml(playlist.description)}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-[#b3b3b3] justify-center md:justify-start">
              {songs.length > 0 && <span>{songs.length} songs, {formatDuration(totalDuration)}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <div className="flex items-center gap-4 py-4">
          <button onClick={playAll}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform hover:brightness-110 shadow-lg shadow-primary/20">
            <Play size={22} fill="black" className="text-black ml-0.5" />
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
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} showIndex showAlbumName />
          ))}
        </div>

        {songs.length === 0 && (
          <div className="text-center py-16 text-[#a7a7a7]">This playlist is empty</div>
        )}
      </div>
    </div>
  );
}
