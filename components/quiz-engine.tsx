"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Trophy,
  
  Share2,
  RotateCcw,
  
  XCircle,
} from "lucide-react"
import Image from "next/image"
import { useFarcaster } from "../src/hooks/useFarcaster"

const QUIZ_TIME_LIMIT = 10 * 60 // 10 minutes in seconds
const NEYNAR_API_KEY = "3367EB2F-69DE-4AF5-9057-68162A77AED3"
const MINI_APP_FRAME_LINK = "https://farcaster.xyz/miniapps/w9n2GeLADNIy/brains---farcaster-pfp-quiz"

interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  followerCount: number
  bio?: string
}

interface QuizQuestion {
  id: number
  profilePictureUrl: string
  correctAnswer: string
  options: string[]
  correctUser: FarcasterUser
}

interface QuizEngineProps {
  onComplete: () => void
  launchingAccount?: string
}

export default function QuizEngine({ onComplete, launchingAccount }: QuizEngineProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_TIME_LIMIT)
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  const { user, savePersonalBest } = useFarcaster()

  // Fetch real Farcaster users with proper filtering (via server API to avoid exposing API key)
  const fetchFarcasterUsers = useCallback(async (): Promise<FarcasterUser[]> => {
    try {
      console.log("[v1] Fetching Farcaster users from /api/users...")
      const response = await fetch(`/api/users?count=100`, { cache: 'no-store' })

      if (!response.ok) {
        throw new Error(`Users API request failed: ${response.status}`)
      }

      const data: unknown = await response.json()
      const usersArray = (data as { users?: unknown }).users
      if (!Array.isArray(usersArray)) {
        throw new Error("No users found in API response")
      }

      const filteredUsers: FarcasterUser[] = usersArray
        .map((userRaw: unknown) => {
          const user = userRaw as {
            fid: number
            username: string
            display_name?: string
            pfp_url?: string
            follower_count?: number
            profile?: { pfp?: { url?: string }, bio?: { text?: string } }
          }
          return ({
            fid: user.fid,
            username: user.username,
            displayName: user.display_name || user.username,
            pfpUrl: user.pfp_url || user.profile?.pfp?.url || "",
            followerCount: user.follower_count || 0,
            bio: user.profile?.bio?.text || "",
          })
        })
        .filter((u: FarcasterUser) => !!u.username && !!u.pfpUrl)
        .slice(0, 100)

      console.log(`[v1] Received ${filteredUsers.length} qualified users`)

      // Add launching account if specified
      if (launchingAccount) {
        try {
          const launchingUserResponse = await fetch(
            `https://api.neynar.com/v2/farcaster/user/by_username?username=${launchingAccount}`,
            {
              headers: {
                Authorization: `Bearer ${NEYNAR_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          )

          if (launchingUserResponse.ok) {
            const launchingUserData = await launchingUserResponse.json()
            const launchingUser = launchingUserData.result?.user

            if (launchingUser && !filteredUsers.some((user) => user.username === launchingAccount)) {
              const formattedLaunchingUser: FarcasterUser = {
                fid: launchingUser.fid,
                username: launchingUser.username,
                displayName: launchingUser.display_name || launchingUser.username,
                pfpUrl: launchingUser.pfp_url || "/default-pfp.png",
                followerCount: launchingUser.follower_count || 0,
                bio: launchingUser.profile?.bio?.text || "",
              }
              filteredUsers.unshift(formattedLaunchingUser)
            }
          }
        } catch (launchingUserError) {
          console.error("[v1] Error fetching launching user:", launchingUserError)
        }
      }

      if (filteredUsers.length < 20) {
        throw new Error("Not enough qualified users found (need at least 20)")
      }

      return filteredUsers
    } catch (error) {
      console.error("[v1] Error fetching Farcaster users:", error)
      
      // Fallback to mock data if API fails
      const mockUsers: FarcasterUser[] = [
        {
          fid: 3,
          username: "dwr.eth",
          displayName: "Dan Romero",
          pfpUrl: "https://picsum.photos/200/200?random=1",
          followerCount: 45000,
          bio: "Co-founder of Farcaster",
        },
        {
          fid: 1,
          username: "vitalik.eth",
          displayName: "Vitalik Buterin",
          pfpUrl: "https://picsum.photos/200/200?random=2",
          followerCount: 120000,
          bio: "Ethereum founder",
        },
        {
          fid: 2,
          username: "jessepollak",
          displayName: "Jesse Pollak",
          pfpUrl: "https://picsum.photos/200/200?random=3",
          followerCount: 35000,
          bio: "Base Protocol Lead at Coinbase",
        },
        {
          fid: 4,
          username: "balajis.eth",
          displayName: "Balaji Srinivasan",
          pfpUrl: "https://picsum.photos/200/200?random=4",
          followerCount: 85000,
          bio: "Former CTO of Coinbase",
        },
        {
          fid: 5,
          username: "patrickalphac",
          displayName: "Patrick Collins",
          pfpUrl: "https://picsum.photos/200/200?random=5",
          followerCount: 25000,
          bio: "Smart contract developer",
        },
        {
          fid: 6,
          username: "naval",
          displayName: "Naval Ravikant",
          pfpUrl: "https://picsum.photos/200/200?random=6",
          followerCount: 95000,
          bio: "AngelList founder",
        },
        {
          fid: 7,
          username: "hayden.eth",
          displayName: "Hayden Adams",
          pfpUrl: "https://picsum.photos/200/200?random=7",
          followerCount: 40000,
          bio: "Uniswap founder",
        },
        {
          fid: 8,
          username: "linda.eth",
          displayName: "Linda Xie",
          pfpUrl: "https://picsum.photos/200/200?random=8",
          followerCount: 30000,
          bio: "Scalar Capital co-founder",
        },
        {
          fid: 9,
          username: "coopahtroopa.eth",
          displayName: "Cooper Turley",
          pfpUrl: "https://picsum.photos/200/200?random=9",
          followerCount: 28000,
          bio: "Music NFT advocate",
        },
        {
          fid: 10,
          username: "stani.eth",
          displayName: "Stani Kulechov",
          pfpUrl: "https://picsum.photos/200/200?random=10",
          followerCount: 32000,
          bio: "Aave founder",
        },
        {
          fid: 11,
          username: "punk6529",
          displayName: "6529",
          pfpUrl: "https://picsum.photos/200/200?random=11",
          followerCount: 55000,
          bio: "NFT collector and advocate",
        },
        {
          fid: 12,
          username: "cdixon.eth",
          displayName: "Chris Dixon",
          pfpUrl: "https://picsum.photos/200/200?random=12",
          followerCount: 75000,
          bio: "a16z crypto partner",
        },
        {
          fid: 13,
          username: "danfinlay",
          displayName: "Dan Finlay",
          pfpUrl: "https://picsum.photos/200/200?random=13",
          followerCount: 22000,
          bio: "MetaMask co-founder",
        },
        {
          fid: 14,
          username: "bankless",
          displayName: "Bankless",
          pfpUrl: "https://picsum.photos/200/200?random=14",
          followerCount: 65000,
          bio: "DeFi media brand",
        },
        {
          fid: 15,
          username: "kempsterrrr.eth",
          displayName: "Kempster",
          pfpUrl: "https://picsum.photos/200/200?random=15",
          followerCount: 18000,
          bio: "DAO governance expert",
        },
        {
          fid: 16,
          username: "hasu",
          displayName: "Hasu",
          pfpUrl: "https://picsum.photos/200/200?random=16",
          followerCount: 42000,
          bio: "Crypto researcher",
        },
        {
          fid: 17,
          username: "gakonst",
          displayName: "Georgios Konstantopoulos",
          pfpUrl: "https://picsum.photos/200/200?random=17",
          followerCount: 38000,
          bio: "Paradigm research partner",
        },
        {
          fid: 18,
          username: "samczsun",
          displayName: "samczsun",
          pfpUrl: "https://picsum.photos/200/200?random=18",
          followerCount: 48000,
          bio: "Security researcher",
        },
        {
          fid: 19,
          username: "cobie",
          displayName: "Cobie",
          pfpUrl: "https://picsum.photos/200/200?random=19",
          followerCount: 52000,
          bio: "Crypto trader and podcaster",
        },
        {
          fid: 20,
          username: "sassal0x",
          displayName: "Sassal",
          pfpUrl: "https://picsum.photos/200/200?random=20",
          followerCount: 35000,
          bio: "Crypto analyst",
        },
      ]

      if (launchingAccount) {
        const launchingUser = mockUsers.find((user) => user.username === launchingAccount)
        if (launchingUser && !mockUsers.some((user) => user.username === launchingAccount)) {
          mockUsers.unshift(launchingUser)
        }
      }

      return mockUsers
    }
  }, [launchingAccount])

  // Validate image URLs before using them
  const validateImageUrl = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok && Boolean(response.headers.get('content-type')?.startsWith('image/'))
    } catch {
      return false
    }
  }, [])

  // Generate quiz questions with validated images
  const generateQuizQuestions = useCallback(async (users: FarcasterUser[]): Promise<QuizQuestion[]> => {
    const questions: QuizQuestion[] = []
    const usedUsers = new Set<string>()

    const shuffledUsers = [...users].sort(() => Math.random() - 0.5)

    for (let i = 0; i < Math.min(20, shuffledUsers.length); i++) {
      const correctUser = shuffledUsers[i]
      if (usedUsers.has(correctUser.username)) continue

      // Validate the profile picture URL
      const isValidImage = await validateImageUrl(correctUser.pfpUrl)
      if (!isValidImage) {
        console.log(`[v1] Skipping user ${correctUser.username} - invalid image URL`)
        continue
      }

      usedUsers.add(correctUser.username)

      const incorrectOptions: string[] = []
      const availableUsers = users.filter(
        (u) => u.username !== correctUser.username && !incorrectOptions.includes(u.username)
      )

      while (incorrectOptions.length < 3 && availableUsers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableUsers.length)
        const randomUser = availableUsers.splice(randomIndex, 1)[0]
        incorrectOptions.push(randomUser.username)
      }

      const allOptions = [correctUser.username, ...incorrectOptions]
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)

      questions.push({
        id: i + 1,
        profilePictureUrl: correctUser.pfpUrl,
        correctAnswer: correctUser.username,
        options: shuffledOptions,
        correctUser: correctUser,
      })

      if (questions.length >= 20) break
    }

    return questions
  }, [validateImageUrl])

  // Load quiz data in background
  const loadQuizData = useCallback(async () => {
      try {
        setIsLoading(true)
        setLoadingError(null)

        console.log("[v1] Loading quiz data in background...")
        const users = await fetchFarcasterUsers()
        console.log(`[v1] Fetched ${users.length} users`)

        const questions = await generateQuizQuestions(users)
        console.log(`[v1] Generated ${questions.length} questions`)

        if (questions.length < 10) {
          throw new Error("Not enough valid questions could be generated")
        }

        setQuizData(questions)
        setIsLoading(false)
        setTimeout(() => setShowContent(true), 100)
      } catch (error) {
        console.error("[v1] Error loading quiz data:", error)
        setLoadingError(error instanceof Error ? error.message : "Failed to load quiz data")
        setIsLoading(false)
      }
    }
  , [fetchFarcasterUsers, generateQuizQuestions])

  useEffect(() => {
    loadQuizData()
  }, [loadQuizData, launchingAccount])

  // Timer logic
  useEffect(() => {
    if (timeRemaining > 0 && !showResults && !isLoading) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !showResults) {
      handleQuizComplete(true)
    }
  }, [timeRemaining, showResults, isLoading])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    const percentage = (timeRemaining / QUIZ_TIME_LIMIT) * 100
    if (percentage > 50) return "text-green-600"
    if (percentage > 25) return "text-yellow-600"
    if (percentage > 10) return "text-orange-600"
    return "text-red-600"
  }

  const getTimerBgColor = () => {
    const percentage = (timeRemaining / QUIZ_TIME_LIMIT) * 100
    if (percentage > 50) return "bg-green-50"
    if (percentage > 25) return "bg-yellow-50"
    if (percentage > 10) return "bg-orange-50"
    return "bg-red-50"
  }

  // Handle answer selection with auto-advance
  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || isTransitioning) return

    setSelectedAnswer(answer)
    const correct = answer === quizData[currentQuestion]?.correctAnswer
    
    setIsCorrect(correct)
    setFeedbackMessage(correct ? "Correct! 🎉" : `Incorrect. The answer was ${quizData[currentQuestion]?.correctAnswer}`)
    setShowFeedback(true)

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      handleNextQuestion()
    }, 1500)
  }

  const handleNextQuestion = () => {
    if (!selectedAnswer) return

    setIsTransitioning(true)
    setShowContent(false)
    setShowFeedback(false)

    setTimeout(() => {
      const newAnswers = [...answers, selectedAnswer]
      setAnswers(newAnswers)
      setSelectedAnswer(null)

      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setTimeout(() => {
          setIsTransitioning(false)
          setShowContent(true)
        }, 150)
      } else {
        handleQuizComplete(false)
      }
    }, 200)
  }

  const handleQuizComplete = useCallback(
    (autoSubmit = false) => {
      const finalAnswers = [...answers]
      if (autoSubmit && selectedAnswer) {
        finalAnswers.push(selectedAnswer)
      }
      setAnswers(finalAnswers)
      
      // Save personal best if user is authenticated
      if (user) {
        const score = finalAnswers.filter((answer, index) => 
          answer === quizData[index]?.correctAnswer
        ).length
        const timeTaken = QUIZ_TIME_LIMIT - timeRemaining
        savePersonalBest(score, quizData.length, timeTaken)
      }
      
      setShowResults(true)
    },
    [answers, selectedAnswer, user, quizData, timeRemaining, savePersonalBest],
  )

  const calculateScore = useCallback(() => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === quizData[index]?.correctAnswer) {
        correct++
      }
    })
    return correct
  }, [answers, quizData])

  // SimplySimi ranking system
  const getSimplySimiRanking = useCallback((score: number, totalQuestions: number) => {
    const percentage = Math.round((score / totalQuestions) * 100)
    
    if (percentage >= 90) {
      return {
        level: "OG",
        message: "SimplySimi says you\'re a true Farcaster OG! The community flows through your veins 🔥",
        color: "text-green-600 bg-green-50 border-green-200"
      }
    } else if (percentage >= 70) {
      return {
        level: "Expert",
        message: "SimplySimi says you\'re a Farcaster Expert! You know your way around the protocol 💜",
        color: "text-blue-600 bg-blue-50 border-blue-200"
      }
    } else if (percentage >= 50) {
      return {
        level: "Regular",
        message: "SimplySimi says you have solid Farcaster knowledge! You\'re well-connected 🎯",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200"
      }
    } else if (percentage >= 30) {
      return {
        level: "Casual",
        message: "SimplySimi says you\'re a casual Farcaster user! Time to dive deeper 📱",
        color: "text-orange-600 bg-orange-50 border-orange-200"
      }
    } else {
      return {
        level: "Newbie",
        message: "SimplySimi says I am a newbie, what about you? Welcome to Farcaster! 👋",
        color: "text-gray-600 bg-gray-50 border-gray-200"
      }
    }
  }, [])

  // Farcaster cast sharing
  const handleFarcasterShare = useCallback(() => {
    const score = calculateScore()
    const percentage = Math.round((score / answers.length) * 100)
    const ranking = getSimplySimiRanking(score, answers.length)
    
    const castText = `🧠 I scored ${score}/${answers.length} (${percentage}%) on the Brains Farcaster Profile Picture IQ Quiz!\n\n${ranking.message}\n\nTake the quiz: ${MINI_APP_FRAME_LINK}`
    
    // Try to use Farcaster SDK for casting
    if (typeof window !== 'undefined') {
      type FarcasterWindow = Window & { farcaster?: { cast: (text: string) => void } }
      const w = window as unknown as FarcasterWindow
      if (w.farcaster) {
        try {
          w.farcaster.cast(castText)
        } catch (error) {
          console.error('Farcaster cast failed:', error)
          navigator.clipboard.writeText(castText)
        }
        return
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(castText)
    }
  }, [answers, getSimplySimiRanking, calculateScore])

  // Loading state (no separate page)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md animate-in fade-in duration-500">
          <CardContent className="p-8 text-center">
            {loadingError ? (
              <>
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-destructive mb-2">Loading Error</h2>
                <p className="text-muted-foreground mb-4">{loadingError}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </>
            ) : (
              <>
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                </div>
                <h2 className="text-xl font-semibold text-primary mb-2">
                  Preparing Your Quiz
                </h2>
                <p className="text-muted-foreground">
                  Loading real Farcaster profiles...
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Quiz Data Available</h2>
            <p className="text-muted-foreground mb-4">Unable to generate quiz questions. Please try again later.</p>
            <Button onClick={onComplete}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results page
  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / answers.length) * 100)
    const ranking = getSimplySimiRanking(score, answers.length)
    // const timeTaken = QUIZ_TIME_LIMIT - timeRemaining

    return (
      <div className="min-h-screen bg-background animate-in fade-in duration-700">
        <header className="border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 animate-in slide-in-from-top duration-500">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500 delay-200">
                  <Trophy
                    className="h-8 w-8 text-primary-foreground animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-primary mb-2 animate-in slide-in-from-bottom duration-500 delay-300">
                Quiz Complete!
              </h1>
              <p className="text-lg text-muted-foreground animate-in slide-in-from-bottom duration-500 delay-400">
                Here&apos;s how you performed on the Brains IQ Quiz
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Score Display */}
            <Card className="shadow-xl border-2 animate-in zoom-in duration-700 delay-600">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-48 h-48 rounded-full border-8 border-secondary/20 flex items-center justify-center bg-gradient-to-br from-secondary/10 to-primary/10 animate-in zoom-in duration-700 delay-700">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-secondary mb-2 animate-in zoom-in duration-500 delay-1000">
                          {score}
                          <span className="text-3xl text-muted-foreground animate-in fade-in duration-500 delay-1200">
                            /{answers.length}
                          </span>
                        </div>
                        <div className="text-2xl font-semibold text-primary animate-in slide-in-from-bottom duration-500 delay-1100">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`inline-block px-6 py-3 rounded-full border-2 font-semibold text-lg ${ranking.color} animate-in slide-in-from-bottom duration-500 delay-1400`}
                  >
                    {ranking.level}
                  </div>

                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty animate-in fade-in duration-500 delay-1500">
                    {ranking.message}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SimplySimi Ranking Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 animate-in slide-in-from-bottom duration-500 delay-1600">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <h3 className="text-xl font-semibold text-purple-700">SimplySimi&apos;s Verdict</h3>
                </div>
                <p className="text-lg text-purple-800 mb-4">
                  {ranking.message}
                </p>
                <div className="text-sm text-purple-600">
                  Share your results and challenge friends to beat your score!
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-500 delay-1700">
              <Button
                size="lg"
                onClick={onComplete}
                className="flex items-center gap-2 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <RotateCcw className="h-5 w-5" />
                Take Quiz Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleFarcasterShare}
                className="flex items-center gap-2 px-8 py-4 text-lg font-semibold border-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-transparent"
              >
                <Share2 className="h-5 w-5" />
                Share Score on Farcaster
              </Button>
            </div>

            {/* Frame Link */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 animate-in slide-in-from-bottom duration-500 delay-1800">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Share this mini app with friends:
                </p>
                <p className="text-primary font-mono text-sm break-all">
                  {MINI_APP_FRAME_LINK}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Quiz question display
  const question = quizData[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.length) * 100
  const hasImageError = imageErrors.has(currentQuestion)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm animate-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onComplete}
              className="flex items-center gap-2 hover:bg-secondary/10 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>

            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">
                Question {currentQuestion + 1} of {quizData.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% Complete</div>
            </div>

            <div
              className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg border-2 transition-all duration-300 ${getTimerColor()} ${getTimerBgColor()} border-current ${
                timeRemaining <= 60 ? "animate-pulse" : ""
              }`}
            >
              <Clock className={`h-5 w-5 ${timeRemaining <= 30 ? "animate-bounce" : ""}`} />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={progress} className="h-3 bg-muted transition-all duration-500 ease-out" />
            </div>
            <div className="text-xs font-medium text-muted-foreground min-w-fit">
              {currentQuestion + 1}/{quizData.length}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div
            className={`transition-all duration-300 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          >
            <Card
              className={`shadow-lg border-2 border-border transition-all duration-500 ${showContent ? "animate-in slide-in-from-bottom" : ""}`}
            >
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-8 border-b border-border">
                  <div className="text-center">
                    <div className="mb-6 relative">
                      {hasImageError ? (
                        <div className="w-40 h-40 rounded-full mx-auto border-4 border-destructive/20 shadow-xl bg-muted flex items-center justify-center animate-in zoom-in duration-500">
                          <AlertCircle className="h-12 w-12 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          <Image
                            src={question?.profilePictureUrl || "/placeholder.svg"}
                            alt="Profile picture to identify"
                            width={160}
                            height={160}
                            className={`w-40 h-40 rounded-full mx-auto border-4 border-primary/20 shadow-xl object-cover ring-4 ring-primary/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                              showContent ? "animate-in zoom-in" : ""
                            }`}
                            onError={() => setImageErrors((prev) => new Set(prev).add(currentQuestion))}
                            unoptimized
                          />
                          <div
                            className={`absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                              showContent ? "animate-in zoom-in delay-200" : ""
                            }`}
                          >
                            <span className="text-primary-foreground font-bold text-sm">?</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h2
                        className={`text-3xl font-bold text-primary text-balance leading-tight transition-all duration-500 ${
                          showContent ? "animate-in slide-in-from-bottom delay-300" : ""
                        }`}
                      >
                        Who is the owner of this profile picture?
                      </h2>
                      <h2
                        className={`text-muted-foreground text-lg transition-all duration-500 ${
                          showContent ? "animate-in slide-in-from-bottom delay-400" : ""
                        }`}
                      >
                        Select the correct Farcaster username from the options below
                      </h2>
                    </div>
                  </div>
                </div>

                {/* 2x2 Grid Layout for Quiz Options */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {question?.options.map((option, index) => {
                      const isSelected = selectedAnswer === option
                      const optionLetter = String.fromCharCode(65 + index)
                      const isCorrect = option === question.correctAnswer
                      const showCorrectAnswer = selectedAnswer && showFeedback

                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={selectedAnswer !== null || isTransitioning}
                          className={`group w-full p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md ${
                            isSelected
                              ? isCorrect
                                ? "border-green-500 bg-green-50 shadow-lg scale-[1.02]"
                                : "border-red-500 bg-red-50 shadow-lg scale-[1.02]"
                              : showCorrectAnswer && isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-border hover:border-secondary/50 hover:bg-secondary/5 hover:shadow-sm"
                          } ${showContent ? "animate-in slide-in-from-left" : ""}`}
                          style={{ animationDelay: `${500 + index * 100}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                                isSelected
                                  ? isCorrect
                                    ? "bg-green-500 text-white shadow-md scale-110"
                                    : "bg-red-500 text-white shadow-md scale-110"
                                  : showCorrectAnswer && isCorrect
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground group-hover:bg-secondary/20 group-hover:text-secondary group-hover:scale-105"
                              }`}
                            >
                              {isSelected ? (
                                isCorrect ? (
                                  <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-200" />
                                ) : (
                                  <XCircle className="h-6 w-6 animate-in zoom-in duration-200" />
                                )
                              ) : showCorrectAnswer && isCorrect ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                optionLetter
                              )}
                            </div>

                            <div className="flex-1">
                              <span
                                className={`text-lg font-medium transition-colors duration-200 ${
                                  isSelected
                                    ? isCorrect
                                      ? "text-green-700 font-semibold"
                                      : "text-red-700 font-semibold"
                                    : showCorrectAnswer && isCorrect
                                    ? "text-green-700 font-semibold"
                                    : "text-foreground group-hover:text-secondary"
                                }`}
                              >
                                {option}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="flex-shrink-0 animate-in zoom-in duration-200">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${
                                  isCorrect ? "bg-green-500" : "bg-red-500"
                                }`}></div>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Feedback Message */}
                  {showFeedback && (
                    <div className={`text-center p-4 rounded-lg mb-6 animate-in fade-in duration-300 ${
                      isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}>
                      <p className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                        {feedbackMessage}
                      </p>
                    </div>
                  )}

                  {/* Auto-advance indicator */}
                  {selectedAnswer && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Auto-advancing to next question...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className={`mt-6 text-center transition-all duration-500 ${
              showContent ? "animate-in fade-in delay-1000" : ""
            }`}
          >
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Tip:</span> Trust your first instinct - you can&apos;t go back to previous questions
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
