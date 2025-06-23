// Simple storage abstraction
// Uses environment variable for development, can be extended for production databases

let storage = new Map();

// Initialize storage from environment if available
if (process.env.READING_LIST_DATA) {
  try {
    const data = JSON.parse(process.env.READING_LIST_DATA);
    storage.set('reading-list', data);
  } catch (error) {
    console.log('No existing reading list data found');
  }
}

export async function storageGet(key) {
  try {
    // In production, you could use Vercel KV, Redis, or any database
    // For now, we'll use a simple in-memory store with env variable fallback
    
    if (storage.has(key)) {
      return storage.get(key);
    }
    
    // Try to load from environment variable on first access
    if (key === 'reading-list' && process.env.READING_LIST_DATA) {
      const data = JSON.parse(process.env.READING_LIST_DATA);
      storage.set(key, data);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
}

export async function storageSet(key, value) {
  try {
    // Store in memory
    storage.set(key, value);
    
    // In a real production environment, you would:
    // 1. Use Vercel KV: await kv.set(key, JSON.stringify(value))
    // 2. Use a database: await db.collection('reading-list').replaceOne({key}, {data: value})
    // 3. Use file system: await fs.writeFile(`/tmp/${key}.json`, JSON.stringify(value))
    
    console.log(`Stored ${key} with ${Array.isArray(value) ? value.length : 1} items`);
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

export async function storageDelete(key) {
  try {
    storage.delete(key);
    return true;
  } catch (error) {
    console.error('Storage delete error:', error);
    return false;
  }
}

// For development, log current storage state
export function getStorageInfo() {
  return {
    keys: Array.from(storage.keys()),
    sizes: Object.fromEntries(
      Array.from(storage.entries()).map(([key, value]) => [
        key, 
        Array.isArray(value) ? value.length : typeof value
      ])
    )
  };
} 