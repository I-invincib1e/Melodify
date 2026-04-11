import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Check, Search, Loader as Loader2, Music2, ArrowRight, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";
import { searchArtists, getHighQualityImage, type Artist } from "@/lib/api";

const GENRES = [
  { key: "hindi", label: "Hindi", icon: "🎵" },
  { key: "punjabi", label: "Punjabi", icon: "🥁" },
  { key: "romantic", label: "Romantic", icon: "💕" },
  { key: "pop", label: "Pop", icon: "🎤" },
  { key: "electronic", label: "Electronic", icon: "🎧" },
  { key: "classical", label: "Classical", icon: "🎻" },
  { key: "sufi", label: "Sufi", icon: "🌙" },
  { key: "devotional", label: "Devotional", icon: "🙏" },
  { key: "rap", label: "Rap / Hip-Hop", icon: "🎙️" },
  { key: "party", label: "Party", icon: "🎉" },
  { key: "sad", label: "Sad / Emotional", icon: "🌧️" },
  { key: "retro", label: "Retro / Old", icon: "📻" },
];

const POPULAR_ARTISTS = ["Arijit Singh", "Shreya Ghoshal", "A.R. Rahman", "Pritam", "Diljit Dosanjh", "AP Dhillon", "Badshah", "Neha Kakkar"];

interface ArtistEntry { id: string; name: string; imageUrl: string }

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<ArtistEntry[]>([]);
  const [artistSearch, setArtistSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ArtistEntry[]>([]);
  const [popularArtists, setPopularArtists] = useState<ArtistEntry[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, setLocation] = useLocation();
  const { user, loading, fetchPreferences } = useAuthStore();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) setLocation("/auth");
  }, [user, loading]);

  useEffect(() => {
    Promise.all(
      POPULAR_ARTISTS.map((name) => searchArtists(name, 0, 1).then((r) => r.results[0]).catch(() => null))
    ).then((results) => {
      setPopularArtists(results.filter(Boolean).map((a) => ({ id: a!.id, name: a!.name, imageUrl: getHighQualityImage(a!.image) })));
    });
  }, []);

  useEffect(() => {
    if (!artistSearch.trim()) { setSearchResults([]); return; }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchArtists(artistSearch, 0, 8);
        setSearchResults(res.results.map((a: Artist) => ({ id: a.id, name: a.name, imageUrl: getHighQualityImage(a.image) })));
      } catch {}
      setSearchLoading(false);
    }, 400);
  }, [artistSearch]);

  function toggleGenre(key: string) {
    setSelectedGenres((p) => p.includes(key) ? p.filter((g) => g !== key) : [...p, key]);
  }

  function toggleArtist(artist: ArtistEntry) {
    setSelectedArtists((p) => p.find((a) => a.id === artist.id) ? p.filter((a) => a.id !== artist.id) : [...p, artist]);
  }

  async function savePreferences() {
    if (!user) return;
    setSaving(true);
    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      genres: selectedGenres,
      artist_ids: selectedArtists.map((a) => a.id),
      artist_names: selectedArtists.map((a) => a.name),
      setup_complete: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    await fetchPreferences();
    setSaving(false);
    setLocation("/");
  }

  const displayArtists = artistSearch.trim() ? searchResults : popularArtists;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-4 pt-10 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#1db954]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#1db954]/4 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center">
            <Music2 size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white">Melodify</span>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 rounded-full flex-1 transition-all duration-500 ${s <= step ? "bg-[#1db954]" : "bg-white/10"}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">What do you love listening to?</h1>
            <p className="text-[#a7a7a7] mb-8">Pick at least 3 genres to personalize your feed</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {GENRES.map((genre) => {
                const selected = selectedGenres.includes(genre.key);
                return (
                  <button key={genre.key} onClick={() => toggleGenre(genre.key)}
                    className={`relative flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-200 text-left ${selected ? "border-[#1db954] bg-[#1db954]/10" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20"}`}>
                    <span className="text-2xl">{genre.icon}</span>
                    <span className={`text-sm font-semibold ${selected ? "text-white" : "text-[#ccc]"}`}>{genre.label}</span>
                    {selected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1db954] flex items-center justify-center"><Check size={12} className="text-black" strokeWidth={3} /></div>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(2)} disabled={selectedGenres.length < 3}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
              Next: Pick Artists <ArrowRight size={18} />
            </button>
            <p className="text-center text-xs text-[#555] mt-3">
              {selectedGenres.length < 3 ? `Select ${3 - selectedGenres.length} more` : `${selectedGenres.length} selected`}
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Who do you listen to?</h1>
            <p className="text-[#a7a7a7] mb-6">Pick at least 3 artists</p>

            <div className="relative mb-5">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
              <input type="text" value={artistSearch} onChange={(e) => setArtistSearch(e.target.value)} placeholder="Search for an artist..."
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#1db954]/60 transition-all" />
              {searchLoading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] animate-spin" />}
            </div>

            {selectedArtists.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedArtists.map((artist) => (
                  <div key={artist.id} className="flex items-center gap-1.5 bg-[#1db954]/15 border border-[#1db954]/30 rounded-full px-3 py-1.5">
                    <span className="text-xs font-semibold text-[#1db954]">{artist.name}</span>
                    <button onClick={() => toggleArtist(artist)} className="text-[#1db954]/70 hover:text-[#1db954]"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-10 max-h-[360px] overflow-y-auto pr-1">
              {displayArtists.map((artist) => {
                const selected = selectedArtists.some((a) => a.id === artist.id);
                return (
                  <button key={artist.id} onClick={() => toggleArtist(artist)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${selected ? "border-[#1db954] bg-[#1db954]/10" : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15"}`}>
                    <div className="relative shrink-0">
                      <img src={artist.imageUrl} alt={artist.name} className="w-12 h-12 rounded-full object-cover bg-white/5"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?w=100"; }} />
                      {selected && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1db954] flex items-center justify-center"><Check size={10} className="text-black" strokeWidth={3} /></div>}
                    </div>
                    <span className={`text-sm font-semibold truncate ${selected ? "text-white" : "text-[#ccc]"}`}>{artist.name}</span>
                  </button>
                );
              })}
              {artistSearch && searchResults.length === 0 && !searchLoading && (
                <div className="col-span-2 text-center py-8 text-[#555] text-sm">No artists found</div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-4 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-all">Back</button>
              <button onClick={savePreferences} disabled={selectedArtists.length < 3 || saving}
                className="flex-1 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <>Start Listening <ArrowRight size={18} /></>}
              </button>
            </div>
            <p className="text-center text-xs text-[#555] mt-3">
              {selectedArtists.length < 3 ? `Select ${3 - selectedArtists.length} more` : `${selectedArtists.length} selected`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
