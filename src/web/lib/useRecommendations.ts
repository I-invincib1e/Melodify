import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useAuthStore } from "./authStore";
import { searchSongs, searchAlbums, getArtistSongs, type Song, type Album } from "./api";

export interface RecommendationSection {
  title: string;
  subtitle: string;
  songs?: Song[];
  albums?: Album[];
}

const GENRE_QUERIES: Record<string, { query: string; label: string; subtitle: string }> = {
  hindi: { query: "top bollywood hindi songs", label: "Hindi Hits", subtitle: "Best of Bollywood" },
  punjabi: { query: "best punjabi hits 2024", label: "Punjabi Fire", subtitle: "Desi beats that hit different" },
  romantic: { query: "romantic bollywood love songs", label: "Romantic Picks", subtitle: "For the feels" },
  pop: { query: "indian pop songs hits", label: "Pop Essentials", subtitle: "Fresh pop sounds" },
  electronic: { query: "electronic EDM indian songs", label: "Electronic Vibes", subtitle: "Electronic beats" },
  classical: { query: "indian classical music instrumental", label: "Classical", subtitle: "Timeless melodies" },
  sufi: { query: "sufi spiritual songs hits", label: "Sufi Soul", subtitle: "Spiritual & soulful" },
  devotional: { query: "devotional bhajans songs", label: "Devotional", subtitle: "Sacred sounds" },
  rap: { query: "hindi rap hip hop songs", label: "Rap & Hip-Hop", subtitle: "Indian hip-hop scene" },
  party: { query: "party dance bollywood songs", label: "Party Anthems", subtitle: "Turn it up" },
  sad: { query: "sad emotional hindi songs", label: "Emotional Picks", subtitle: "For those moments" },
  retro: { query: "retro old bollywood classic songs", label: "Retro Gold", subtitle: "Timeless classics" },
};

async function getTopArtistsFromHistory(userId: string): Promise<{ id: string; name: string }[]> {
  const { data } = await supabase
    .from("listening_history")
    .select("song_data")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(100);

  if (!data || data.length === 0) return [];
  const artistCount: Record<string, { id: string; name: string; count: number }> = {};
  for (const row of data) {
    const song = row.song_data as Record<string, unknown>;
    const artists = (song.artists as { primary?: Array<{ id: string; name: string }> })?.primary || [];
    for (const a of artists) {
      if (!a.id) continue;
      if (!artistCount[a.id]) artistCount[a.id] = { id: a.id, name: a.name, count: 0 };
      artistCount[a.id].count++;
    }
  }
  return Object.values(artistCount).sort((a, b) => b.count - a.count).slice(0, 3).map(({ id, name }) => ({ id, name }));
}

export function useRecommendations() {
  const { user, preferences } = useAuthStore();
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      loadDefaultHome();
    } else {
      loadPersonalizedHome();
    }
  }, [user?.id, preferences?.setup_complete]);

  async function loadDefaultHome() {
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
    } catch {}
    setLoading(false);
  }

  async function loadPersonalizedHome() {
    setLoading(true);
    try {
      const prefs = preferences;
      const builtSections: RecommendationSection[] = [];

      const [trendingRes, newAlbumsRes] = await Promise.all([
        searchSongs("top bollywood hits", 0, 12),
        searchAlbums("bollywood 2025", 0, 12),
      ]);
      setTrendingSongs(trendingRes.results || []);

      const artistPromises: Promise<RecommendationSection | null>[] = [];

      if (prefs && prefs.artist_ids.length > 0) {
        for (let i = 0; i < Math.min(prefs.artist_ids.length, 3); i++) {
          const id = prefs.artist_ids[i];
          const name = prefs.artist_names[i];
          artistPromises.push(
            getArtistSongs(id, 0)
              .then((res) => ({ title: `Because you like ${name}`, subtitle: `More from ${name}`, songs: res.songs?.slice(0, 12), type: "artist" as const }))
              .catch(() => null)
          );
        }
      }

      const historyArtists = user ? await getTopArtistsFromHistory(user.id) : [];
      for (const a of historyArtists.slice(0, 2)) {
        artistPromises.push(
          getArtistSongs(a.id, 0)
            .then((res) => ({ title: `More like ${a.name}`, subtitle: "Based on your recent plays", songs: res.songs?.slice(0, 12) }))
            .catch(() => null)
        );
      }

      const artistSections = (await Promise.all(artistPromises)).filter(
        (s): s is RecommendationSection => s !== null && (s.songs?.length ?? 0) > 0
      );

      const genresToLoad = prefs?.genres?.slice(0, 3) || ["hindi", "romantic", "punjabi"];
      const genreSections = (await Promise.all(
        genresToLoad.map((genre) => {
          const cfg = GENRE_QUERIES[genre];
          if (!cfg) return Promise.resolve(null);
          return searchSongs(cfg.query, 0, 12)
            .then((res) => ({ title: cfg.label, subtitle: cfg.subtitle, songs: res.results }))
            .catch(() => null);
        })
      )).filter((s): s is RecommendationSection => s !== null && (s.songs?.length ?? 0) > 0);

      builtSections.push(...artistSections.slice(0, 3));
      builtSections.push({ title: "New Releases", subtitle: "Fresh from the studio", albums: newAlbumsRes?.results });
      builtSections.push(...genreSections);
      setSections(builtSections);
    } catch {
      await loadDefaultHome();
      return;
    }
    setLoading(false);
  }

  return { sections, trendingSongs, loading };
}
