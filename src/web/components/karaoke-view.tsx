import { useEffect, useState, useRef } from "react";
import { usePlayerStore } from "@/lib/store";
import { fetchLyrics } from "@/lib/lyrics";
import { decodeHtml } from "@/lib/api";

export default function KaraokeView() {
  const { currentSong, currentTime, dominantColor } = usePlayerStore();
  const [lyrics, setLyrics] = useState<{time: number, text: string}[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track active index physically to prevent excessive scroll calls
  const [lastActive, setLastActive] = useState(-1);

  useEffect(() => {
    if (!currentSong) return;
    setLyrics(null);
    const artist = currentSong.artists?.primary?.[0]?.name || "";
    fetchLyrics(decodeHtml(currentSong.name), decodeHtml(artist)).then(setLyrics);
  }, [currentSong]);

  let activeIndex = -1;
  if (lyrics) {
      activeIndex = lyrics.findIndex((l, i) => {
        const nextLine = lyrics[i + 1];
        return currentTime >= l.time && (!nextLine || currentTime < nextLine.time);
      });
  }

  useEffect(() => {
    if (activeIndex !== lastActive && containerRef.current) {
        setLastActive(activeIndex);
        const activeItem = containerRef.current.querySelector('.lyric-active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [activeIndex, lastActive]);

  if (!lyrics || lyrics.length === 0) {
      return (
          <div className="flex w-full h-full items-center justify-center pointer-events-none">
              <p className="text-[#a7a7a7] text-lg font-medium opacity-50">Instrumental / No synced lyrics</p>
          </div>
      );
  }

  return (
    <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar" 
         style={{ WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
      <div ref={containerRef} className="py-[40vh] px-10 md:px-20 lg:px-32 flex flex-col gap-8 md:gap-10">
        {lyrics.map((line, index) => {
          const isActive = index === activeIndex;
          const isPassed = index < activeIndex;
          
          let dynamicStyle = {};
          if (isActive && dominantColor) {
              dynamicStyle = {
                 color: `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`,
                 textShadow: `0 0 15px rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.8)`
              };
          }

          return (
            <p 
              key={index} 
              style={dynamicStyle}
              className={`text-3xl lg:text-5xl font-extrabold transition-all duration-500 ease-out leading-snug ${
                isActive ? "scale-[1.03] opacity-100 lyric-active" : 
                isPassed ? "text-white/50 scale-100 opacity-60" : 
                "text-white/20 scale-95 opacity-40 mix-blend-overlay"
              } ${isActive && !dominantColor ? "text-primary drop-shadow-[0_0_12px_rgba(140,225,255,0.8)]" : ""}`}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
