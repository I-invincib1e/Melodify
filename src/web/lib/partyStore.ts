import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { usePlayerStore } from "./store";

interface PartyState {
  socket: Socket | null;
  roomId: string | null;
  partyUsers: number;
  isHost: boolean;

  hostParty: () => string;
  joinParty: (id: string) => void;
  leaveParty: () => void;
  emitSync: (event: string, payload?: any) => void;
}

export const usePartyStore = create<PartyState>((set, get) => ({
  socket: null,
  roomId: null,
  partyUsers: 0,
  isHost: false,

  hostParty: () => {
    let { socket } = get();
    if (!socket) {
      socket = io("http://localhost:3001");
    }
    const newRoomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    socket.emit("join-room", newRoomId);
    
    // Setup listeners
    socket.on("user-count", (count) => set({ partyUsers: count }));
    
    // Sync listeners
    socket.on("play", () => usePlayerStore.getState().resume(true));
    socket.on("pause", () => usePlayerStore.getState().pause(true));
    socket.on("sync-time", (time) => usePlayerStore.getState().seekTo(time, true));
    socket.on("change-song", (song) => usePlayerStore.getState().playSong(song, undefined, undefined, true));

    set({ socket, roomId: newRoomId, isHost: true });
    return newRoomId;
  },

  joinParty: (id: string) => {
    let { socket } = get();
    if (!socket) {
      socket = io("http://localhost:3001");
    }
    
    socket.emit("join-room", id);
    
    socket.on("user-count", (count) => set({ partyUsers: count }));
    socket.on("room-state", (state) => {
      // Sync initial state
      if (state.currentSong) {
        usePlayerStore.getState().playSong(state.currentSong, undefined, undefined, true);
        setTimeout(() => {
          usePlayerStore.getState().seekTo(state.currentTime, true);
          if (state.isPlaying) usePlayerStore.getState().resume(true);
          else usePlayerStore.getState().pause(true);
        }, 500);
      }
    });

    socket.on("play", () => usePlayerStore.getState().resume(true));
    socket.on("pause", () => usePlayerStore.getState().pause(true));
    socket.on("sync-time", (time) => usePlayerStore.getState().seekTo(time, true));
    socket.on("change-song", (song) => usePlayerStore.getState().playSong(song, undefined, undefined, true));

    set({ socket, roomId: id, isHost: false });
  },

  leaveParty: () => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit("leave-room", roomId);
      socket.disconnect();
    }
    set({ socket: null, roomId: null, partyUsers: 0, isHost: false });
  },

  emitSync: (event: string, payload?: any) => {
    const { socket, roomId, isHost } = get();
    // Only the host usually orchestrates, but anyone can pause/play if we allow it!
    if (socket && roomId) {
      if (payload !== undefined) {
        socket.emit(event, { roomId, ...payload });
      } else {
        socket.emit(event, roomId);
      }
    }
  }
}));
