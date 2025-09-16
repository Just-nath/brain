"use client"

import { useState, useEffect, useCallback } from "react"

export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  followerCount?: number
}

interface UseFarcasterReturn {
  isAuthenticated: boolean
  isLoading: boolean
  user: FarcasterUser | null
  error: string | null
  signIn: () => void
  signOut: () => void
  isInFrame: boolean
  personalBest: number | null
  updatePersonalBest: (score: number) => void
}

export function useFarcaster(): UseFarcasterReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [personalBest, setPersonalBest] = useState<number | null>(null)

  // Check if running in Farcaster frame
  const isInFrame = typeof window !== 'undefined' && 
    (window.location !== window.parent.location || 
     window.navigator.userAgent.includes('Farcaster'))

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('farcaster_user')
        const storedPersonalBest = localStorage.getItem('farcaster_personal_best')
        
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        }
        
        if (storedPersonalBest) {
          setPersonalBest(parseInt(storedPersonalBest, 10))
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const signIn = useCallback(() => {
    setIsLoading(true)
    setError(null)
    
    // Simulate Farcaster authentication
    // In production, this would integrate with actual Farcaster auth
    setTimeout(() => {
      try {
        const mockUser: FarcasterUser = {
          fid: Math.floor(Math.random() * 100000) + 1,
          username: 'farcaster_user',
          displayName: 'Farcaster User',
          pfpUrl: '/icon.png',
          followerCount: Math.floor(Math.random() * 10000) + 1000
        }
        
        setUser(mockUser)
        setIsAuthenticated(true)
        localStorage.setItem('farcaster_user', JSON.stringify(mockUser))
      } catch (err) {
        setError('Failed to sign in')
        console.error('Sign in error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 1000)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    setPersonalBest(null)
    localStorage.removeItem('farcaster_user')
    localStorage.removeItem('farcaster_personal_best')
  }, [])

  const updatePersonalBest = useCallback((score: number) => {
    if (personalBest === null || score > personalBest) {
      setPersonalBest(score)
      localStorage.setItem('farcaster_personal_best', score.toString())
    }
  }, [personalBest])

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    signIn,
    signOut,
    isInFrame,
    personalBest,
    updatePersonalBest
  }
}