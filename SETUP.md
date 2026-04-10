# Melodify — Spotify Clone Setup & Deployment

## Quick Start (Local)

```bash
# Install dependencies
bun install

# Generate types and migrations
bun cf-typegen
bun db:generate
bun db:migrate

# Start dev server
bun dev
```

Visit `http://localhost:8541`

## Push to GitHub

```bash
cd spotify-clone
git remote add origin https://github.com/I-invincib1e/Melodify.git
git branch -M main
git push -u origin main
```

If you get auth errors, use SSH instead:
```bash
git remote set-url origin git@github.com:I-invincib1e/Melodify.git
git push -u origin main
```

## Project Structure

```
src/
├── web/                    # React frontend
│   ├── pages/             # Route pages (home, search, album, artist, playlist, queue, liked)
│   ├── components/        # Reusable UI components
│   │   ├── player.tsx      # Full-screen & mini player
│   │   ├── sidebar.tsx     # Left nav with recently played
│   │   ├── mobile-nav.tsx  # Bottom nav for mobile
│   │   ├── song-row.tsx    # Song table row with like button
│   │   ├── music-card.tsx  # Card for carousels
│   │   ├── horizontal-scroll.tsx  # Scrollable carousel
│   │   ├── equalizer.tsx   # Animated equalizer bars
│   │   ├── like-button.tsx # Heart toggle
│   │   └── ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts         # JioSaavn API client
│   │   ├── store.ts       # Zustand state (player, liked, recent, search history)
│   │   └── utils.ts       # Helpers
│   ├── styles.css         # Tailwind + custom animations
│   └── main.tsx          # React entrypoint
├── api/
│   ├── index.ts           # Hono backend routes
│   ├── database/          # Drizzle ORM schema
│   └── migrations/        # DB migrations
└── public/                # Static assets
```

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite + Bun
- **Styling**: Tailwind CSS v4 (CSS-first, no config file)
- **State**: Zustand (player, liked songs, recent tracks, search history)
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Backend**: Hono on Cloudflare Workers
- **Database**: Drizzle ORM + Cloudflare D1
- **API**: JioSaavn unofficial API (saavn.sumit.co)

## Features

### Player
- ✅ Play/pause, skip, prev, shuffle, repeat (off/one/all)
- ✅ Seek bar with duration display
- ✅ Volume control + mute
- ✅ Full-screen immersive player (tap album art to expand)
- ✅ Mini player bar with progress line
- ✅ Equalizer animation for now-playing
- ✅ Buffering spinner

### Content
- ✅ Home: Quick-pick cards, trending songs, carousels by mood
- ✅ Search: Global search, 12 genre categories, instant results
- ✅ Search Tabs: All / Songs / Albums / Artists
- ✅ Album page: Header gradient, full tracklist
- ✅ Artist page: Bio, top songs, albums, singles, similar artists
- ✅ Playlist page: Full playlist view
- ✅ Liked Songs: Heart any song, persisted to localStorage
- ✅ Queue: Manage next-up songs, reorder

### UI/UX
- ✅ Dark Spotify theme (pure black + #1DB954 green)
- ✅ Horizontal scroll carousels with nav arrows
- ✅ Responsive mobile layout (sidebar hides, bottom nav appears)
- ✅ Skeleton loading states
- ✅ Staggered animations on page load
- ✅ Glass morphism player
- ✅ Active navigation indicators
- ✅ Like button on every song

### Persistence
- ✅ Liked songs → localStorage
- ✅ Recently played songs → localStorage
- ✅ Search history → localStorage
- ✅ Player state → Zustand (in-memory, lost on refresh)

## API Integration

Uses the **unofficial JioSaavn API** (`saavn.sumit.co`) — free, no auth needed.

### Endpoints Used
- `GET /api/search` — global search
- `GET /api/search/songs` — search songs
- `GET /api/search/albums` — search albums
- `GET /api/search/artists` — search artists
- `GET /api/songs/:id` — get song details
- `GET /api/albums?id=:id` — get album + tracklist
- `GET /api/playlists?id=:id` — get playlist + tracklist
- `GET /api/artists/:id` — get artist details + top songs/albums

Songs stream directly from JioSaavn CDN via `.downloadUrl` array.

## Customization

### Colors
Edit `src/web/styles.css`:
```css
--primary: #1DB954;  /* Green */
--background: #000000;  /* Black */
--card: #121212;  /* Dark gray */
```

### Fonts
Already using "Figtree" from Google Fonts (loaded in `index.html`).

### Animations
In `styles.css`:
- `.animate-slide-up` — slide up + fade
- `.animate-fade-in` — just fade
- `.animate-scale-in` — scale from 95%
- `.stagger-children` — staggered animation on child items
- `.eq-bar` — equalizer bar animation

## Deployment

### Cloudflare Pages
1. Push to GitHub
2. Connect repo in Cloudflare Pages
3. Build command: `bun run build`
4. Output directory: `dist`

The managed website scaffold is already configured for Cloudflare deployment.

## Environment Variables

None required for basic use. API calls are to free public endpoints.

For future features (auth, backend persistence), create `.env.local`:
```
VITE_API_URL=https://api.melodify.dev
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- ~150KB gzipped (React + UI + player logic)
- Lazy image loading on cards
- Debounced search (350ms)
- Request cancellation for old searches
- Horizontal scroll uses `scroll-snap` for smooth performance

## Known Limitations

1. **No offline mode** — requires internet for streaming
2. **No audio download** — streams only from JioSaavn
3. **No user accounts** — all data in localStorage (single device)
4. **No lyrics** — JioSaavn lyrics endpoint unavailable
5. **Search history limited to 8** — localStorage constraint
6. **Liked songs limited by localStorage** — typically 5-10MB cap

## Future Enhancements

- [ ] Backend sync (save liked songs, playlists to server)
- [ ] User authentication (email/social login)
- [ ] Create custom playlists
- [ ] Lyrics view
- [ ] Radio/recommend similar
- [ ] Artist follow system
- [ ] Social sharing
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts (Ctrl+K for search, etc.)
- [ ] PWA (offline playback cache)

## License

MIT

## Credits

- **API**: [saavn.sumit.co](https://saavn.sumit.co) (unofficial JioSaavn wrapper)
- **UI**: Inspired by Spotify & YouTube Music
- **Icons**: [lucide-react](https://lucide.dev)
- **Components**: [shadcn/ui](https://ui.shadcn.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
