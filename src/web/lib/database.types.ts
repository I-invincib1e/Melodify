export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { display_name?: string; avatar_url?: string | null; updated_at?: string };
      };
      user_preferences: {
        Row: { id: string; user_id: string; genres: string[]; artist_ids: string[]; artist_names: string[]; setup_complete: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; genres?: string[]; artist_ids?: string[]; artist_names?: string[]; setup_complete?: boolean; created_at?: string; updated_at?: string };
        Update: { genres?: string[]; artist_ids?: string[]; artist_names?: string[]; setup_complete?: boolean; updated_at?: string };
      };
      playlists: {
        Row: { id: string; owner_id: string; name: string; description: string | null; cover_url: string | null; visibility: "private" | "public"; created_at: string; updated_at: string };
        Insert: { id?: string; owner_id: string; name: string; description?: string | null; cover_url?: string | null; visibility?: "private" | "public"; created_at?: string; updated_at?: string };
        Update: { name?: string; description?: string | null; cover_url?: string | null; visibility?: "private" | "public"; updated_at?: string };
      };
      playlist_songs: {
        Row: { id: string; playlist_id: string; song_id: string; song_data: Record<string, unknown>; position: number; added_at: string };
        Insert: { id?: string; playlist_id: string; song_id: string; song_data: Record<string, unknown>; position?: number; added_at?: string };
        Update: { position?: number };
      };
      liked_songs: {
        Row: { id: string; user_id: string; song_id: string; song_data: Record<string, unknown>; liked_at: string };
        Insert: { id?: string; user_id: string; song_id: string; song_data: Record<string, unknown>; liked_at?: string };
        Update: never;
      };
      listening_history: {
        Row: { id: string; user_id: string; song_id: string; song_data: Record<string, unknown>; played_at: string };
        Insert: { id?: string; user_id: string; song_id: string; song_data: Record<string, unknown>; played_at?: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
