import { useState, useEffect, useCallback } from 'react'
import { sdk } from '@farcaster/frame-sdk'

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

  // Check if we're in a Farcaster Mini App context
  const isInFrame = typeof window !== 'undefined' && window.location.search.includes('frame=1')

  // Initialize Farcaster SDK
  const initializeSDK = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        // Call sdk.actions.ready() as required by Farcaster Mini App docs
        await sdk.actions.ready()
        return sdk
      }
    } catch (error) {
      console.error('Failed to initialize Farcaster SDK:', error)
    }
    return null
  }, [])

  // Initialize Farcaster authentication
  const initializeAuth = useCallback(async () => {
    try {
      const miniAppSDK = await initializeSDK()
      if (!miniAppSDK) {
        throw new Error('Failed to initialize Farcaster SDK')
      }

      // Auto-connect: Try to authenticate immediately
      try {
        // Use the SDK to fetch user data from the /me endpoint
        const response = await miniAppSDK.quickAuth.fetch('/me')
        if (response.ok) {
          const userData = await response.json()
          const user: FarcasterUser = {
            fid: userData.fid || 0,
            username: userData.username || 'unknown',
            displayName: userData.displayName || userData.username || 'Unknown User',
            pfpUrl: userData.pfpUrl || '/default-pfp.png'
          }
          setUser(user)
          setIsAuthenticated(true)
          localStorage.setItem('farcaster_user', JSON.stringify(user))
          return
        }
      } catch {
        console.log('Auto-connect failed, trying fallback')
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
      } else {
        // If no saved user and auto-connect failed, create a default user for demo purposes
        const defaultUser: FarcasterUser = {
          fid: 0,
          username: 'demo_user',
          displayName: 'Demo User',
          pfpUrl: '/default-pfp.png'
        }
        setUser(defaultUser)
        setIsAuthenticated(true)
        localStorage.setItem('farcaster_user', JSON.stringify(defaultUser))
      }
    } catch (error) {
      console.error('Farcaster auth initialization error:', error)
      // Even if auth fails, set a default user so the app works
      const defaultUser: FarcasterUser = {
        fid: 0,
        username: 'demo_user',
        displayName: 'Demo User',
        pfpUrl: '/default-pfp.png'
      }
      setUser(defaultUser)
      setIsAuthenticated(true)
    }
  }, [initializeSDK])

  // Sign in with Farcaster
  const signIn = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const miniAppSDK = await initializeSDK()
      if (!miniAppSDK) {
        throw new Error('Failed to initialize Farcaster SDK')
      }

      // Authenticate user by fetching user data
      const response = await miniAppSDK.quickAuth.fetch('/me')
      if (response.ok) {
        const userData = await response.json()
        const user: FarcasterUser = {
          fid: userData.fid || 0,
          username: userData.username || 'unknown',
          displayName: userData.displayName || userData.username || 'Unknown User',
          pfpUrl: userData.pfpUrl || '/default-pfp.png'
        }
        setUser(user)
        setIsAuthenticated(true)
        localStorage.setItem('farcaster_user', JSON.stringify(user))
      } else {
        throw new Error('Authentication failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      console.error('Farcaster sign-in error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [initializeSDK])

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
    
    const scoreData = {
      score,
      totalQuestions,
      timeTaken,
      date: new Date().toISOString(),
      percentage: Math.round((score / totalQuestions) * 100)
    }
    
    if (!currentBest || score > currentBest.score || (score === currentBest.score && timeTaken < currentBest.timeTaken)) {
      localStorage.setItem(key, JSON.stringify(scoreData))
      
      // Also save as daily score if it's better
      saveDailyScore(score, totalQuestions, timeTaken)
      
      // Add to recent scores
      addToRecentScores(scoreData)
      
      return true
    }
    
    // Even if not personal best, still save daily and recent scores
    saveDailyScore(score, totalQuestions, timeTaken)
    addToRecentScores(scoreData)
    
    return false
  }, [user, getPersonalBest])

  // Save daily score (best score for today)
  const saveDailyScore = useCallback((score: number, totalQuestions: number, timeTaken: number) => {
    if (!user) return false
    
    const today = new Date().toDateString()
    const dailyKey = `daily_score_${user.fid}_${today}`
    const currentDaily = localStorage.getItem(dailyKey)
    
    const scoreData = {
      score,
      totalQuestions,
      timeTaken,
      date: new Date().toISOString(),
      percentage: Math.round((score / totalQuestions) * 100)
    }
    
    if (!currentDaily || score > JSON.parse(currentDaily).score) {
      localStorage.setItem(dailyKey, JSON.stringify(scoreData))
      return true
    }
    
    return false
  }, [user])

  // Add score to recent scores list
  const addToRecentScores = useCallback((scoreData: any) => {
    if (!user) return false
    
    const recentKey = `recent_scores_${user.fid}`
    const currentRecent = localStorage.getItem(recentKey)
    const recentScores = currentRecent ? JSON.parse(currentRecent) : []
    
    // Add new score to beginning
    recentScores.unshift(scoreData)
    
    // Keep only last 20 scores
    const updatedRecent = recentScores.slice(0, 20)
    
    localStorage.setItem(recentKey, JSON.stringify(updatedRecent))
    return true
  }, [user])

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
    saveDailyScore,
    addToRecentScores,
    isInFrame,
    sdk
  }
}
