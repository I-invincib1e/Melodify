# Melodify — Design System

## Aesthetic
Dark, immersive music player inspired by Spotify + YouTube Music. Deep blacks with subtle warm grays. Green accent (#1DB954 Spotify green) for primary actions, progress bars, active states.

## Colors
- Background: #000000 (pure black)
- Surface: #121212 (cards, sidebar)
- Surface Elevated: #1a1a1a (hover states, elevated cards)
- Surface Highlight: #282828 (active/selected items)
- Text Primary: #FFFFFF
- Text Secondary: #b3b3b3
- Text Tertiary: #727272
- Accent/Primary: #1DB954 (green)
- Accent Hover: #1ed760

## Typography
- Font: "Figtree" from Google Fonts — modern, clean, geometric
- Headings: Bold, tight tracking
- Body: 400 weight, relaxed

## Layout
- Left sidebar (fixed, 280px) with navigation + library
- Main content area (scrollable)
- Bottom player bar (fixed, ~90px)
- Cards: rounded-lg, hover scale/brightness transitions

## Components
- Song rows: album art thumbnail + title + artist + duration, hover play button
- Album/playlist cards: square art, title below, subtle hover lift
- Player: album art, song info, controls center, volume right
- Search: full-width with instant results

## Interactions
- Hover on cards: slight brightness increase + scale
- Play button appears on hover over song rows
- Smooth transitions on page navigation
- Progress bar: green, interactive seek
