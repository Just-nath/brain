// Simple in-memory cache for API responses and user data
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 1000

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Create singleton cache instance
export const cache = new MemoryCache()

// Cache keys
export const CACHE_KEYS = {
  FARCASTER_USERS: 'farcaster_users',
  QUIZ_QUESTIONS: 'quiz_questions',
  LEADERBOARD: 'leaderboard',
  USER_SCORES: 'user_scores',
} as const

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  FARCASTER_USERS: 10 * 60 * 1000, // 10 minutes
  QUIZ_QUESTIONS: 5 * 60 * 1000,   // 5 minutes
  LEADERBOARD: 2 * 60 * 1000,      // 2 minutes
  USER_SCORES: 5 * 60 * 1000,      // 5 minutes
} as const

// Utility functions
export function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.QUIZ_QUESTIONS
): Promise<T> {
  const cached = cache.get<T>(key)
  
  if (cached) {
    return Promise.resolve(cached)
  }

  return fetcher().then(data => {
    cache.set(key, data, ttl)
    return data
  })
}

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}

