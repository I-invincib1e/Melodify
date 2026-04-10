import { getHighQualityImage, decodeHtml } from "@/lib/api";
import type { ImageQuality } from "@/lib/api";
import { Play } from "lucide-react";
import { useLocation } from "wouter";

interface Props {
  id: string;
  name?: string;
  title?: string;
  image: ImageQuality[];
  type: string;
  subtitle?: string;
  isRound?: boolean;
  onPlay?: () => void;
  className?: string;
}

export default function MusicCard({ id, name, title, image, type, subtitle, isRound, onPlay, className }: Props) {
  const [, setLocation] = useLocation();
  const img = getHighQualityImage(image);
  const displayName = decodeHtml(name || title || "");
  const displaySub = subtitle ? decodeHtml(subtitle) : "";

  const handleClick = () => {
    if (onPlay) return onPlay();
    if (type === "artist") setLocation(`/artist/${id}`);
    else if (type === "album") setLocation(`/album/${id}`);
    else if (type === "playlist") setLocation(`/playlist/${id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`group flex-shrink-0 w-[160px] md:w-[180px] neuglass hover:bg-white/5 rounded-2xl p-3 transition-all duration-300 text-left cursor-pointer shadow-none ${className || ""}`}
    >
      <div className="relative mb-3">
        <img
          src={img}
          alt={displayName}
          className={`w-full aspect-square object-cover shadow-lg shadow-black/40 transition-transform duration-300 group-hover:shadow-black/60 ${
            isRound ? "rounded-full" : "rounded-md"
          }`}
          loading="lazy"
        />
        {/* Play button overlay */}
        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-105 transition-transform hover:brightness-110">
            <Play size={20} fill="black" className="text-black ml-0.5" />
          </div>
        </div>
      </div>
      <p className="text-[13px] font-semibold text-white truncate leading-tight">{displayName}</p>
      {displaySub && (
        <p className="text-[11px] text-[#a7a7a7] mt-1 line-clamp-2 leading-snug">{displaySub}</p>
      )}
    </button>
  );
}
