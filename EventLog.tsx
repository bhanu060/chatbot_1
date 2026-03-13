import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Suspect {
  id: string;
  name: string;
  threatLevel: 'RED' | 'YELLOW' | 'GREEN';
  details: string;
  images: string[]; // Base64 images
  faceDescriptors: Float32Array[]; // The mathematical face data for matching
  createdAt: number;
}

export interface DetectionLog {
  id: string;
  timestamp: number;
  type: 'MATCH' | 'UNKNOWN' | 'SYSTEM';
  message: string;
  snapshot?: string; // Base64 image
  suspectId?: string;
}

interface TacticalDB extends DBSchema {
  suspects: {
    key: string;
    value: Suspect;
    indexes: { 'by-threat': string };
  };
  logs: {
    key: string;
    value: DetectionLog;
    indexes: { 'by-time': number };
  };
}

let dbPromise: Promise<IDBPDatabase<TacticalDB>>;

export async function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<TacticalDB>('TacticalFaceDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('suspects')) {
          const suspectStore = db.createObjectStore('suspects', { keyPath: 'id' });
          suspectStore.createIndex('by-threat', 'threatLevel');
        }
        if (!db.objectStoreNames.contains('logs')) {
          const logStore = db.createObjectStore('logs', { keyPath: 'id' });
          logStore.createIndex('by-time', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

// --- Suspect Methods ---

export async function addSuspect(suspect: Suspect) {
  const db = await initDB();
  await db.put('suspects', suspect);
}

export async function getAllSuspects(): Promise<Suspect[]> {
  const db = await initDB();
  return db.getAll('suspects');
}

export async function deleteSuspect(id: string) {
  const db = await initDB();
  await db.delete('suspects', id);
}

// --- Log Methods ---

export async function addLog(log: DetectionLog) {
  const db = await initDB();
  await db.put('logs', log);
}

export async function getRecentLogs(limit = 50): Promise<DetectionLog[]> {
  const db = await initDB();
  const tx = db.transaction('logs', 'readonly');
  const index = tx.store.index('by-time');
  
  // Get logs sorted by time (newest first)
  let cursor = await index.openCursor(null, 'prev');
  const logs: DetectionLog[] = [];
  
  while (cursor && logs.length < limit) {
    logs.push(cursor.value);
    cursor = await cursor.continue();
  }
  
  return logs;
}

export async function clearLogs() {
  const db = await initDB();
  await db.clear('logs');
}
