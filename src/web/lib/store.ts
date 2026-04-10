import { create } from "zustand";
import type { Song } from "./api";
import { getBestDownloadUrl } from "./api";

// ─── Liked Songs Store (persisted to localStorage) ───
interface LikedState {
  likedIds: Set<string>;
  likedSongs: Song[];
  isLiked: (id: string) => boolean;
  toggleLike: (song: Song) => void;
}

function loadLiked(): { ids: Set<string>; songs: Song[] } {
  try {
    const raw = localStorage.getItem("melodify-liked");
    if (raw) {
      const songs: Song[] = JSON.parse(raw);
      return { ids: new Set(songs.map((s) => s.id)), songs };
    }
  } catch {}
  return { ids: new Set(), songs: [] };
}

function saveLiked(songs: Song[]) {
  localStorage.setItem("melodify-liked", JSON.stringify(songs));
}

const initial = loadLiked();

export const useLikedStore = create<LikedState>((set, get) => ({
  likedIds: initial.ids,
  likedSongs: initial.songs,
  isLiked: (id) => get().likedIds.has(id),
  toggleLike: (song) => {
    const { likedIds, likedSongs } = get();
    if (likedIds.has(song.id)) {
      const newSongs = likedSongs.filter((s) => s.id !== song.id);
      const newIds = new Set(newSongs.map((s) => s.id));
      saveLiked(newSongs);
      set({ likedIds: newIds, likedSongs: newSongs });
    } else {
      const newSongs = [song, ...likedSongs];
      const newIds = new Set(newSongs.map((s) => s.id));
      saveLiked(newSongs);
      set({ likedIds: newIds, likedSongs: newSongs });
    }
  },
}));

// ─── Recently Played Store ───
interface RecentState {
  recentSongs: Song[];
  addRecent: (song: Song) => void;
}

function loadRecent(): Song[] {
  try {
    const raw = localStorage.getItem("melodify-recent");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveRecent(songs: Song[]) {
  localStorage.setItem("melodify-recent", JSON.stringify(songs));
}

export const useRecentStore = create<RecentState>((set, get) => ({
  recentSongs: loadRecent(),
  addRecent: (song) => {
    const current = get().recentSongs.filter((s) => s.id !== song.id);
    const updated = [song, ...current].slice(0, 30);
    saveRecent(updated);
    set({ recentSongs: updated });
  },
}));

// ─── Search History ───
interface SearchHistoryState {
  history: string[];
  addSearch: (q: string) => void;
  clearHistory: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>((set, get) => ({
  history: (() => {
    try { return JSON.parse(localStorage.getItem("melodify-search-history") || "[]"); } catch { return []; }
  })(),
  addSearch: (q) => {
    const h = [q, ...get().history.filter((x) => x !== q)].slice(0, 8);
    localStorage.setItem("melodify-search-history", JSON.stringify(h));
    set({ history: h });
  },
  clearHistory: () => {
    localStorage.removeItem("melodify-search-history");
    set({ history: [] });
  },
}));

// ─── Full screen player toggle ───
interface UIState {
  isFullScreenPlayer: boolean;
  toggleFullScreen: () => void;
  setFullScreen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isFullScreenPlayer: false,
  toggleFullScreen: () => set((s) => ({ isFullScreenPlayer: !s.isFullScreenPlayer })),
  setFullScreen: (v) => set({ isFullScreenPlayer: v }),
}));

// ─── Player Store ───
interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Song[];
  queueIndex: number;
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  audioRef: HTMLAudioElement | null;
  isBuffering: boolean;

  setAudioRef: (ref: HTMLAudioElement) => void;
  playSong: (song: Song, queue?: Song[], index?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
  playFromQueue: (index: number) => void;
  removeFromQueue: (index: number) => void;
  setBuffering: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isMuted: false,
  queue: [],
  queueIndex: -1,
  shuffle: false,
  repeat: "off",
  audioRef: null,
  isBuffering: false,

  setAudioRef: (ref) => set({ audioRef: ref }),
  setBuffering: (v) => set({ isBuffering: v }),

  playSong: (song, queue, index) => {
    const { audioRef } = get();
    const url = getBestDownloadUrl(song.downloadUrl);
    if (!url || !audioRef) return;

    audioRef.src = url;
    audioRef.play().catch(console.error);

    // Track in recent
    useRecentStore.getState().addRecent(song);

    const newState: Partial<PlayerState> = {
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
      isBuffering: true,
    };

    if (queue) {
      newState.queue = queue;
      newState.queueIndex = index ?? 0;
    }

    set(newState);
  },

  togglePlay: () => {
    const { audioRef, isPlaying } = get();
    if (!audioRef) return;
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play().catch(console.error);
    }
    set({ isPlaying: !isPlaying });
  },

  pause: () => {
    get().audioRef?.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    get().audioRef?.play().catch(console.error);
    set({ isPlaying: true });
  },

  nextTrack: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (repeat === "one") {
      nextIndex = queueIndex;
    } else if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") nextIndex = 0;
        else return;
      }
    }

    const song = queue[nextIndex];
    if (song) get().playSong(song, queue, nextIndex);
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }
    if (queue.length === 0) return;
    const prevIndex = Math.max(0, queueIndex - 1);
    const song = queue[prevIndex];
    if (song) get().playSong(song, queue, prevIndex);
  },

  seekTo: (time) => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.currentTime = time;
      set({ currentTime: time });
    }
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => {
    const { audioRef } = get();
    if (audioRef) audioRef.volume = volume;
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { audioRef, isMuted, volume } = get();
    if (!audioRef) return;
    if (isMuted) {
      audioRef.volume = volume || 0.7;
      set({ isMuted: false });
    } else {
      audioRef.volume = 0;
      set({ isMuted: true });
    }
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  toggleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),

  addToQueue: (song) => set((s) => ({ queue: [...s.queue, song] })),
  clearQueue: () => set({ queue: [], queueIndex: -1 }),

  playFromQueue: (index) => {
    const { queue } = get();
    const song = queue[index];
    if (song) get().playSong(song, queue, index);
  },

  removeFromQueue: (index) =>
    set((s) => {
      const newQueue = [...s.queue];
      newQueue.splice(index, 1);
      const newIndex =
        index < s.queueIndex ? s.queueIndex - 1 : s.queueIndex;
      return { queue: newQueue, queueIndex: Math.min(newIndex, newQueue.length - 1) };
    }),
}));
