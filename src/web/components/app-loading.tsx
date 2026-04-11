import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";

export default function AppLoading({ onDone }: { onDone?: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (onDone) {
      const t = setTimeout(() => {
        setFading(true);
        setTimeout(onDone, 400);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [onDone]);

  const BAR_HEIGHTS = [28, 44, 56, 40, 60, 48, 36, 52, 44, 58, 38, 50];

  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#080808] flex flex-col items-center justify-center gap-8"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#1db954] flex items-center justify-center shadow-[0_0_40px_rgba(29,185,84,0.4)] animate-pulse">
            <Music2 size={28} className="text-black" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex items-end gap-1 h-16">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="wave-bar bg-[#1db954]"
              style={{
                height: `${h}px`,
                "--dur": `${0.5 + (i % 5) * 0.12}s`,
                animationDelay: `${(i * 0.06).toFixed(2)}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold text-white tracking-tight">Melodify</span>
        </div>
      </div>
    </div>
  );
}
