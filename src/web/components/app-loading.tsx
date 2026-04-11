import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";

interface Props {
  initialized: boolean;
  onDone: () => void;
}

const BAR_HEIGHTS = [24, 40, 54, 36, 58, 46, 32, 50, 42, 56, 34, 48];
const BAR_DURS = [0.6, 0.75, 0.55, 0.7, 0.5, 0.65, 0.8, 0.58, 0.72, 0.52, 0.68, 0.62];

export default function AppLoading({ initialized, onDone }: Props) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    const fadeTimer = setTimeout(() => setFading(true), 120);
    const doneTimer = setTimeout(onDone, 600);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [initialized, onDone]);

  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#080808] flex flex-col items-center justify-center select-none"
      style={{
        opacity: fading ? 0 : 1,
        transform: fading ? "scale(1.02)" : "scale(1)",
        transition: "opacity 0.48s cubic-bezier(0.4,0,0.2,1), transform 0.48s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-7">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-[#1db954]/20"
            style={{ animation: "ripple 2s ease-out infinite" }}
          />
          <div className="w-16 h-16 rounded-full bg-[#1db954] flex items-center justify-center relative shadow-[0_0_48px_rgba(29,185,84,0.35)]">
            <Music2 size={28} className="text-black" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex items-end gap-[3px] h-14">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="wave-bar rounded-sm"
              style={{
                height: `${h}px`,
                background: `rgba(29,185,84,${0.55 + (i % 3) * 0.15})`,
                "--dur": `${BAR_DURS[i]}s`,
                animationDelay: `${(i * 0.055).toFixed(3)}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[22px] font-bold text-white tracking-tight">Melodify</span>
        </div>

        <div className="flex gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/20"
              style={{
                animation: `pulse 1.4s ease-in-out ${(i * 0.2).toFixed(1)}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
