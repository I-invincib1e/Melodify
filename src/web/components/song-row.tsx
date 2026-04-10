import { Play } from "lucide-react";
import { getHighQualityImage, formatDuration, decodeHtml, formatPlayCount } from "@/lib/api";
import type { Song } from "@/lib/api";
import { usePlayerStore } from "@/lib/store";
import LikeButton from "./like-button";
import PlaylistMenu from "./playlist-menu";
import DownloadButton from "./download-button";
import Equalizer from "./equalizer";
import { useLocation } from "wouter";

interface Props {
  song: Song;
  index?: number;
  queue?: Song[];
  showAlbumArt?: boolean;
  showIndex?: boolean;
  showAlbumName?: boolean;
  compact?: boolean;
}

export default function SongRow({ song, index = 0, queue, showAlbumArt = true, showIndex = false, showAlbumName = false, compact = false }: Props) {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayerStore();
  const [, setLocation] = useLocation();
  const isCurrentSong = currentSong?.id === song.id;
  const image = getHighQualityImage(song.image);
  const artistNames = song.artists?.primary?.map((a) => decodeHtml(a.name)).join(", ") || "";
  const songName = decodeHtml(song.name);
  const albumName = song.album?.name ? decodeHtml(song.album.name) : "";

  const handlePlay = () => {
    if (isCurrentSong) togglePlay();
    else playSong(song, queue || [song], queue ? index : 0);
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-md hover:bg-white/[0.07] transition-all duration-200 cursor-pointer ${
        isCurrentSong ? "bg-white/[0.04]" : ""
      } ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}
      onClick={handlePlay}
    >
      {/* Index / equalizer / play */}
      <div className="w-7 flex items-center justify-center shrink-0">
        {isCurrentSong && isPlaying ? (
          <Equalizer />
        ) : (
          <>
            {showIndex && (
              <span className={`text-sm tabular-nums group-hover:hidden ${isCurrentSong ? "text-primary" : "text-[#b3b3b3]"}`}>
                {index + 1}
              </span>
            )}
            <Play
              size={14}
              fill="white"
              className={`text-white ${showIndex ? "hidden group-hover:block" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
            />
          </>
        )}
      </div>

      {/* Album art */}
      {showAlbumArt && image && (
        <img
          src={image}
          alt=""
          className={`rounded object-cover shrink-0 ${compact ? "w-9 h-9" : "w-10 h-10"}`}
          loading="lazy"
        />
      )}

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate leading-tight ${isCurrentSong ? "text-primary" : "text-white"}`}>
          {songName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {song.explicitContent && <span className="badge-explicit">E</span>}
          <p className="text-[11px] text-[#a7a7a7] truncate">{artistNames}</p>
        </div>
      </div>

      {/* Album name (wide screens) */}
      {showAlbumName && albumName && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (song.album?.id) setLocation(`/album/${song.album.id}`);
          }}
          className="hidden lg:block text-[11px] text-[#a7a7a7] hover:text-white hover:underline truncate max-w-[200px] transition-colors text-left"
        >
          {albumName}
        </button>
      )}

      {/* Play count */}
      {song.playCount && !compact && (
        <span className="text-[11px] text-[#a7a7a7] hidden md:block tabular-nums w-16 text-right">
          {formatPlayCount(song.playCount)}
        </span>
      )}

      {/* Like, Playlist, Offline */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        <DownloadButton song={song} />
        <LikeButton song={song} size={16} />
        <PlaylistMenu song={song} />
      </div>

      {/* Duration */}
      <span className="text-[11px] text-[#a7a7a7] w-10 text-right tabular-nums shrink-0">
        {formatDuration(song.duration)}
      </span>
    </div>
  );
}
