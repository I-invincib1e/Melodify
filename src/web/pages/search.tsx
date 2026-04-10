import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { globalSearch, searchSongs, getHighQualityImage, decodeHtml, type SearchResult, type Song } from "@/lib/api";
import { usePlayerStore, useSearchHistoryStore } from "@/lib/store";
import SongRow from "@/components/song-row";
import MusicCard from "@/components/music-card";
import HorizontalScroll from "@/components/horizontal-scroll";
import { Play } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORIES = [
  { name: "Bollywood", emoji: "🎬", color: "#E13300", query: "bollywood hits" },
  { name: "Pop", emoji: "🎤", color: "#8C67AB", query: "pop songs" },
  { name: "Punjabi", emoji: "🔥", color: "#1E3264", query: "punjabi hits" },
  { name: "Romantic", emoji: "💕", color: "#E61E32", query: "romantic songs" },
  { name: "Hip Hop", emoji: "🎧", color: "#BA5D07", query: "hip hop india" },
  { name: "Classical", emoji: "🎻", color: "#477D95", query: "indian classical" },
  { name: "Devotional", emoji: "🙏", color: "#FF6437", query: "devotional songs" },
  { name: "Tamil", emoji: "🎵", color: "#509BF5", query: "tamil songs" },
  { name: "Telugu", emoji: "🌟", color: "#0D73EC", query: "telugu hits" },
  { name: "EDM", emoji: "⚡", color: "#E8115B", query: "edm party" },
  { name: "Indie", emoji: "🎸", color: "#148A08", query: "indie india" },
  { name: "Lofi", emoji: "🌙", color: "#7358FF", query: "lofi chill" },
];

