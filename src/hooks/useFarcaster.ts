"use client"

import { useState, useEffect, useCallback } from "react"
import { sdk, type ReadyOptions } from "@farcaster/miniapp-sdk"

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
  isInMiniApp: boolean
  markReady: (options?: Partial<ReadyOptions>) => Promise<void>
}

export function useFarcaster(): UseFarcasterReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [personalBest, setPersonalBest] = useState<number | null>(null)
  const [isInMiniApp, setIsInMiniApp] = useState(false)

  // Check if running in Farcaster frame
  const isInFrame = typeof window !== 'undefined' && 
    (window.location !== window.parent.location || 
     window.navigator.userAgent.includes('Farcaster'))

  // Initialize SDK and check if in miniapp context
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if we're in a Farcaster miniapp
        const inMiniApp = await sdk.isInMiniApp()
        setIsInMiniApp(inMiniApp)
        
        console.log('[Farcaster SDK] Running in miniapp context:', inMiniApp)
        
        // If we're in a miniapp, auto-login and mark as ready
        if (inMiniApp) {
          try {
            // Get user info from miniapp context
            const userInfo = await sdk.actions.getUser()
            
            if (userInfo && userInfo.fid) {
              const farcasterUser: FarcasterUser = {
                fid: userInfo.fid,
                username: userInfo.username || `user_${userInfo.fid}`,
                displayName: userInfo.displayName || userInfo.username || `User ${userInfo.fid}`,
                pfpUrl: userInfo.pfpUrl || '/icon.png',
                followerCount: userInfo.followerCount || 0
              }
              
              setUser(farcasterUser)
              setIsAuthenticated(true)
              localStorage.setItem('farcaster_user', JSON.stringify(farcasterUser))
              console.log('[Farcaster SDK] Auto-logged in user:', farcasterUser)
            }
          } catch (userError) {
            console.log('[Farcaster SDK] Could not get user info, will use fallback auth:', userError)
          }
          
          await sdk.actions.ready({
            disableNativeGestures: false // Allow native gestures by default
          })
          console.log('[Farcaster SDK] Miniapp marked as ready')
        }
      } catch (err) {
        console.error('[Farcaster SDK] Failed to initialize:', err)
      }
    }

    initializeSDK()
  }, [])

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

  const signIn = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (isInMiniApp) {
        // Try to get user info from miniapp context
        const userInfo = await sdk.actions.getUser()
        
        if (userInfo && userInfo.fid) {
          const farcasterUser: FarcasterUser = {
            fid: userInfo.fid,
            username: userInfo.username || `user_${userInfo.fid}`,
            displayName: userInfo.displayName || userInfo.username || `User ${userInfo.fid}`,
            pfpUrl: userInfo.pfpUrl || '/icon.png',
            followerCount: userInfo.followerCount || 0
          }
          
          setUser(farcasterUser)
          setIsAuthenticated(true)
          localStorage.setItem('farcaster_user', JSON.stringify(farcasterUser))
          console.log('[Farcaster SDK] Signed in user:', farcasterUser)
        } else {
          throw new Error('Could not get user info from miniapp')
        }
      } else {
        // Fallback for non-miniapp context
        const mockUser: FarcasterUser = {
          fid: Math.floor(Math.random() * 100000) + 1,
          username: 'demo_user',
          displayName: 'Demo User',
          pfpUrl: '/icon.png',
          followerCount: Math.floor(Math.random() * 10000) + 1000
        }
        
        setUser(mockUser)
        setIsAuthenticated(true)
        localStorage.setItem('farcaster_user', JSON.stringify(mockUser))
        console.log('[Demo] Signed in demo user:', mockUser)
      }
    } catch (err) {
      setError('Failed to sign in')
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isInMiniApp])

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

  const markReady = useCallback(async (options?: Partial<ReadyOptions>) => {
    try {
      if (isInMiniApp) {
        await sdk.actions.ready(options)
        console.log('[Farcaster SDK] Manually marked as ready with options:', options)
      }
    } catch (err) {
      console.error('[Farcaster SDK] Failed to mark ready:', err)
    }
  }, [isInMiniApp])

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    signIn,
    signOut,
    isInFrame,
    personalBest,
    updatePersonalBest,
    isInMiniApp,
    markReady
  }
}