import { useLocation } from "wouter";
import { Home, Search, Library, Heart } from "lucide-react";

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  const items = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Library", path: "/liked" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 neuglass border-t border-white/5 z-[60] pb-safe">
      <div className="flex items-center justify-around py-1.5">
        {items.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-5"
            >
              {isActive && (
                <span className="absolute -top-1.5 w-4 h-[2px] rounded-full bg-primary" />
              )}
              <Icon size={22} className={isActive ? "text-white" : "text-[#727272]"} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? "text-white" : "text-[#727272]"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
