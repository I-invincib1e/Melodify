import { getHighQualityImage, decodeHtml } from "@/lib/api";
import type { ImageQuality } from "@/lib/api";
import { Play } from "lucide-react";
import { useLocation } from "wouter";

interface CardItem {
  id: string;
  name?: string;
  title?: string;
  image: ImageQuality[];
  type: string;
  description?: string;
  artist?: string;
  primaryArtists?: string;
  year?: string | number | null;
}

interface Props {
  items: CardItem[];
  title?: string;
  type?: "song" | "album" | "artist" | "playlist";
  onPlay?: (item: CardItem) => void;
}

export default function CardGrid({ items, title, type, onPlay }: Props) {
  const [, setLocation] = useLocation();

  if (!items || items.length === 0) return null;

  const handleClick = (item: CardItem) => {
    if (type === "artist") {
      setLocation(`/artist/${item.id}`);
    } else if (type === "album" || item.type === "album") {
      setLocation(`/album/${item.id}`);
    } else if (type === "playlist" || item.type === "playlist") {
      setLocation(`/playlist/${item.id}`);
    } else if (onPlay) {
      onPlay(item);
    }
  };

  return (
    <section className="mb-8 animate-fade-in">
      {title && <h2 className="text-xl font-bold text-white mb-4 px-1">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const image = getHighQualityImage(item.image);
          const name = decodeHtml(item.name || item.title || "");
          const subtitle = item.artist || item.primaryArtists || item.description || (item.year ? String(item.year) : "");
          const isArtist = type === "artist" || item.type === "artist";

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="group bg-[#181818] hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 text-left cursor-pointer"
            >
              <div className="relative mb-3">
                <img
                  src={image}
                  alt={name}
                  className={`w-full aspect-square object-cover shadow-lg ${
                    isArtist ? "rounded-full" : "rounded-md"
                  }`}
                  loading="lazy"
                />
                <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-[#1ed760]">
                    <Play size={20} fill="black" className="text-black ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-white truncate">{name}</p>
              {subtitle && (
                <p className="text-xs text-[#b3b3b3] truncate mt-0.5 line-clamp-2">
                  {decodeHtml(subtitle)}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
