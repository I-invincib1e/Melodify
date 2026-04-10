import { Heart } from "lucide-react";
import { useLikedStore } from "@/lib/store";
import type { Song } from "@/lib/api";

interface Props {
  song: Song;
  size?: number;
  className?: string;
}

export default function LikeButton({ song, size = 18, className = "" }: Props) {
  const { isLiked, toggleLike } = useLikedStore();
  const liked = isLiked(song.id);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(song);
      }}
      className={`transition-all duration-200 ${liked ? "text-primary scale-110" : "text-[#b3b3b3] hover:text-white hover:scale-110"} ${className}`}
      title={liked ? "Remove from Liked" : "Save to Liked"}
    >
      <Heart size={size} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}
