import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "./api";
import { supabase } from "./supabase";

export interface CustomPlaylist {
  id: string;
  name: string;
  createdAt: number;
  songIds: string[]; // Store full songs if needed, but IDs + a cache is cleaner. Actually, storing full Song objects is best for offline since API is unreachable.
  songs: Song[];
}

interface LibraryState {
  history: Song[];
  playlists: CustomPlaylist[];
  
  // Actions
  addToHistory: (song: Song) => void;
  clearHistory: () => void;
  
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      history: [],
      playlists: [],
      
      addToHistory: (song) => set((state) => {
        // Prevent duplicate consecutive entries, but allow re-entry later
        const lastSong = state.history[0];
        if (lastSong && lastSong.id === song.id) return state;

        // Keep last 100 songs in history to prevent bloat
        return {
          history: [song, ...state.history.filter(s => s.id !== song.id)].slice(0, 100)
        };
      }),
      
      clearHistory: () => set({ history: [] }),
      
      createPlaylist: (name) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          playlists: [...state.playlists, { id, name, createdAt: Date.now(), songIds: [], songs: [] }]
        }));
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase.from("playlists").insert({ id, owner_id: user.id, name }).then(() => {});
        });
      },

      deletePlaylist: (id) => {
        set((state) => ({ playlists: state.playlists.filter(p => p.id !== id) }));
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase.from("playlists").delete().eq("id", id).eq("owner_id", user.id).then(() => {});
        });
      },

      addToPlaylist: (playlistId, song) => {
        set((state) => ({
          playlists: state.playlists.map(p => {
            if (p.id !== playlistId) return p;
            if (p.songIds.includes(song.id)) return p;
            return { ...p, songIds: [...p.songIds, song.id], songs: [...p.songs, song] };
          })
        }));
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase.from("playlist_songs").insert({
            playlist_id: playlistId,
            song_id: song.id,
            song_data: song as unknown as Record<string, unknown>,
            position: 0,
          }).then(() => {});
        });
      },

      removeFromPlaylist: (playlistId, songId) => {
        set((state) => ({
          playlists: state.playlists.map(p => {
            if (p.id !== playlistId) return p;
            return { ...p, songIds: p.songIds.filter(id => id !== songId), songs: p.songs.filter(s => s.id !== songId) };
          })
        }));
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase.from("playlist_songs").delete().eq("playlist_id", playlistId).eq("song_id", songId).then(() => {});
        });
      }
    }),
    {
      name: "melodify-library-storage",
    }
  )
);
