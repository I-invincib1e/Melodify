import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { getAlbum, getHighQualityImage, decodeHtml, formatDuration, type Album } from "@/lib/api";
import { usePlayerStore } from "@/lib/store";
import SongRow from "@/components/song-row";
import { Play, Shuffle, Clock, ArrowLeft } from "lucide-react";

export default function AlbumPage() {
  const [, params] = useRoute("/album/:id");
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayerStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      setAlbum(null);
      getAlbum(params.id).then(setAlbum).catch(console.error).finally(() => setLoading(false));
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-48 h-48 md:w-56 md:h-56 skeleton-shimmer rounded-md shrink-0" />
          <div className="space-y-4 flex-1 pt-4">
            <div className="h-3 w-16 skeleton-shimmer rounded" />
            <div className="h-10 w-72 skeleton-shimmer rounded" />
            <div className="h-4 w-48 skeleton-shimmer rounded" />
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 skeleton-shimmer rounded" />
        ))}
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <p className="text-white text-lg font-semibold">Album not found</p>
        <button onClick={() => setLocation("/")} className="text-[#1DB954] mt-3 text-sm font-medium hover:underline">Go home</button>
      </div>
    );
  }

  const image = getHighQualityImage(album.image);
  const artistNames = album.artists?.primary?.map((a) => decodeHtml(a.name)).join(", ") || "";
  const songs = album.songs || [];
  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);

  const playAll = () => { if (songs.length > 0) playSong(songs[0], songs, 0); };
  const shufflePlay = () => {
    if (songs.length === 0) return;
    const idx = Math.floor(Math.random() * songs.length);
    playSong(songs[idx], songs, idx);
  };

  return (
    <div className="pb-32 animate-fade-in">
      {/* Header gradient */}
      <div className="relative p-4 md:p-6 pb-8"
        style={{ background: `linear-gradient(180deg, rgba(29,185,84,0.25) 0%, rgba(18,18,18,0) 100%)` }}>
        <button onClick={() => window.history.back()}
          className="mb-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-center md:items-end">
          {image && (
            <img src={image} alt={decodeHtml(album.name)}
              className="w-44 h-44 md:w-56 md:h-56 rounded-md object-cover shadow-2xl shadow-black/50 shrink-0" />
          )}
          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] uppercase font-semibold text-white/60 tracking-wider mb-1">Album</p>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
              {decodeHtml(album.name)}
            </h1>
            <div className="flex items-center gap-2 text-sm text-[#b3b3b3] flex-wrap justify-center md:justify-start">
              {album.artists?.primary?.map((a, i) => (
                <button key={a.id} onClick={() => setLocation(`/artist/${a.id}`)}
                  className="text-white font-semibold hover:underline">
                  {decodeHtml(a.name)}{i < (album.artists?.primary?.length ?? 0) - 1 ? "," : ""}
                </button>
              ))}
              {album.year && <><span className="text-[#a7a7a7]">•</span><span>{album.year}</span></>}
              {songs.length > 0 && (
                <><span className="text-[#a7a7a7]">•</span><span>{songs.length} songs, {formatDuration(totalDuration)}</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 md:px-6">
        <div className="flex items-center gap-4 py-4">
          <button onClick={playAll}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform hover:bg-[#1ed760] shadow-lg shadow-[#1DB954]/20">
            <Play size={22} fill="black" className="text-black ml-0.5" />
          </button>
          <button onClick={shufflePlay}
            className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-white/[0.12] transition-all">
            <Shuffle size={18} />
          </button>
        </div>

        {/* Table header */}
        <div className="hidden md:flex items-center gap-3 px-3 py-2 border-b border-white/[0.06] text-[#a7a7a7] text-[11px] uppercase tracking-wider font-medium">
          <div className="w-7 text-center">#</div>
          <div className="flex-1">Title</div>
          <div className="hidden lg:block w-[200px]">Album</div>
          <div className="w-10 text-right"><Clock size={14} /></div>
        </div>

        {/* Songs */}
        <div className="stagger-children">
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} showAlbumArt={false} showIndex />
          ))}
        </div>

        {songs.length === 0 && (
          <div className="text-center py-16 text-[#a7a7a7]">
            <p>No songs found in this album</p>
          </div>
        )}
      </div>
    </div>
  );
}
