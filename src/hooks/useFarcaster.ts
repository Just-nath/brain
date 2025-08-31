import { useState, useEffect, useCallback } from 'react'

interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
}

export function useFarcaster() {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we're in a Farcaster Frame context
  const isInFrame = typeof window !== 'undefined' && window.location.search.includes('frame=1')

  // Initialize Farcaster authentication
  const initializeAuth = useCallback(async () => {
    try {
      // Auto-sign in using our API
      if (typeof window !== 'undefined') {
        // Try to get authenticated user from our API
        try {
          const res = await fetch(`${window.location.origin}/api/me`)
          if (res.ok) {
            const userData = await res.json()
            setUser(userData)
            setIsAuthenticated(true)
            localStorage.setItem('farcaster_user', JSON.stringify(userData))
            return
          }
        } catch (apiError) {
          console.error('API error:', apiError)
        }
      }

      // Check for existing session in localStorage as fallback
      const savedUser = localStorage.getItem('farcaster_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser) as FarcasterUser
          setUser(userData)
          setIsAuthenticated(true)
        } catch (e) {
          console.error('Error parsing saved user data:', e)
          localStorage.removeItem('farcaster_user')
        }
      }
    } catch (error) {
      console.error('Farcaster auth initialization error:', error)
    }
  }, [])

  // Sign in with Farcaster
  const signIn = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate authentication for now
      // In production, this would integrate with the actual Farcaster auth system
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
      await initializeAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      console.error('Farcaster sign-in error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [initializeAuth])

  // Sign out
  const signOut = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('farcaster_user')
  }, [])

  // Get user's personal best score
  const getPersonalBest = useCallback(() => {
    if (!user) return null
    
    const key = `personal_best_${user.fid}`
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  }, [user])

  // Save user's personal best score
  const savePersonalBest = useCallback((score: number, totalQuestions: number, timeTaken: number) => {
    if (!user) return false
    
    const key = `personal_best_${user.fid}`
    const currentBest = getPersonalBest()
    
    if (!currentBest || score > currentBest.score || (score === currentBest.score && timeTaken < currentBest.timeTaken)) {
      const newBest = {
        score,
        totalQuestions,
        timeTaken,
        date: new Date().toISOString(),
        percentage: Math.round((score / totalQuestions) * 100)
      }
      localStorage.setItem(key, JSON.stringify(newBest))
      return true
    }
    
    return false
  }, [user, getPersonalBest])

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    getPersonalBest,
    savePersonalBest,
    isInFrame
  }
}
