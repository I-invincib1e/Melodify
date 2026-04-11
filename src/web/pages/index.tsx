import { searchSongs, getHighQualityImage, decodeHtml } from "@/lib/api";
import { usePlayerStore, useRecentStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { useRecommendations } from "@/lib/useRecommendations";
import HorizontalScroll from "@/components/horizontal-scroll";
import MusicCard from "@/components/music-card";
import SongRow from "@/components/song-row";
import { Play, Sparkles } from "lucide-react";

export default function HomePage() {
  const { sections, trendingSongs, loading } = useRecommendations();
  const { playSong } = usePlayerStore();
  const { recentSongs } = useRecentStore();
  const { user, profile, preferences } = useAuthStore();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "";
  const quickArtists = preferences?.artist_names?.slice(0, 6) || [
    "Arijit Singh", "Pritam", "Diljit Dosanjh", "AP Dhillon", "Shreya Ghoshal", "A.R. Rahman",
  ];

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
      <div className="flex items-start justify-between mb-5 animate-slide-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {greeting()}{displayName ? `, ${displayName}` : ""}
          </h1>
          {user && preferences?.setup_complete && (
            <p className="text-xs text-[#a7a7a7] mt-1 flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#1db954]" />
              Personalized for you
            </p>
          )}
        </div>
      </div>

      {/* Quick picks */}
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
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Play size={14} fill="black" className="text-black ml-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick artist chips */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
        {quickArtists.map((q) => (
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
