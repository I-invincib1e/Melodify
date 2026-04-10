import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { getArtist, getHighQualityImage, decodeHtml, formatPlayCount, type ArtistDetail } from "@/lib/api";
import { usePlayerStore } from "@/lib/store";
import SongRow from "@/components/song-row";
import HorizontalScroll from "@/components/horizontal-scroll";
import MusicCard from "@/components/music-card";
import { Play, Shuffle, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export default function ArtistPage() {
  const [, params] = useRoute("/artist/:id");
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      setArtist(null);
      setShowAllSongs(false);
      setShowFullBio(false);
      getArtist(params.id).then(setArtist).catch(console.error).finally(() => setLoading(false));
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="h-56 md:h-72 skeleton-shimmer" />
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 skeleton-shimmer rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-fade-in">
        <p className="text-white font-semibold">Artist not found</p>
      </div>
    );
  }

  const image = getHighQualityImage(artist.image);
  const topSongs = artist.topSongs || [];
  const displaySongs = showAllSongs ? topSongs : topSongs.slice(0, 5);

  const playAll = () => { if (topSongs.length > 0) playSong(topSongs[0], topSongs, 0); };
  const shufflePlay = () => {
    if (topSongs.length === 0) return;
    const idx = Math.floor(Math.random() * topSongs.length);
    playSong(topSongs[idx], topSongs, idx);
  };

  return (
    <div className="pb-32 animate-fade-in">
      {/* Hero */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <button onClick={() => window.history.back()}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
          <ArrowLeft size={20} />
        </button>
        {image && <img src={image} alt={artist.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 right-4">
          {artist.isVerified && (
            <div className="flex items-center gap-1.5 text-xs mb-1.5">
              <CheckCircle2 size={16} className="text-[#3d91f4]" fill="#3d91f4" stroke="#fff" />
              <span className="text-white font-medium">Verified Artist</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-1">{decodeHtml(artist.name)}</h1>
          <p className="text-sm text-[#b3b3b3]">
            {formatPlayCount(artist.followerCount)} followers
          </p>
        </div>
      </div>

      <div className="px-4 md:px-6">
        {/* Action bar */}
        <div className="flex items-center gap-4 py-5">
          <button onClick={playAll}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform hover:bg-[#1ed760] shadow-lg shadow-[#1DB954]/20">
            <Play size={22} fill="black" className="text-black ml-0.5" />
          </button>
          <button onClick={shufflePlay}
            className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-white/[0.12] transition-all">
            <Shuffle size={18} />
          </button>
        </div>

        {/* Popular songs */}
        {topSongs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3">Popular</h2>
            <div className="stagger-children">
              {displaySongs.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} queue={topSongs} showIndex showAlbumName />
              ))}
            </div>
            {topSongs.length > 5 && (
              <button onClick={() => setShowAllSongs(!showAllSongs)}
                className="mt-3 text-sm text-[#b3b3b3] hover:text-white font-semibold transition-colors flex items-center gap-1">
                {showAllSongs ? <><ChevronUp size={16}/> Show less</> : <><ChevronDown size={16}/> See all</>}
              </button>
            )}
          </section>
        )}

        {/* Albums */}
        {artist.topAlbums && artist.topAlbums.length > 0 && (
          <HorizontalScroll title="Albums" subtitle="Discography">
            {artist.topAlbums.map((a) => (
              <MusicCard key={a.id} id={a.id} name={a.name} image={a.image} type="album"
                subtitle={a.year ? String(a.year) : undefined} />
            ))}
          </HorizontalScroll>
        )}

        {/* Singles */}
        {artist.singles && artist.singles.length > 0 && (
          <HorizontalScroll title="Singles & EPs">
            {artist.singles.map((a) => (
              <MusicCard key={a.id} id={a.id} name={a.name} image={a.image} type="album"
                subtitle={a.year ? String(a.year) : undefined} />
            ))}
          </HorizontalScroll>
        )}

        {/* Similar artists */}
        {artist.similarArtists && artist.similarArtists.length > 0 && (
          <HorizontalScroll title="Fans Also Like">
            {artist.similarArtists.map((a) => (
              <MusicCard key={a.id} id={a.id} name={a.name} image={a.image} type="artist" isRound />
            ))}
          </HorizontalScroll>
        )}

        {/* Bio */}
        {artist.bio && artist.bio.length > 0 && (
          <section className="mb-8 max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-3">About</h2>
            <div className="relative bg-white/[0.04] rounded-xl overflow-hidden">
              {image && (
                <div className="h-32 overflow-hidden">
                  <img src={image} alt="" className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
                </div>
              )}
              <div className="p-5 text-sm text-[#b3b3b3] leading-relaxed space-y-3">
                <p className="text-white font-semibold text-base">
                  {formatPlayCount(artist.followerCount)} followers
                </p>
                {artist.bio.slice(0, showFullBio ? undefined : 1).map((b) => (
                  <p key={b.sequence} className={!showFullBio ? "line-clamp-4" : ""}>{b.text}</p>
                ))}
                {artist.bio.length > 0 && (
                  <button onClick={() => setShowFullBio(!showFullBio)}
                    className="text-white font-semibold text-sm hover:underline">
                    {showFullBio ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
