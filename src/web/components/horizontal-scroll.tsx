import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onShowAll?: () => void;
}

export default function HorizontalScroll({ children, title, subtitle, onShowAll }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="mb-8 group/section animate-fade-in">
      {(title || onShowAll) && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer" onClick={onShowAll}>
                {title}
              </h2>
            )}
            {subtitle && <p className="text-xs text-[#b3b3b3] mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {onShowAll && (
              <button onClick={onShowAll} className="text-sm font-semibold text-[#b3b3b3] hover:text-white transition-colors mr-2">
                Show all
              </button>
            )}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#282828] transition-colors opacity-0 group-hover/section:opacity-100"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#282828] transition-colors opacity-0 group-hover/section:opacity-100"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-snap-x pb-2"
      >
        {children}
      </div>
    </section>
  );
}
