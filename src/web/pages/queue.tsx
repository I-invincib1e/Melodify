import { usePlayerStore } from "@/lib/store";
import { decodeHtml, getHighQualityImage, formatDuration } from "@/lib/api";
import Equalizer from "@/components/equalizer";
import LikeButton from "@/components/like-button";
import { ArrowLeft, X, Trash2, Music, GripVertical } from "lucide-react";

export default function QueuePage() {
  const { queue, queueIndex, currentSong, isPlaying, playFromQueue, removeFromQueue, clearQueue } = usePlayerStore();
  const upNext = queue.slice(queueIndex + 1);

  return (
    <div className="p-4 md:p-6 pb-32 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Queue</h1>
        </div>
        {queue.length > 0 && (
          <button onClick={clearQueue}
            className="flex items-center gap-1.5 text-sm text-[#b3b3b3] hover:text-white transition-colors font-medium">
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {/* Now playing */}
      {currentSong && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider mb-3">Now Playing</h2>
          <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.05] rounded-lg border border-white/[0.04]">
            {isPlaying ? <Equalizer /> : <div className="w-3" />}
            <img src={getHighQualityImage(currentSong.image)} alt=""
              className={`w-14 h-14 rounded-md object-cover shadow-lg transition-shadow ${isPlaying ? "shadow-[#1DB954]/20" : ""}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1DB954] truncate">{decodeHtml(currentSong.name)}</p>
              <p className="text-xs text-[#a7a7a7] truncate mt-0.5">
                {currentSong.artists?.primary?.map((a) => decodeHtml(a.name)).join(", ")}
              </p>
            </div>
            <LikeButton song={currentSong} size={18} />
            <span className="text-xs text-[#a7a7a7] tabular-nums">{formatDuration(currentSong.duration)}</span>
          </div>
        </section>
      )}

      {/* Up next */}
      {upNext.length > 0 ? (
        <section>
          <h2 className="text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider mb-3">
            Next Up · {upNext.length} song{upNext.length !== 1 ? "s" : ""}
          </h2>
          <div className="space-y-0.5 stagger-children">
            {upNext.map((song, i) => {
              const actualIndex = queueIndex + 1 + i;
              return (
                <div key={`${song.id}-${actualIndex}`}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/[0.07] cursor-pointer transition-all"
                  onClick={() => playFromQueue(actualIndex)}>
                  <span className="w-6 text-center text-sm text-[#a7a7a7] tabular-nums">{i + 1}</span>
                  <img src={getHighQualityImage(song.image)} alt=""
                    className="w-10 h-10 rounded object-cover shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{decodeHtml(song.name)}</p>
                    <p className="text-[11px] text-[#a7a7a7] truncate mt-0.5">
                      {song.artists?.primary?.map((a) => decodeHtml(a.name)).join(", ")}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <LikeButton song={song} size={16} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFromQueue(actualIndex); }}
                    className="opacity-0 group-hover:opacity-100 text-[#a7a7a7] hover:text-white transition-all p-1">
                    <X size={16} />
                  </button>
                  <span className="text-[11px] text-[#a7a7a7] tabular-nums w-10 text-right">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mb-5">
            <Music size={36} className="text-[#727272]" />
          </div>
          <p className="text-lg font-semibold text-white mb-1">Queue is empty</p>
          <p className="text-sm text-[#a7a7a7]">Add songs from search or browse to build your queue</p>
        </div>
      )}
    </div>
  );
}
