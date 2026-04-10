# Melodify V2 — Major UI Enhancement

## Enhancement Plan

### 1. CSS/Animations Overhaul (styles.css)
- Staggered reveal animations with delay classes
- Equalizer bars animation for now-playing
- Marquee for long text in player
- Vinyl spin animation for album art in player
- Smooth page transitions
- Better skeleton shimmer animation
- Gradient color extraction feel

### 2. Layout/App (app.tsx)  
- Page transition wrapper with animations
- Scroll-to-top on navigation
- Proper responsive breakpoints

### 3. Player — MAJOR overhaul (player.tsx)
- Full-screen expandable player (mobile tap to expand)
- Animated album art with vinyl/glow effect when playing
- Marquee scrolling for long song names
- Like/heart button
- Lyrics placeholder
- Better mobile layout (stacked controls)
- Animated equalizer bars in mini-player
- Gradient background extracted from art
- Smooth transitions between songs

### 4. Sidebar — Enhanced (sidebar.tsx)
- Recently played section (tracks history from store)
- Liked songs section
- Animated active indicator
- Collapsible on medium screens
- Better hover states

### 5. Mobile Nav — Enhanced (mobile-nav.tsx)
- Animated active indicator pill
- Better spacing and icons

### 6. Song Row — Enhanced (song-row.tsx)
- Proper equalizer animation (not just pulse)
- Explicit tag badge
- Album name column on wider screens
- Better hover animation
- Right-click context menu idea via dropdown

### 7. Card Grid — Enhanced (card-grid.tsx)
- Horizontal scroll variant for sections
- Staggered entry animation per card
- Better shadow and hover effects
- Skeleton loading state built in
- "See all" link

### 8. Home Page — Major restructure (index.tsx)
- Quick-play grid (Spotify's 2x3 compact cards at top)
- Horizontal scrolling carousels
- Featured/hero banner at top
- Better section headers with "Show all" links
- Staggered loading

### 9. Search Page — Enhanced (search.tsx)
- Top result card (large, left side)
- Better category grid with icons/emojis
- Recent searches
- Tabs for filtering (All/Songs/Albums/Artists)

### 10. Album Page — Enhanced (album.tsx)
- Dynamic gradient from album art color  
- Sticky play bar on scroll
- Table header for songs
- Better responsive layout

### 11. Artist Page — Enhanced (artist.tsx)
- Parallax hero effect on scroll
- Monthly listeners stat
- Better bio section with expand/collapse
- Discography tabs

### 12. New: Liked Songs store + page
- Heart songs from anywhere
- Persist to localStorage

### 13. Store enhancements
- Liked songs with localStorage persistence
- Recently played tracking
- Search history

## Execution Order
1. Store + API enhancements
2. Styles/animations
3. New components (horizontal scroll, page wrapper, mini player card, etc.)
4. Rewrite each page
5. Wire up app.tsx
6. Test
