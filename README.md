# Melodify — Music Streaming App

A full-featured music streaming web application built as a college mini-project. Melodify lets you discover, stream, and organize music with AI-driven personalization, real-time party rooms, offline downloads, karaoke lyrics, and more.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [How AI Is Used](#how-ai-is-used)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Pages & Routes](#pages--routes)
- [Authentication Flow](#authentication-flow)
- [Getting Started](#getting-started)

---

## Overview

Melodify is a React-based music streaming frontend powered by the **JioSaavn public API** for music data, **Supabase** for the backend (auth, database, realtime), and **Socket.IO** for live party rooms. It supports both guest and authenticated users — guests can stream freely, while signed-in users get personalized recommendations, saved libraries, and sync features.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4, shadcn/ui components |
| Routing | Wouter |
| State | Zustand (multiple stores) |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Music API | JioSaavn (unofficial public API via proxy) |
| Party Rooms | Socket.IO (Node.js server in `/server`) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React, React Icons |
| Fonts | Syne (display) + Plus Jakarta Sans (body) |

---

## Features

### Core Player
- Full audio playback with HTML5 `<audio>` element
- Play / pause / skip / previous / shuffle / repeat (off / all / one)
- Mini player pinned to the bottom and a fullscreen expanded mode
- Real-time progress slider with seek support
- Volume control with mute toggle
- Keyboard shortcuts: `Space` = play/pause, `Shift+→` = next, `Shift+←` = previous
- Canvas-based audio visualizer in fullscreen mode
- Buffering indicator

### Discovery & Search
- Instant search across songs, albums, and artists via JioSaavn API
- Home page with curated sections (trending, new releases, genre picks)
- Album pages with full track listings
- Artist pages with discography

### Library & Personalization
- Liked songs — persisted per user in Supabase
- Listening history — last 50 plays per user, auto-trimmed by database trigger
- User playlists — create, name, add/remove songs
- Sidebar shows liked songs, recent history, and playlists at a glance

### Karaoke & Lyrics
- Synced lyrics fetched for each track
- Word-by-word karaoke highlighting in fullscreen player mode
- Auto-scrolls to the current lyric line

### Offline Mode
- Download any song as an audio file via the download button
- Downloaded tracks are stored locally (IndexedDB via `offlineStore`)

### Listen Along (Party Rooms)
- Create or join a real-time listening room with a shareable room code
- Host controls playback; all members stay in sync via Socket.IO events
- Room participant count shown live in the sidebar

### Onboarding
- New users complete a taste-setup flow: pick genres + follow artists
- Preferences stored in `user_preferences` table
- Drives the AI recommendation engine on the home page

---

## How AI Is Used

Melodify's "AI" is a **collaborative filtering + content-based hybrid** built entirely from first principles on top of the JioSaavn search API and Supabase — no external ML API is called.

### 1. Genre-Based Content Recommendations

Each genre the user selected during onboarding maps to a curated search query in `useRecommendations.ts`:

```ts
const GENRE_QUERIES: Record<string, { query: string; label: string }> = {
  hindi:    { query: "top bollywood hindi songs", label: "Hindi Hits" },
  punjabi:  { query: "best punjabi hits 2024",   label: "Punjabi Fire" },
  romantic: { query: "romantic bollywood love songs", label: "Romantic Picks" },
  // ...12 genres total
};
```

On home load, the top 3 user genres fire parallel search requests and the results populate personalized sections.

### 2. Artist Affinity Sections

Two layers of artist signals are combined:

**a) Explicit follows (onboarding):** The user's `artist_ids` from `user_preferences` are used to fetch that artist's songs via `getArtistSongs()`. These appear as "Because you like [Artist]" sections.

**b) Implicit listening history (behavioral):** The `getTopArtistsFromHistory()` function queries the user's last 100 plays from the `listening_history` table, counts artist occurrences, ranks by frequency, and surfaces the top 2 artists as "More like [Artist]" sections — even if the user never explicitly followed them.

```ts
async function getTopArtistsFromHistory(userId: string) {
  // Fetch last 100 plays from Supabase
  // Count primary artist appearances across all songs
  // Return top artists ranked by play frequency
}
```

### 3. Dynamic Section Assembly

Sections are assembled in priority order:
1. Explicit artist follows (up to 3)
2. History-derived artist sections (up to 2)
3. New releases album row
4. Genre-based song sections (up to 3)

For guests, a static editorial home is shown (trending, Arijit Singh, Punjabi hits, romantic). The experience upgrades automatically on sign-in without a page reload.

### 4. History Trimming (Automatic)

A PostgreSQL trigger on `listening_history` automatically deletes plays beyond the 50 most recent for each user — keeping the dataset fresh and the recommendations relevant without any manual cleanup.

---

## Architecture

```
melodify/
├── src/web/
│   ├── app.tsx               # Router, lazy-loaded pages, app shell
│   ├── styles.css            # Global styles, animations, CSS tokens
│   ├── components/
│   │   ├── player.tsx        # Full audio player (mini + fullscreen)
│   │   ├── sidebar.tsx       # Left nav, library, party room, auth
│   │   ├── mobile-nav.tsx    # Bottom nav bar (mobile)
│   │   ├── karaoke-view.tsx  # Synced lyrics display
│   │   ├── canvas-visualizer.tsx  # Audio frequency visualizer
│   │   └── ui/               # shadcn/ui base components
│   ├── pages/
│   │   ├── landing.tsx       # Public marketing page
│   │   ├── auth.tsx          # Sign in / Create account (split-panel)
│   │   ├── onboarding.tsx    # Taste setup wizard
│   │   ├── index.tsx         # Home feed (personalized)
│   │   ├── search.tsx        # Search results
│   │   ├── album.tsx         # Album detail + tracklist
│   │   ├── artist.tsx        # Artist detail + discography
│   │   ├── playlist.tsx      # Curated playlist view
│   │   ├── my-playlist.tsx   # User-created playlist
│   │   ├── liked.tsx         # Liked songs collection
│   │   ├── history.tsx       # Recent plays
│   │   ├── queue.tsx         # Playback queue
│   │   └── profile.tsx       # User profile & settings
│   └── lib/
│       ├── api.ts            # JioSaavn API wrapper
│       ├── store.ts          # Player + liked songs Zustand store
│       ├── authStore.ts      # Auth session + profile state
│       ├── libraryStore.ts   # Playlists + listening history state
│       ├── partyStore.ts     # Socket.IO party room state
│       ├── offlineStore.ts   # IndexedDB offline downloads
│       ├── audioEngine.ts    # Web Audio API analyser node
│       ├── lyrics.ts         # Lyrics fetch + sync logic
│       └── supabase.ts       # Supabase client singleton
└── server/
    └── server.js             # Socket.IO party-room relay server
```

---

## Database Schema

All tables use Supabase PostgreSQL with Row Level Security (RLS) enforced. Every write is scoped to the authenticated user via `auth.uid()`.

| Table | Purpose |
|---|---|
| `profiles` | Public display name + avatar, auto-created on sign-up via trigger |
| `user_preferences` | Onboarding selections: genres[], artist_ids[], setup_complete |
| `playlists` | User-created playlists with optional public sharing |
| `playlist_songs` | Songs inside a playlist, ordered by `position` |
| `liked_songs` | Per-user liked tracks with full `song_data` JSONB |
| `listening_history` | Per-user play history, auto-capped at 50 rows by trigger |

**Key design decisions:**
- Full song objects are stored as `jsonb` in `liked_songs` and `listening_history` so the app can render them without re-fetching the API.
- A `DEFAULT auth.uid()` on owner columns means frontend inserts never need to pass `user_id` explicitly — the database fills it from the session.
- A PostgreSQL trigger auto-creates a `profiles` row when a user signs up — no client-side bootstrapping needed.
- A second trigger on `listening_history` caps each user's history at 50 rows, deleting the oldest entries automatically.

---

## Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/landing` | Marketing landing page | Public |
| `/auth` | Sign in / Create account | Public |
| `/onboarding` | Taste setup wizard | After sign-up |
| `/` | Home feed | Guest + Authenticated |
| `/search` | Search songs, albums, artists | Guest + Authenticated |
| `/album/:id` | Album detail | Guest + Authenticated |
| `/artist/:id` | Artist detail | Guest + Authenticated |
| `/playlist/:id` | Curated playlist | Guest + Authenticated |
| `/liked` | Liked songs | Authenticated |
| `/history` | Recent plays | Authenticated |
| `/queue` | Playback queue | Guest + Authenticated |
| `/my-playlist/:id` | User playlist | Authenticated |
| `/profile` | Profile & preferences | Authenticated |

All heavy pages (search, album, artist, playlist, queue, liked, history, my-playlist, profile) are **lazy-loaded** via React's `lazy()` + `Suspense` — they ship as separate chunks and only download when first visited.

---

## Authentication Flow

```
Visit /landing
      ↓
  Click "Get Started Free"
      ↓
    /auth  (split-panel layout)
      │
      ├── Sign Up
      │     → supabase.auth.signUp()
      │     → DB trigger creates profiles row
      │     → Redirect to /onboarding
      │           ↓
      │       Pick genres + follow artists
      │           ↓
      │       Saves to user_preferences
      │           ↓
      │       Redirect to / (personalized home)
      │
      └── Sign In
            → supabase.auth.signInWithPassword()
            → fetchProfile() + fetchPreferences()
            → setup_complete? → /  :  /onboarding
```

Guest users skip auth entirely and land directly on `/` with the default editorial home. They can stream music, build a queue, and use the equalizer — all state lives in browser memory only and is not persisted.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (credentials in `.env`)

### Environment Variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install & Run

```bash
# Install frontend dependencies
npm install

# Install party server dependencies
cd server && npm install && cd ..

# Start the frontend (Vite dev server)
npm run dev

# Start the party room server (separate terminal)
cd server && node server.js
```

### Build for Production

```bash
npm run build
```

The build produces code-split chunks — heavy routes load on demand, keeping the initial bundle small.

---

## Project Details

- **Type:** College Mini-Project (Educational)
- **Data Source:** JioSaavn unofficial public API
- **License:** For educational purposes only. Not affiliated with JioSaavn or any music label.
