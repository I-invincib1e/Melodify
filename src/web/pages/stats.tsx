import { useLibraryStore } from "@/lib/libraryStore";
import { useAuthStore } from "@/lib/authStore";
import { Music2, Clock, Trophy, Disc3, TrendingUp, Sparkles } from "lucide-react";
import { decodeHtml, formatDuration } from "@/lib/api";
import type { Song } from "@/lib/api";

export default function StatsPage() {
  const { history } = useLibraryStore();
  const { user } = useAuthStore();

  const totalTime = history.reduce((acc, song) => acc + (song.duration || 0), 0);
  
  // Calculate top artists
  const artistCounts: Record<string, { count: number; name: string }> = {};
  // Calculate top songs
  const songCounts: Record<string, { count: number; song: Song }> = {};

  history.forEach(song => {
    // Song tracking
    if (!songCounts[song.id]) {
      songCounts[song.id] = { count: 0, song };
    }
    songCounts[song.id].count++;

    // Artist tracking
    const artists = song.artists?.primary || [];
    artists.forEach(a => {
      if (a.name) {
        if (!artistCounts[a.id]) artistCounts[a.id] = { count: 0, name: decodeHtml(a.name) };
        artistCounts[a.id].count++;
      }
    });
  });

  const topArtists = Object.values(artistCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  const topSongs = Object.values(songCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 p-6 md:p-10 relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="mb-12 pt-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-primary animate-pulse" size={28} />
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Your Sound.</h1>
          </div>
          <p className="text-[#a7a7a7] text-lg font-medium max-w-lg leading-relaxed">
            {user ? `${user.user_metadata?.full_name || 'Hey'}, h` : 'H'}ere is your personalized listening analysis based on your local history.
          </p>
        </div>

        {history.length < 3 ? (
          <div className="neuglass rounded-2xl p-10 text-center flex flex-col items-center justify-center border-white/5">
            <Disc3 size={48} className="text-[#b3b3b3] mb-4 opacity-50 animate-spin-slow" />
            <h2 className="text-xl font-bold text-white mb-2">Keep Listening!</h2>
            <p className="text-[#727272]">We need a bit more data to calculate your personalized stats. Go discover some new tracks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Total Time Card */}
            <div className="lg:col-span-8 neuglass rounded-2xl p-8 border-t border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full border-4 border-primary/30 border-t-primary flex items-center justify-center animate-[spin_10s_linear_infinite]">
                  <div className="w-28 h-28 rounded-full bg-[#111] flex items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                    <Clock size={40} className="text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Time Spent Listening</p>
                  <p className="text-6xl font-black text-white tracking-tighter tabular-nums mb-2">
                    {Math.floor(totalTime / 60)} <span className="text-xl font-medium text-[#b3b3b3] tracking-normal">Minutes</span>
                  </p>
                  <p className="text-[#727272] text-sm">That's {history.length} distinct track plays!</p>
                </div>
              </div>
            </div>

            {/* Top Song MVP Card */}
            <div className="lg:col-span-4 neuglass rounded-2xl p-8 border-t border-white/5 flex flex-col items-center text-center justify-center relative overflow-hidden bg-gradient-to-b from-[#111] to-[#080808]">
              <Trophy size={32} className="text-amber-400 mb-4" />
              <p className="text-xs font-bold text-amber-400/80 uppercase tracking-widest mb-4">Your #1 Track</p>
              {topSongs[0] && (
                <>
                  <img 
                    src={topSongs[0].song.image?.slice(-1)[0]?.url || ""} 
                    className="w-32 h-32 rounded-lg shadow-2xl shadow-black/50 mb-6 object-cover border border-white/10" 
                    alt="Top Song"
                  />
                  <h3 className="text-xl font-bold text-white mb-1 truncate w-full px-4">{decodeHtml(topSongs[0].song.name)}</h3>
                  <p className="text-sm text-[#b3b3b3]">{topSongs[0].count} plays</p>
                </>
              )}
            </div>

            {/* Top Artists List */}
            <div className="lg:col-span-6 neuglass rounded-2xl p-8 border-t border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-primary" size={24} />
                <h2 className="text-2xl font-bold text-white">Top Artists</h2>
              </div>
              <div className="space-y-4">
                {topArtists.map((artist, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="text-xl font-black text-[#333] w-6">{idx + 1}</div>
                    <div className="relative flex-1 bg-white/5 rounded-full h-12 overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 bottom-0 bg-primary/20 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(artist.count / topArtists[0].count) * 100}%` }}
                      />
                      <div className="absolute inset-x-4 inset-y-0 flex items-center justify-between">
                        <span className="font-semibold text-white z-10">{artist.name}</span>
                        <span className="text-xs font-bold text-primary z-10">{artist.count} plays</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Tracks List */}
            <div className="lg:col-span-6 neuglass rounded-2xl p-8 border-t border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <Music2 className="text-purple-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Songs on Repeat</h2>
              </div>
              <div className="space-y-5">
                {topSongs.map((track, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="text-lg font-black text-[#555] w-4">{idx + 1}</div>
                    <img src={track.song.image?.slice(-2)[0]?.url || ""} className="w-10 h-10 rounded shrink-0 object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{decodeHtml(track.song.name)}</p>
                      <p className="text-[11px] text-[#a7a7a7] truncate">{track.song.artists?.primary?.map(a => decodeHtml(a.name)).join(", ")}</p>
                    </div>
                    <div className="text-xs font-medium text-[#727272] tabular-nums">{track.count} plays</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
