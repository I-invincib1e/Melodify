import { useLibraryStore } from "@/lib/libraryStore";
import { Play, Clock } from "lucide-react";
import SongRow from "@/components/song-row";
import { usePlayerStore } from "@/lib/store";

export default function HistoryPage() {
  const { history, clearHistory } = useLibraryStore();
  const { playSong } = usePlayerStore();

  const handlePlayAll = () => {
    if (history.length > 0) {
      playSong(history[0], history, 0);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8 pt-10">
          <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/80 to-blue-600 rounded-xl flex items-center justify-center">
             <Clock size={80} className="text-white opacity-80" />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-white">Playlist</span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">Recently Played</h1>
            <p className="text-[#a7a7a7] text-sm font-medium mt-1">
              Your personal listening history
              <span className="mx-2">•</span>
              {history.length} songs
            </p>
          </div>
        </div>

        {history.length > 0 ? (
          <>
            <div className="flex items-center gap-6 mb-8">
              <button
                onClick={handlePlayAll}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/30"
              >
                <Play size={28} fill="black" className="text-black ml-1" />
              </button>
              <button 
                onClick={clearHistory}
                className="text-sm font-medium text-[#b3b3b3] hover:text-white transition-colors uppercase tracking-wider"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-1 pb-32">
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-white/10 text-xs text-[#a7a7a7] uppercase tracking-wider font-semibold mb-3">
                <span className="w-8 text-center">#</span>
                <span>Title</span>
                <span className="hidden md:block">Album</span>
                <span className="w-12 text-center"><Clock size={16} /></span>
              </div>
              
              {history.map((song, idx) => (
                <SongRow
                  key={`${song.id}-${idx}`}
                  song={song}
                  index={idx}
                  queue={history}
                  showAlbumArt={true}
                  showIndex={true}
                  showAlbumName={true}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20">
            <Clock size={48} className="text-[#b3b3b3] mb-4 opacity-50" />
            <p className="text-[#b3b3b3] text-lg font-medium">You haven't played anything yet</p>
            <p className="text-[#727272] text-sm mt-2">Listen to some tracks and they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