type Tab = "all" | "songs" | "albums" | "artists";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { playSong } = usePlayerStore();
  const { history: searchHistory, addSearch, clearHistory } = useSearchHistoryStore();
  const [, setLocation] = useLocation();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); setSongResults([]); return; }
    setLoading(true);
    try {
      const [global, songs] = await Promise.all([globalSearch(q), searchSongs(q, 0, 30)]);
      setResults(global);
      setSongResults(songs.results || []);
      addSearch(q);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [addSearch]);

  const handleInput = (value: string) => {
    setQuery(value);
    setActiveTab("all");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 350);
  };

  const handleCategory = async (cat: typeof CATEGORIES[0]) => {
    setQuery(cat.query);
    setActiveTab("all");
    doSearch(cat.query);
  };

  const hasResults = results && (songResults.length > 0 || (results.albums?.results?.length ?? 0) > 0 || (results.artists?.results?.length ?? 0) > 0);
  const topResult = results?.topQuery?.results?.[0] || results?.songs?.results?.[0];

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "songs", label: "Songs" },
    { key: "albums", label: "Albums" },
    { key: "artists", label: "Artists" },
  ];

  return (
    <div className="p-4 md:p-6 pb-32">
      {/* Search Bar */}
      <div className="relative mb-5 max-w-xl animate-slide-up">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727272]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          className="w-full h-12 pl-12 pr-10 bg-[#242424] hover:bg-[#2a2a2a] rounded-full text-sm text-white placeholder:text-[#727272] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); setSongResults([]); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 skeleton-shimmer rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-3 skeleton-shimmer rounded w-1/3" />
                <div className="h-2.5 skeleton-shimmer rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No query — recent searches + categories */}
      {!query && !loading && (
        <div className="animate-fade-in space-y-6">
          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock size={18} /> Recent Searches
                </h2>
                <button onClick={clearHistory} className="text-xs text-[#b3b3b3] hover:text-white font-semibold">Clear all</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((q) => (
                  <button key={q} onClick={() => { setQuery(q); doSearch(q); }}
                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-full text-sm text-white transition-colors">
                    <Clock size={14} className="text-[#a7a7a7]" /> {q}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Categories */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Browse All</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger-children">
              {CATEGORIES.map((cat) => (
                <button key={cat.name} onClick={() => handleCategory(cat)}
                  className="relative h-24 md:h-28 rounded-lg overflow-hidden text-left p-4 font-bold text-white hover:scale-[1.02] transition-transform shadow-lg"
                  style={{ backgroundColor: cat.color }}>
                  <span className="text-2xl block mb-1">{cat.emoji}</span>
                  <span className="text-sm md:text-base">{cat.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === tab.key ? "bg-white text-black" : "bg-white/[0.07] text-white hover:bg-white/[0.12]"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* All tab — top result + songs side by side */}
          {activeTab === "all" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-5">
                {/* Top result card */}
                {topResult && (
                  <section>
                    <h3 className="text-sm font-semibold text-[#b3b3b3] uppercase mb-3">Top Result</h3>
                    <button
                      onClick={() => {
                        if (songResults[0]) playSong(songResults[0], songResults, 0);
                      }}
                      className="group w-full bg-white/[0.05] hover:bg-white/[0.1] rounded-lg p-5 text-left transition-all duration-200 relative"
                    >
                      <img src={getHighQualityImage(topResult.image)} alt=""
                        className={`w-24 h-24 object-cover shadow-xl mb-4 ${topResult.type === "artist" ? "rounded-full" : "rounded-md"}`} />
                      <p className="text-2xl font-bold text-white truncate mb-1">
                        {decodeHtml(topResult.title || topResult.name || "")}
                      </p>
                      <p className="text-sm text-[#a7a7a7]">
                        {topResult.type === "artist" ? "Artist" : topResult.description ? decodeHtml(topResult.description) : "Song"}
                      </p>
                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-xl hover:scale-105">
                          <Play size={22} fill="black" className="text-black ml-0.5" />
                        </div>
                      </div>
                    </button>
                  </section>
                )}

                {/* Top songs */}
                {songResults.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-[#b3b3b3] uppercase mb-3">Songs</h3>
                    <div className="space-y-0.5">
                      {songResults.slice(0, 5).map((song, i) => (
                        <SongRow key={song.id} song={song} index={i} queue={songResults} compact />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* More songs below */}
              {songResults.length > 5 && (
                <section>
                  <div className="bg-white/[0.03] rounded-lg">
                    {songResults.slice(5).map((song, i) => (
                      <SongRow key={song.id} song={song} index={i + 5} queue={songResults} showAlbumName />
                    ))}
                  </div>
                </section>
              )}

              {/* Albums carousel */}
              {results?.albums?.results && results.albums.results.length > 0 && (
                <HorizontalScroll title="Albums">
                  {results.albums.results.map((a) => (
                    <MusicCard key={a.id} id={a.id} name={a.name || a.title} image={a.image} type="album"
                      subtitle={a.artist || a.description} />
                  ))}
                </HorizontalScroll>
              )}

              {/* Artists carousel */}
              {results?.artists?.results && results.artists.results.length > 0 && (
                <HorizontalScroll title="Artists">
                  {results.artists.results.map((a) => (
                    <MusicCard key={a.id} id={a.id} name={a.name || a.title} image={a.image} type="artist"
                      subtitle={a.description} isRound />
                  ))}
                </HorizontalScroll>
              )}
            </div>
          )}

          {/* Songs tab */}
          {activeTab === "songs" && songResults.length > 0 && (
            <div className="bg-white/[0.03] rounded-lg">
              {songResults.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} queue={songResults} showIndex showAlbumName />
              ))}
            </div>
          )}

          {/* Albums tab */}
          {activeTab === "albums" && results?.albums?.results && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children">
              {results.albums.results.map((a) => (
                <MusicCard key={a.id} id={a.id} name={a.name || a.title} image={a.image} type="album"
                  subtitle={a.artist || a.description} className="!w-full" />
              ))}
            </div>
          )}

          {/* Artists tab */}
          {activeTab === "artists" && results?.artists?.results && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children">
              {results.artists.results.map((a) => (
                <MusicCard key={a.id} id={a.id} name={a.name || a.title} image={a.image} type="artist"
                  subtitle={a.description} isRound className="!w-full" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && query && !hasResults && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <Search size={48} className="text-[#727272] mb-4" />
          <p className="text-lg font-semibold text-white">No results for "{query}"</p>
          <p className="text-sm text-[#b3b3b3] mt-1">Check your spelling or try different keywords</p>
        </div>
      )}
    </div>
  );
}
