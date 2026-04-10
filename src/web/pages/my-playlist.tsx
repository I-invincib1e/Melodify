import { useLibraryStore } from "@/lib/libraryStore";
import { Play, Music2, Clock, Trash2 } from "lucide-react";
import SongRow from "@/components/song-row";
import { usePlayerStore } from "@/lib/store";
import { useRoute, useLocation } from "wouter";

export default function MyPlaylistPage() {
  const [, params] = useRoute("/my-playlist/:id");
  const [, setLocation] = useLocation();
  const { playlists, deletePlaylist, removeFromPlaylist } = useLibraryStore();
  const { playSong } = usePlayerStore();

  const playlistId = params?.id;
  const playlist = playlists.find(p => p.id === playlistId);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <Music2 size={48} className="text-[#b3b3b3] mb-4 opacity-50" />
        <p className="text-[#b3b3b3] text-lg font-medium">Playlist not found</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs, 0);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(playlist.id);
      setLocation("/");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8 pt-10">
          <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 shadow-2xl shadow-black/40 bg-[#282828] rounded-xl flex items-center justify-center">
             <Music2 size={80} className="text-[#a7a7a7] opacity-60" />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-white">Custom Playlist</span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight break-words">{playlist.name}</h1>
            <p className="text-[#a7a7a7] text-sm font-medium mt-1">
              Created {new Date(playlist.createdAt).toLocaleDateString()}
              <span className="mx-2">•</span>
              {playlist.songs.length} songs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={playlist.songs.length === 0}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/30 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Play size={28} fill="black" className="text-black ml-1" />
          </button>
          <button 
            onClick={handleDelete}
            className="text-sm font-medium text-[#b3b3b3] hover:text-red-500 transition-colors uppercase tracking-wider flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete Playlist
          </button>
        </div>

        {playlist.songs.length > 0 ? (
          <div className="space-y-1 pb-32">
            <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-white/10 text-xs text-[#a7a7a7] uppercase tracking-wider font-semibold mb-3">
              <span className="w-8 text-center">#</span>
              <span>Title</span>
              <span className="hidden md:block">Album</span>
              <span className="w-8 text-center"></span>
              <span className="w-12 text-center"><Clock size={16} /></span>
            </div>
            
            {playlist.songs.map((song, idx) => (
              <div key={`${song.id}-${idx}`} className="group relative flex items-center">
                <div className="flex-1 min-w-0">
                    <SongRow
                    song={song}
                    index={idx}
                    queue={playlist.songs}
                    showAlbumArt={true}
                    showIndex={true}
                    showAlbumName={true}
                    />
                </div>
                <button 
                    onClick={() => removeFromPlaylist(playlist.id, song.id)}
                    className="absolute right-16 opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-red-500 p-2 z-10 transition-colors"
                    title="Remove from playlist"
                >
                    <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-10">
            <p className="text-[#b3b3b3] text-lg font-medium">This playlist is empty</p>
            <p className="text-[#727272] text-sm mt-2">Find some songs and add them here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
