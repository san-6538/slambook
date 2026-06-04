// Client-side store for slambook photos, kept in the browser's IndexedDB.
// Photos are recovered from the keepsake file a friend sends back and are NEVER
// uploaded to the server — they live only on the creator's device. Keyed by entry id.

export interface SlambookMedia {
  bestPhoto?: string;
  chaoticMemory?: string;
  neverDelete?: string;
}

const DB_NAME = 'slambook';
const STORE = 'media';
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Save the photos for one entry (keyed by entry id). */
export async function setMedia(entryId: string, media: SlambookMedia): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(media, entryId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/** Get the photos for one entry, or null if none have been imported yet. */
export async function getMedia(entryId: string): Promise<SlambookMedia | null> {
  const db = await openDb();
  try {
    return await new Promise<SlambookMedia | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(entryId);
      req.onsuccess = () => resolve((req.result as SlambookMedia) || null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

/** Whether any photos have been imported for this entry. */
export async function hasMedia(entryId: string): Promise<boolean> {
  const media = await getMedia(entryId);
  return !!(media && (media.bestPhoto || media.chaoticMemory || media.neverDelete));
}

/** Remove an entry's photos (used when the entry is deleted). */
export async function deleteMedia(entryId: string): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(entryId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/**
 * Parse a keepsake file (the HTML a friend sends back) and pull out the embedded
 * slambook data, including photos. Returns null if the file isn't a recognizable
 * slambook keepsake (e.g. a PDF, which can't carry the embedded data).
 */
export interface ParsedKeepsake {
  creatorName?: string;
  friendName?: string;
  relationshipTitle?: string;
  media: SlambookMedia;
}

export function parseKeepsakeHtml(htmlText: string): ParsedKeepsake | null {
  try {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const node = doc.getElementById('slambook-data');
    if (!node || !node.textContent) return null;
    const data = JSON.parse(node.textContent);
    if (!data || typeof data !== 'object') return null;
    return {
      creatorName: data.creatorName,
      friendName: data.friendName,
      relationshipTitle: data.relationshipTitle,
      media: (data.media as SlambookMedia) || {},
    };
  } catch {
    return null;
  }
}
