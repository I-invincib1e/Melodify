# Melodify

A music streaming web app built as a college mini project. Streams music via the JioSaavn API with real-time playback, playlist management, and synchronized listening parties.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| State | Zustand |
| Routing | Wouter |
| Auth & DB | Supabase (email/password, PostgreSQL) |
| Music API | JioSaavn (saavn.sumit.co) |
| Party Sync | Socket.IO (Express server on port 3001) |
| Build | Vite |

## Features

- **Search** — songs, albums, artists, playlists via JioSaavn
- **Player** — play/pause, skip, shuffle, repeat, volume, queue management
- **Equalizer** — 5-band Web Audio API EQ (60Hz – 14kHz)
- **Liked Songs** — synced to Supabase, fallback to localStorage
- **Playlists** — create, edit, and manage personal playlists
- **Listen History** — last 50 played tracks stored in Supabase
- **Listening Party** — real-time synchronized playback via Socket.IO rooms
- **Karaoke View** — synced lyrics display during playback
- **Offline Support** — cached tracks via service worker / offline store
- **Auth** — sign up / sign in with email + password; onboarding flow for genre/artist preferences

## Project Structure

```
src/web/
├── pages/          # Route-level page components
├── components/     # Shared UI components (player, sidebar, cards, etc.)
├── lib/
│   ├── api.ts          # JioSaavn API wrapper + TypeScript types
│   ├── audioEngine.ts  # Web Audio API equalizer singleton
│   ├── store.ts        # Player, queue, liked songs, UI state (Zustand)
│   ├── authStore.ts    # Auth session + profile state (Supabase)
│   ├── libraryStore.ts # Playlists + playlist songs state
│   ├── partyStore.ts   # Listening party state (Socket.IO)
│   ├── offlineStore.ts # Offline cache management
│   └── supabase.ts     # Supabase client singleton
server/
└── server.js       # Express + Socket.IO party sync server (port 3001)
supabase/
└── migrations/     # Database schema migrations
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User display name and avatar, created on sign-up via trigger |
| `user_preferences` | Onboarding data: genres, followed artists, setup status |
| `playlists` | User-created playlists (public/private) |
| `playlist_songs` | Songs within a playlist with position ordering |
| `liked_songs` | Liked tracks stored as JSONB song data |
| `listening_history` | Last 50 played tracks per user (auto-trimmed by trigger) |

All tables have Row Level Security enabled — users can only access their own data.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/I-invincib1e/Melodify.git
   cd Melodify
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Apply database migrations via the Supabase dashboard or CLI.

4. Start the frontend:
   ```bash
   npm run dev
   ```

5. (Optional) Start the party sync server:
   ```bash
   cd server && node server.js
   ```

## Project Details

- **Course:** [Insert Course Name / Code]
- **Submitted by:** [Student Names & Roll Numbers]
- **Guided by:** [Professor's Name]

---

For educational purposes only.
