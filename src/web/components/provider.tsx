import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";
import { useLikedStore } from "@/lib/store";
import type { Song } from "@/lib/api";

interface ProviderProps {
  children: React.ReactNode;
}

async function hydrateUserData(userId: string) {
  const { data } = await supabase
    .from("liked_songs")
    .select("song_data")
    .eq("user_id", userId)
    .order("liked_at", { ascending: false });

  if (data && data.length > 0) {
    const songs = data.map((row) => row.song_data as unknown as Song);
    useLikedStore.getState().hydrateFromSupabase(songs);
  }
}

export function Provider({ children }: ProviderProps) {
  const { setSession, setLoading, fetchProfile, fetchPreferences } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        (async () => {
          await Promise.all([fetchProfile(), fetchPreferences()]);
          await hydrateUserData(session.user.id);
        })();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        (async () => {
          await Promise.all([fetchProfile(), fetchPreferences()]);
          await hydrateUserData(session.user.id);
        })();
      }
      if (event === "SIGNED_OUT") {
        useAuthStore.getState().setProfile(null);
        useAuthStore.getState().setPreferences(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
