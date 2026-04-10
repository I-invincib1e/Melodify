// Simple Promisified wrapper around IndexedDB for offline audio caching
const DB_NAME = "melodify-offline-db";
const STORE_NAME = "audio-cache";
const DB_VERSION = 1;

function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function cacheAudio(songId: string, url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch audio block");
    const blob = await res.blob();
    
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, songId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Cache failed:", err);
    return false;
  }
}

export async function getCachedAudioUrl(songId: string): Promise<string | null> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(songId);
      req.onsuccess = () => {
        const blob = req.result;
        if (blob instanceof Blob) resolve(URL.createObjectURL(blob));
        else resolve(null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return null;
  }
}

export async function removeCachedAudio(songId: string): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(songId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {}
}

export async function isAudioCached(songId: string): Promise<boolean> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(songId);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}
