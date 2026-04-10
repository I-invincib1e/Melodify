import { useEffect, useState } from "react";
import { searchSongs, searchAlbums, type Song, type Album, getHighQualityImage, decodeHtml } from "@/lib/api";
import { usePlayerStore, useRecentStore } from "@/lib/store";
import HorizontalScroll from "@/components/horizontal-scroll";
import MusicCard from "@/components/music-card";
import SongRow from "@/components/song-row";
import { Play } from "lucide-react";

const QUICK_ARTISTS = ["Arijit Singh", "Pritam", "Diljit Dosanjh", "AP Dhillon", "Shreya Ghoshal", "A.R. Rahman"];

interface Section {
  title: string;
  subtitle?: string;
  songs?: Song[];
  albums?: Album[];
}

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayerStore();
  const { recentSongs } = useRecentStore();

  useEffect(() => { loadHome(); }, []);

  async function loadHome() {
    try {
      const [trending, arijit, punjabi, romantic, newAlbums, popularAlbums] = await Promise.all([
        searchSongs("top bollywood hits", 0, 12),
        searchSongs("Arijit Singh best", 0, 12),
        searchSongs("Diljit Dosanjh punjabi", 0, 12),
        searchSongs("romantic bollywood songs", 0, 12),
        searchAlbums("bollywood 2025", 0, 12),
        searchAlbums("Pritam", 0, 12),
      ]);

      setTrendingSongs(trending.results || []);
      setSections([
        { title: "Arijit Singh Essentials", subtitle: "His most iconic tracks", songs: arijit?.results },
        { title: "New Releases", subtitle: "Fresh from the studio", albums: newAlbums?.results },
        { title: "Punjabi Fire", subtitle: "Desi beats that hit different", songs: punjabi?.results },
        { title: "Romantic Picks", subtitle: "For the feels", songs: romantic?.results },
        { title: "Popular Albums", subtitle: "What everyone's listening to", albums: popularAlbums?.results },
      ]);
    } catch (err) {
      console.error("Failed to load home:", err);
    } finally {
      setLoading(false);
    }
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-8">
        <div className="h-8 w-56 skeleton-shimmer rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 skeleton-shimmer rounded-md" />
          ))}
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[160px] space-y-3">
              <div className="aspect-square skeleton-shimmer rounded-md" />
              <div className="h-3 skeleton-shimmer rounded w-3/4" />
              <div className="h-3 skeleton-shimmer rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-32">
      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-5 animate-slide-up">
        {greeting()}
      </h1>

      {/* Quick picks — Spotify-style compact row cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-8 stagger-children">
        {(recentSongs.length >= 6 ? recentSongs.slice(0, 6) : trendingSongs.slice(0, 6)).map((song) => {
          const img = getHighQualityImage(song.image);
          return (
            <button
              key={song.id}
              onClick={() => playSong(song, trendingSongs, trendingSongs.findIndex((s) => s.id === song.id))}
              className="group flex items-center bg-white/[0.07] hover:bg-white/[0.13] rounded-md overflow-hidden transition-all duration-200 h-[52px] md:h-[56px]"
            >
              <img src={img} alt="" className="w-[52px] h-[52px] md:w-[56px] md:h-[56px] object-cover shrink-0" />
              <span className="flex-1 text-[13px] font-semibold text-white truncate px-3">
                {decodeHtml(song.name)}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-3">
                <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg">
                  <Play size={14} fill="black" className="text-black ml-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick artist chips */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
        {QUICK_ARTISTS.map((q) => (
          <button
            key={q}
            onClick={() => {
              searchSongs(q, 0, 20).then((res) => {
                if (res.results[0]) playSong(res.results[0], res.results, 0);
              });
            }}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.12] rounded-full text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Trending Songs list */}
      {trendingSongs.length > 0 && (
        <section className="mb-8 animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 px-1">Trending Now</h2>
          <p className="text-xs text-[#a7a7a7] mb-3 px-1">Top tracks across India</p>
          <div className="bg-white/[0.03] rounded-lg overflow-hidden">
            {trendingSongs.slice(0, 8).map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={trendingSongs} showIndex showAlbumName />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic sections — horizontal carousels */}
      {sections.map((section) => {
        if (section.albums && section.albums.length > 0) {
          return (
            <HorizontalScroll key={section.title} title={section.title} subtitle={section.subtitle}>
              {section.albums.map((a) => (
                <MusicCard key={a.id} id={a.id} name={a.name} image={a.image} type="album"
                  subtitle={a.artists?.primary?.map((x) => x.name).join(", ")} />
              ))}
            </HorizontalScroll>
          );
        }
        if (section.songs && section.songs.length > 0) {
          return (
            <HorizontalScroll key={section.title} title={section.title} subtitle={section.subtitle}>
              {section.songs.map((s, i) => (
                <MusicCard key={s.id} id={s.id} name={s.name} image={s.image} type="song"
                  subtitle={s.artists?.primary?.map((x) => x.name).join(", ")}
                  onPlay={() => playSong(s, section.songs!, i)} />
              ))}
            </HorizontalScroll>
          );
        }
        return null;
      })}
    </div>
  );
}
