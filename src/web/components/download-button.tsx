import { useState, useEffect } from "react";
import { DownloadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { isAudioCached, cacheAudio, removeCachedAudio } from "@/lib/offlineStore";
import { getBestDownloadUrl } from "@/lib/api";
import type { Song } from "@/lib/api";

export default function DownloadButton({ song }: { song: Song }) {
  const [status, setStatus] = useState<"none" | "downloading" | "cached">("none");

  useEffect(() => {
    isAudioCached(song.id).then(cached => {
      setStatus(cached ? "cached" : "none");
    });
  }, [song.id]);

  const handleDownloadToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (status === "cached") {
      await removeCachedAudio(song.id);
      setStatus("none");
      return;
    }
    
    const url = getBestDownloadUrl(song.downloadUrl);
    if (!url) return;

    setStatus("downloading");
    const success = await cacheAudio(song.id, url);
    setStatus(success ? "cached" : "none");
  };

  if (status === "downloading") {
    return (
      <div className="p-1.5 text-primary" title="Downloading...">
        <Loader2 size={16} className="animate-spin" />
      </div>
    );
  }

  return (
    <button
      onClick={handleDownloadToggle}
      className={`p-1.5 transition-colors rounded-full hover:bg-white/10 ${
        status === "cached" ? "text-primary" : "text-[#b3b3b3] hover:text-white"
      }`}
      title={status === "cached" ? "Remove from Offline Cache" : "Download for Offline Listening"}
    >
      {status === "cached" ? <CheckCircle2 size={16} /> : <DownloadCloud size={16} />}
    </button>
  );
}
