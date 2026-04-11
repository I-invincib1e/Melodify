import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface UserPreferences {
  genres: string[];
  artist_ids: string[];
  artist_names: string[];
  setup_complete: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setPreferences: (prefs: UserPreferences | null) => void;
  setLoading: (v: boolean) => void;
  fetchProfile: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  preferences: null,
  loading: true,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setPreferences: (preferences) => set({ preferences }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (data) set({ profile: data });
  },

  fetchPreferences: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from("user_preferences")
      .select("genres, artist_ids, artist_names, setup_complete")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      set({ preferences: { genres: data.genres, artist_ids: data.artist_ids, artist_names: data.artist_names, setup_complete: data.setup_complete } });
    } else {
      set({ preferences: null });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, preferences: null });
  },
}));
