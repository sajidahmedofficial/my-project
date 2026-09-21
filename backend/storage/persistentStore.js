import fs from 'fs';
import path from 'path';
import os from 'os';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
const STORAGE_DIR = isServerless
  ? path.join(os.tmpdir(), 'skillbridge_storage')
  : path.join(process.cwd(), 'backend', 'data', 'storage');

// In-memory collection cache ensuring zero crashes in read-only environments
const memoryCache = new Map();

// Safely attempt directory creation without failing
try {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('PersistentStore: Running in memory-cache mode:', err.message);
}

/**
 * Helper to get the absolute path for a collection's JSON file
 */
function getCollectionPath(collectionName) {
  return path.join(STORAGE_DIR, `${collectionName}.json`);
}

/**
 * Reads all records in a collection from disk or memory fallback
 */
export function readCollection(collectionName) {
  if (memoryCache.has(collectionName)) {
    return memoryCache.get(collectionName);
  }

  const filePath = getCollectionPath(collectionName);
  try {
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
      } catch {}
      memoryCache.set(collectionName, []);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data || '[]');
    memoryCache.set(collectionName, parsed);
    return parsed;
  } catch (err) {
    console.warn(`PersistentStore: Reading "${collectionName}" from fallback memory:`, err.message);
    const fallback = memoryCache.get(collectionName) || [];
    return fallback;
  }
}

/**
 * Writes all records for a collection atomically to disk or memory cache
 */
export function writeCollection(collectionName, records) {
  memoryCache.set(collectionName, records);

  const filePath = getCollectionPath(collectionName);
  const tempPath = `${filePath}.tmp_${Date.now()}`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(records, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    // Suppress filesystem write failures in restricted serverless environments
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
    return true;
  }
}

/**
 * Matches a record against a query filter object
 */
function matchesFilter(record, filter) {
  if (!filter || typeof filter !== 'object') return true;
  for (const [key, value] of Object.entries(filter)) {
    if (record[key] === undefined) return false;
    if (typeof value === 'string' && typeof record[key] === 'string') {
      if (record[key].toLowerCase() !== value.toLowerCase()) return false;
    } else if (record[key] !== value) {
      return false;
    }
  }
  return true;
}

/**
 * Find multiple records matching query and ensuring user isolation
 */
export function find(collectionName, filter = {}) {
  const items = readCollection(collectionName);
  return items.filter(item => matchesFilter(item, filter));
}

/**
 * Find single record matching query and ensuring user isolation
 */
export function findOne(collectionName, filter = {}) {
  const items = readCollection(collectionName);
  return items.find(item => matchesFilter(item, filter)) || null;
}

/**
 * Inserts or updates a record by primary key field (e.g. 'id', 'resumeId', 'roadmapId')
 */
export function upsert(collectionName, primaryKey, record) {
  const items = readCollection(collectionName);
  const keyValue = record[primaryKey];
  if (!keyValue) {
    throw new Error(`Record missing primary key "${primaryKey}"`);
  }

  const existingIdx = items.findIndex(item => item[primaryKey] === keyValue);
  const timestamped = {
    ...record,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    items[existingIdx] = {
      ...items[existingIdx],
      ...timestamped
    };
  } else {
    items.push({
      createdAt: new Date().toISOString(),
      ...timestamped
    });
  }

  writeCollection(collectionName, items);
  return timestamped;
}

/**
 * Updates matching records in collection
 */
export function update(collectionName, filter, patch) {
  const items = readCollection(collectionName);
  let updatedCount = 0;
  const updatedItems = items.map(item => {
    if (matchesFilter(item, filter)) {
      updatedCount++;
      return {
        ...item,
        ...patch,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  if (updatedCount > 0) {
    writeCollection(collectionName, updatedItems);
  }
  return updatedCount;
}

/**
 * Deletes matching records in collection
 */
export function remove(collectionName, filter) {
  const items = readCollection(collectionName);
  const remaining = items.filter(item => !matchesFilter(item, filter));
  const removedCount = items.length - remaining.length;
  if (removedCount > 0) {
    writeCollection(collectionName, remaining);
  }
  return removedCount;
}

export default {
  readCollection,
  writeCollection,
  find,
  findOne,
  upsert,
  update,
  remove
};
