// IndexedDB Cache Service for better performance and offline support
// Replaces localStorage for larger data storage

interface CachedData {
  key: string
  data: unknown
  timestamp: number
  expiresAt: number
}

const DB_NAME = 'KojinMapsCache'
const DB_VERSION = 1
const STORE_NAME = 'locations'
const DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes

let dbInstance: IDBDatabase | null = null

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('expiresAt', 'expiresAt', { unique: false })
      }
    }
  })
}

/**
 * Set data in cache
 */
export async function setCacheData(
  key: string,
  data: unknown,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const cacheEntry: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(cacheEntry)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    return true
  } catch (error) {
    console.error('Error setting cache:', error)
    return false
  }
}

/**
 * Get data from cache
 */
export async function getCacheData<T>(key: string): Promise<T | null> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const cacheEntry = await new Promise<CachedData | undefined>((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (!cacheEntry) return null

    // Check if expired
    if (Date.now() > cacheEntry.expiresAt) {
      await deleteCacheData(key)
      return null
    }

    return cacheEntry.data as T
  } catch (error) {
    console.error('Error getting cache:', error)
    return null
  }
}

/**
 * Delete specific cache entry
 */
export async function deleteCacheData(key: string): Promise<boolean> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    return true
  } catch (error) {
    console.error('Error deleting cache:', error)
    return false
  }
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('expiresAt')

    const now = Date.now()
    let deletedCount = 0

    const request = index.openCursor()
    
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const entry = cursor.value as CachedData
          if (entry.expiresAt < now) {
            cursor.delete()
            deletedCount++
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })

    return deletedCount
  } catch (error) {
    console.error('Error clearing expired cache:', error)
    return 0
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    return true
  } catch (error) {
    console.error('Error clearing all cache:', error)
    return false
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  expiredEntries: number
  validEntries: number
}> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const allEntries = await new Promise<CachedData[]>((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const now = Date.now()
    const expired = allEntries.filter(e => e.expiresAt < now).length

    return {
      totalEntries: allEntries.length,
      expiredEntries: expired,
      validEntries: allEntries.length - expired
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return { totalEntries: 0, expiredEntries: 0, validEntries: 0 }
  }
}

/**
 * Check if cache has valid data for key
 */
export async function hasCacheData(key: string): Promise<boolean> {
  const data = await getCacheData(key)
  return data !== null
}

/**
 * Get or set cache data (cache-aside pattern)
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Try to get from cache first
  const cached = await getCacheData<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const freshData = await fetchFn()
  
  // Store in cache
  await setCacheData(key, freshData, ttl)
  
  return freshData
}

// Auto-cleanup expired cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    clearExpiredCache().then(count => {
      if (count > 0) {
        console.log(`Cleared ${count} expired cache entries`)
      }
    })
  }, 5 * 60 * 1000)
}
