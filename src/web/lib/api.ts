const BASE = "https://saavn.sumit.co/api";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "API Error");
  return data.data;
}

// ---- Types ----
export interface ImageQuality {
  quality: string;
  url: string;
}

export interface Artist {
  id: string;
  name: string;
  role?: string;
  type: string;
  image: ImageQuality[];
  url: string;
}

export interface Song {
  id: string;
  name: string;
  type: string;
  year: string | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
  image: ImageQuality[];
  downloadUrl: ImageQuality[];
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  type: string;
  year: number | string | null;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  url: string;
  songCount: number | null;
  artists: {
    primary: Artist[];
    featured?: Artist[];
    all?: Artist[];
  };
  image: ImageQuality[];
  songs?: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  type: string;
  year: number | null;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  url: string;
  songCount: number | null;
  artists: Artist[];
  image: ImageQuality[];
  songs?: Song[];
}

export interface ArtistDetail {
  id: string;
  name: string;
  url: string;
  type: string;
  followerCount: number;
  fanCount: string;
  isVerified: boolean;
  dominantLanguage: string;
  dominantType: string;
  bio: { text: string; title: string; sequence: number }[];
  image: ImageQuality[];
  wiki: string;
  topSongs: Song[];
  topAlbums: Album[];
  singles: Album[];
  similarArtists: Artist[];
}

export interface SearchResult {
  albums: { results: Album[]; position: number };
  songs: { results: (Song & { primaryArtists: string; singers: string; album: string; description: string })[]; position: number };
  artists: { results: (Artist & { description: string; position: number })[]; position: number };
  playlists: { results: (Playlist & { description: string })[]; position: number };
  topQuery: { results: any[]; position: number };
}

export interface SongSearchResult {
  total: number;
  start: number;
  results: Song[];
}

// ---- API Functions ----
export function globalSearch(query: string) {
  return fetchApi<SearchResult>(`/search?query=${encodeURIComponent(query)}`);
}

export function searchSongs(query: string, page = 0, limit = 20) {
  return fetchApi<SongSearchResult>(
    `/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
}

export function searchAlbums(query: string, page = 0, limit = 20) {
  return fetchApi<{ total: number; start: number; results: Album[] }>(
    `/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
}

export function searchArtists(query: string, page = 0, limit = 20) {
  return fetchApi<{ total: number; start: number; results: Artist[] }>(
    `/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
}

export function getSongById(id: string) {
  return fetchApi<Song[]>(`/songs/${id}`);
}

export function getAlbum(id: string) {
  return fetchApi<Album>(`/albums?id=${id}`);
}

export function getPlaylist(id: string) {
  return fetchApi<Playlist>(`/playlists?id=${id}`);
}

export function getArtist(id: string) {
  return fetchApi<ArtistDetail>(`/artists/${id}`);
}

export function getArtistSongs(id: string, page = 0) {
  return fetchApi<{ total: number; songs: Song[] }>(
    `/artists/${id}/songs?page=${page}`
  );
}

export function getArtistAlbums(id: string, page = 0) {
  return fetchApi<{ total: number; albums: Album[] }>(
    `/artists/${id}/albums?page=${page}`
  );
}

// Helpers
export function getHighQualityImage(images: ImageQuality[]): string {
  if (!images || images.length === 0) return "";
  return images[images.length - 1]?.url || images[0]?.url || "";
}

export function getMediumQualityImage(images: ImageQuality[]): string {
  if (!images || images.length === 0) return "";
  if (images.length >= 2) return images[1]?.url || images[0]?.url || "";
  return images[0]?.url || "";
}

export function getBestDownloadUrl(urls: ImageQuality[]): string {
  if (!urls || urls.length === 0) return "";
  return urls[urls.length - 1]?.url || urls[0]?.url || "";
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatPlayCount(count: number | null): string {
  if (!count) return "";
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function decodeHtml(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
