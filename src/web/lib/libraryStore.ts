import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "./api";

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
      
      createPlaylist: (name) => set((state) => ({
        playlists: [
          ...state.playlists,
          { id: Math.random().toString(36).substring(2, 9), name, createdAt: Date.now(), songIds: [], songs: [] }
        ]
      })),
      
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id)
      })),
      
      addToPlaylist: (playlistId, song) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id !== playlistId) return p;
          if (p.songIds.includes(song.id)) return p; // prevent duplicates
          return { ...p, songIds: [...p.songIds, song.id], songs: [...p.songs, song] };
        })
      })),
      
      removeFromPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id !== playlistId) return p;
          return { ...p, songIds: p.songIds.filter(id => id !== songId), songs: p.songs.filter(s => s.id !== songId) };
        })
      }))
    }),
    {
      name: "melodify-library-storage",
    }
  )
);
