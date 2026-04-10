import { useState, useRef, useEffect } from "react";
import { Plus, ListPlus, X } from "lucide-react";
import { useLibraryStore } from "@/lib/libraryStore";
import type { Song } from "@/lib/api";

export default function PlaylistMenu({ song }: { song: Song }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const { playlists, createPlaylist, addToPlaylist } = useLibraryStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      createPlaylist(newTitle.trim());
      setNewTitle("");
      setShowCreate(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors rounded-full hover:bg-white/10"
        title="Add to Playlist"
      >
        <ListPlus size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 neuglass rounded-lg shadow-2xl border border-white/10 overflow-hidden z-50 py-1" onClick={e => e.stopPropagation()}>
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Add to Playlist</span>
            <button onClick={() => setIsOpen(false)} className="text-[#a7a7a7] hover:text-white"><X size={14}/></button>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {playlists.length === 0 ? (
              <p className="text-xs text-[#a7a7a7] px-4 py-2 text-center italic">No custom playlists yet</p>
            ) : (
              playlists.map(p => (
                <button
                  key={p.id}
                  onClick={() => { addToPlaylist(p.id, song); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-colors"
                >
                  {p.name}
                </button>
              ))
            )}
          </div>

          <div className="p-2 border-t border-white/10">
            {showCreate ? (
              <form onSubmit={handleCreate} className="flex gap-2">
                <input 
                   autoFocus
                   type="text" 
                   placeholder="Playlist name..."
                   className="flex-1 bg-black/40 text-white text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary placeholder:text-white/30"
                   value={newTitle}
                   onChange={e => setNewTitle(e.target.value)}
                />
                <button type="submit" className="text-primary hover:text-white"><Plus size={16}/></button>
              </form>
            ) : (
              <button 
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Plus size={14} /> New Playlist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
