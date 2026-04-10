# Melodify — Spotify Clone with JioSaavn API

A beautiful, fully-functional Spotify clone built with React, Vite, and Tailwind CSS. Streams music from the free JioSaavn API with a modern dark UI inspired by Spotify and YouTube Music.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Bun](https://img.shields.io/badge/bun-blue?logo=bun)
![React](https://img.shields.io/badge/react-19-blue?logo=react)
![Tailwind](https://img.shields.io/badge/tailwind-css-blue?logo=tailwindcss)

## ✨ Features

### 🎵 Music Player
- **Full-screen immersive player** — tap album art to expand
- **Mini player bar** with progress, controls, volume
- **Shuffle & Repeat** modes (off → all → one)
- **Queue management** — view, reorder, clear next-up songs
- **Keyboard shortcuts** — Space to play/pause, Shift+→ next, Shift+← prev
- **Buffering indicator** with spinner overlay

### 🔍 Discovery
- **Home page** with Spotify-style quick-pick cards
- **Horizontal carousels** for albums, artists, songs
- **Search** with global results (songs, albums, artists, playlists)
- **Search tabs** — filter by type
- **12 genre categories** — Bollywood, Punjabi, Pop, Classical, EDM, Lofi, etc.
- **Top result card** — large preview of best match
- **Recent searches** — saved search history

### 📱 Content Pages
- **Albums** — full tracklist, artist info, play all
- **Artists** — bio, top songs, discography, similar artists
- **Playlists** — browse featured/public playlists
- **Liked Songs** — heart any song, auto-saved to localStorage

### 🎨 UI/UX
- **Dark Spotify theme** — pure black with #1DB954 green accent
- **Responsive design** — desktop (sidebar) + mobile (bottom nav)
- **Smooth animations** — staggered reveals, page transitions, equalizer bars
- **Glass morphism** player bar with backdrop blur
- **Skeleton loaders** — shimmer on slow networks
- **Like button** on every song row
- **Explicit content badge** on songs

### 💾 Persistence
- **Liked songs** → localStorage (sync across sessions)
- **Recently played** → auto-tracked (last 30 songs)
- **Search history** → remembered (last 8 searches)

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) 1.0+
- Node.js 18+ (or use Bun)

### Installation

```bash
git clone https://github.com/I-invincib1e/Melodify.git
cd Melodify
bun install
```

### Run Locally

```bash
# Start dev server (http://localhost:8541)
bun dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Pages**: Home, Search, Album, Artist, Playlist, Queue, Liked Songs
- **Components**: Player, Sidebar, Song Row, Music Card, Horizontal Scroll, Equalizer
- **State**: Zustand (player, liked, recent, search history)
- **API**: TypeScript client for JioSaavn API
- **Styling**: Tailwind CSS v4 (CSS-first, no config)

### Backend (Hono + Cloudflare Workers)
- API routes ready for future expansion
- Drizzle ORM + D1 database configured (unused for now)

### Styling
- **Tailwind v4** with custom animations
- **Custom CSS** for shimmer, equalizer bars, marquee, glass effects
- **Responsive** with md: breakpoint for tablet/desktop

## 📁 Project Structure

```
src/
├── web/
│   ├── pages/              # Route pages
│   │   ├── index.tsx       # Home with quick-picks & carousels
│   │   ├── search.tsx      # Search with tabs & categories
│   │   ├── album.tsx       # Album details & tracklist
│   │   ├── artist.tsx      # Artist bio & discography
│   │   ├── playlist.tsx    # Playlist view
│   │   ├── queue.tsx       # Queue manager
│   │   └── liked.tsx       # Liked songs
│   ├── components/
│   │   ├── player.tsx      # Full-screen & mini player
│   │   ├── sidebar.tsx     # Nav + recently played
│   │   ├── song-row.tsx    # Song table row
│   │   ├── music-card.tsx  # Card for carousels
│   │   ├── horizontal-scroll.tsx
│   │   ├── equalizer.tsx
│   │   ├── like-button.tsx
│   │   └── ui/             # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts          # JioSaavn API client
│   │   ├── store.ts        # Zustand stores
│   │   └── utils.ts
│   ├── styles.css          # Tailwind + animations
│   └── app.tsx             # Router setup
├── api/                    # Hono backend (unused for now)
└── public/                 # Static assets
```

## 🎵 Music API

Uses the **unofficial JioSaavn API** by [saavn.sumit.co](https://saavn.sumit.co).

**No authentication required.** Free public endpoints:
- Search (songs, albums, artists, playlists)
- Song details with download URLs (320kbps)
- Album/playlist full content
- Artist bio, top songs, discography

**Audio streaming** directly from JioSaavn CDN.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, custom CSS |
| **State** | Zustand |
| **UI Components** | shadcn/ui, lucide-react |
| **Backend** | Hono, Cloudflare Workers |
| **Database** | Drizzle ORM, Cloudflare D1 |
| **Build** | Bun |

## 🎮 How to Use

1. **Search** — Find songs by artist name, song title, or genre
2. **Play** — Click any song or album to start playback
3. **Like** — Heart songs to save to Liked Songs
4. **Queue** — Add songs to queue or shuffle
5. **Full Screen** — Tap album art in player to expand
6. **Mobile** — Bottom nav, compact layout

## 📸 Screenshots

### Home
Spotify-style quick picks, trending songs, horizontal carousels by mood.

### Search
Global search with tabs, top result card, genre categories.

### Player
Full-screen immersive mode with large album art, controls, progress.

## 🌐 Deployment

### Deploy to Cloudflare Pages

1. Push to GitHub
2. Connect repo in [Cloudflare Pages](https://pages.cloudflare.com)
3. Build command: `bun run build`
4. Output directory: `dist`

Automatic deployments on every push to `main`.

### Deploy to Vercel

```bash
vercel
```

## 🔧 Environment Variables

Not required for development. For future backends:

```env
VITE_API_URL=https://api.melodify.dev
```

## ⚡ Performance

- **~150KB gzipped** (React + UI + player)
- Lazy image loading
- Debounced search (350ms)
- Horizontal scroll with CSS snap
- No external dependencies beyond essentials

## 🎯 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile (iOS Safari, Chrome Android)

## 🚫 Known Limitations

1. No offline mode (streams from internet)
2. No audio downloads (stream-only)
3. No user accounts (localStorage only)
4. No lyrics view (API unavailable)
5. Liked songs limited by localStorage (~5-10MB cap)

## 🔮 Roadmap

- [ ] Backend sync (save to DB)
- [ ] User authentication
- [ ] Create custom playlists
- [ ] Lyrics display
- [ ] Radio mode
- [ ] Artist follow system
- [ ] Social sharing
- [ ] PWA (offline caching)
- [ ] Light mode toggle

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit PRs
- Improve performance
- Add languages/regions

## 📄 License

MIT — Use freely in personal & commercial projects.

## 🙏 Credits

- **API**: [saavn.sumit.co](https://saavn.sumit.co) — unofficial JioSaavn wrapper
- **Inspiration**: Spotify, YouTube Music
- **Icons**: [lucide-react](https://lucide.dev)
- **Components**: [shadcn/ui](https://ui.shadcn.com)
- **Styles**: [Tailwind CSS](https://tailwindcss.com)

## 📧 Support

Found a bug or have a question? Open an issue on GitHub.

---

Made with ❤️ by [Your Name]

[⬆ Back to top](#melodify--spotify-clone-with-jiosaavn-api)
