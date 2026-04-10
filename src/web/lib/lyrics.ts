interface ParsedLyric {
  time: number;
  text: string;
}

export async function fetchLyrics(trackName: string, artistName: string): Promise<ParsedLyric[] | null> {
  if (!trackName) return null;
  
  try {
    const url = new URL('https://lrclib.net/api/search');
    url.searchParams.append('track_name', trackName.replace(/\(.*\)/g, '').trim()); // Strip metadata like "(From X movie)"
    if (artistName) url.searchParams.append('artist_name', artistName);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    if (data && data.length > 0 && data[0].syncedLyrics) {
      return parseLrc(data[0].syncedLyrics);
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch lyrics:", e);
    return null;
  }
}

function parseLrc(lrcContent: string): ParsedLyric[] {
  const lines = lrcContent.split('\n');
  const result: ParsedLyric[] = [];

  for (const line of lines) {
    // Math [mm:ss.xx] or [mm:ss.xxx]
    const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let millis = parseInt(match[3], 10);
      if (match[3].length === 2) millis *= 10;

      const timeInSeconds = minutes * 60 + seconds + millis / 1000;
      const text = match[4].trim();

      if (text) { // ignore pure empty timings
        result.push({ time: timeInSeconds, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}
