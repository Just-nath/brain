"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Target,
  Zap,
  Share2,
  RotateCcw,
  TrendingUp,
  Users,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useFarcaster } from "../src/hooks/useFarcaster"
import { generateShareText, generateChallengeText } from "../src/utils/frames"

const QUIZ_TIME_LIMIT = 10 * 60 // 10 minutes in seconds

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
  launchingAccount?: string // The account that launched the quiz
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
  const { user, savePersonalBest, getPersonalBest, sdk } = useFarcaster()

  const fetchFarcasterUsers = async (): Promise<FarcasterUser[]> => {
    try {
      // Use Farcaster SDK if available, otherwise fall back to API
      if (sdk) {
        try {
          // Get real-time user data from Farcaster
          const response = await sdk.quickAuth.fetch('/me')
          
          if (response.ok) {
            // For now, we'll use the API fallback since the SDK doesn't provide user network data
            // In a real implementation, you would use the SDK to fetch user's network
            console.log('Farcaster SDK connected, using API fallback for user data')
          }
        } catch (sdkError) {
          console.log('SDK fetch failed, falling back to API:', sdkError)
        }
      }

      // Fallback to API if SDK is not available or fails
      const apiKey = "3367EB2F-69DE-4AF5-9057-68162A77AED3"

      const response = await fetch(`https://api.neynar.com/v2/farcaster/user/search?q=&limit=100`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()

      const users: FarcasterUser[] =
        data.result?.users?.map((user: { fid: number; username: string; display_name?: string; pfp_url?: string; follower_count?: number; profile?: { bio?: { text?: string } } }) => ({
          fid: user.fid,
          username: user.username,
          displayName: user.display_name || user.username,
          pfpUrl: user.pfp_url || "/abstract-profile.png",
          followerCount: user.follower_count || 0,
          bio: user.profile?.bio?.text || "",
        })) || []

      const filteredUsers = users

      if (launchingAccount) {
        try {
          const launchingUserResponse = await fetch(
            `https://api.neynar.com/v2/farcaster/user/by_username?username=${launchingAccount}`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            },
          )

          if (launchingUserResponse.ok) {
            const launchingUserData = await launchingUserResponse.json()
            const launchingUser = launchingUserData.result?.user

            if (launchingUser && !filteredUsers.some((user) => user.username === launchingAccount)) {
              const formattedLaunchingUser: FarcasterUser = {
                fid: launchingUser.fid,
                username: launchingUser.username,
                displayName: launchingUser.display_name || launchingUser.username,
                pfpUrl: launchingUser.pfp_url || "/abstract-profile.png",
                followerCount: launchingUser.follower_count || 0,
                bio: launchingUser.profile?.bio?.text || "",
              }
              filteredUsers.unshift(formattedLaunchingUser)
            }
          }
        } catch (launchingUserError) {
          console.error("[v0] Error fetching launching user:", launchingUserError)
        }
      }

      if (filteredUsers.length < 20) {
        throw new Error("Not enough users found")
      }

      return filteredUsers.slice(0, 50)
    } catch (error) {
      console.error("[v0] Error fetching Farcaster users:", error)

      const mockUsers: FarcasterUser[] = [
        {
          fid: 3,
          username: "dwr.eth",
          displayName: "Dan Romero",
          pfpUrl: "/tech-founder-headshot.png",
          followerCount: 45000,
          bio: "Co-founder of Farcaster",
        },
        {
          fid: 1,
          username: "vitalik.eth",
          displayName: "Vitalik Buterin",
          pfpUrl: "/professional-tech-executive-headshot.png",
          followerCount: 120000,
          bio: "Ethereum founder",
        },
        {
          fid: 2,
          username: "jessepollak",
          displayName: "Jesse Pollak",
          pfpUrl: "/smiling-person-with-glasses-tech-profile.png",
          followerCount: 35000,
          bio: "Base Protocol Lead at Coinbase",
        },
        {
          fid: 4,
          username: "balajis.eth",
          displayName: "Balaji Srinivasan",
          pfpUrl: "/young-entrepreneur-profile-picture.png",
          followerCount: 85000,
          bio: "Former CTO of Coinbase",
        },
        {
          fid: 5,
          username: "patrickalphac",
          displayName: "Patrick Collins",
          pfpUrl: "/crypto-developer-avatar.png",
          followerCount: 25000,
          bio: "Smart contract developer",
        },
        {
          fid: 6,
          username: "naval",
          displayName: "Naval Ravikant",
          pfpUrl: "/tech-industry-leader-headshot.png",
          followerCount: 95000,
          bio: "AngelList founder",
        },
        {
          fid: 7,
          username: "hayden.eth",
          displayName: "Hayden Adams",
          pfpUrl: "/blockchain-developer-profile.png",
          followerCount: 40000,
          bio: "Uniswap founder",
        },
        {
          fid: 8,
          username: "linda.eth",
          displayName: "Linda Xie",
          pfpUrl: "/web3-builder-avatar.png",
          followerCount: 30000,
          bio: "Scalar Capital co-founder",
        },
        {
          fid: 9,
          username: "coopahtroopa.eth",
          displayName: "Cooper Turley",
          pfpUrl: "/crypto-community-leader.png",
          followerCount: 28000,
          bio: "Music NFT advocate",
        },
        {
          fid: 10,
          username: "stani.eth",
          displayName: "Stani Kulechov",
          pfpUrl: "/defi-protocol-founder.png",
          followerCount: 32000,
          bio: "Aave founder",
        },
        {
          fid: 11,
          username: "punk6529",
          displayName: "6529",
          pfpUrl: "/nft-artist-profile-picture.png",
          followerCount: 55000,
          bio: "NFT collector and advocate",
        },
        {
          fid: 12,
          username: "cdixon.eth",
          displayName: "Chris Dixon",
          pfpUrl: "/crypto-investor-headshot.png",
          followerCount: 75000,
          bio: "a16z crypto partner",
        },
        {
          fid: 13,
          username: "danfinlay",
          displayName: "Dan Finlay",
          pfpUrl: "/ethereum-core-developer.png",
          followerCount: 22000,
          bio: "MetaMask co-founder",
        },
        {
          fid: 14,
          username: "bankless",
          displayName: "Bankless",
          pfpUrl: "/web3-content-creator.png",
          followerCount: 65000,
          bio: "DeFi media brand",
        },
        {
          fid: 15,
          username: "kempsterrrr.eth",
          displayName: "Kempster",
          pfpUrl: "/dao-governance-expert.png",
          followerCount: 18000,
          bio: "DAO governance expert",
        },
        {
          fid: 16,
          username: "hasu",
          displayName: "Hasu",
          pfpUrl: "/crypto-researcher-profile.png",
          followerCount: 42000,
          bio: "Crypto researcher",
        },
        {
          fid: 17,
          username: "gakonst",
          displayName: "Georgios Konstantopoulos",
          pfpUrl: "/blockchain-infrastructure-builder.png",
          followerCount: 38000,
          bio: "Paradigm research partner",
        },
        {
          fid: 18,
          username: "samczsun",
          displayName: "samczsun",
          pfpUrl: "/crypto-security-expert.png",
          followerCount: 48000,
          bio: "Security researcher",
        },
        {
          fid: 19,
          username: "cobie",
          displayName: "Cobie",
          pfpUrl: "/defi-yield-farmer-avatar.png",
          followerCount: 52000,
          bio: "Crypto trader and podcaster",
        },
        {
          fid: 20,
          username: "sassal0x",
          displayName: "Sassal",
          pfpUrl: "/crypto-twitter-influencer.png",
          followerCount: 35000,
          bio: "Crypto analyst",
        },
      ]

      const filteredUsers = mockUsers

      if (launchingAccount) {
        const launchingUser = mockUsers.find((user) => user.username === launchingAccount)
        if (launchingUser && !filteredUsers.some((user) => user.username === launchingAccount)) {
          filteredUsers.unshift(launchingUser)
        }
      }

      return filteredUsers
    }
  }

  const generateQuizQuestions = (users: FarcasterUser[]): QuizQuestion[] => {
    const questions: QuizQuestion[] = []
    const usedUsers = new Set<string>()

    const shuffledUsers = [...users].sort(() => Math.random() - 0.5)

    for (let i = 0; i < Math.min(20, shuffledUsers.length); i++) {
      const correctUser = shuffledUsers[i]
      if (usedUsers.has(correctUser.username)) continue

      usedUsers.add(correctUser.username)

      const incorrectOptions: string[] = []
      const availableUsers = users.filter(
        (u) => u.username !== correctUser.username && !incorrectOptions.includes(u.username),
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
    }

    return questions
  }

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true)
        setLoadingError(null)

        console.log("[v0] Fetching Farcaster users...")
        const users = await fetchFarcasterUsers()
        console.log("[v0] Fetched users:", users.length)

        console.log("[v0] Generating quiz questions...")
        const questions = generateQuizQuestions(users)
        console.log("[v0] Generated questions:", questions.length)

        setQuizData(questions)

        const imagePromises = questions.map((question, index) => {
          return new Promise<void>((resolve) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => resolve()
            img.onerror = () => {
              console.log("[v0] Image load error for question:", index)
              setImageErrors((prev) => new Set(prev).add(index))
              resolve()
            }
            img.src = question.profilePictureUrl
          })
        })

        await Promise.all(imagePromises)
        console.log("[v0] All images preloaded")

        setIsLoading(false)
        setTimeout(() => setShowContent(true), 100)
      } catch (error) {
        console.error("[v0] Error loading quiz data:", error)
        setLoadingError(error instanceof Error ? error.message : "Failed to load quiz data")
        setIsLoading(false)
      }
    }

    loadQuizData()
  }, [launchingAccount])

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

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    if (!selectedAnswer) return

    setIsTransitioning(true)
    setShowContent(false)

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

  const calculateScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === quizData[index]?.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const getScoreCategory = (score: number) => {
    if (score >= 18) return "Farcaster Expert"
    if (score >= 15) return "Active Community Member"
    if (score >= 12) return "Casual Observer"
    if (score >= 8) return "Getting Started"
    return "New to Farcaster"
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "Farcaster Expert":
        return "Outstanding! You have deep knowledge of the Farcaster community and its key figures."
      case "Active Community Member":
        return "Excellent work! You're clearly engaged with the Farcaster ecosystem."
      case "Casual Observer":
        return "Good job! You have solid awareness of prominent community members."
      case "Getting Started":
        return "Nice effort! You&apos;re building familiarity with the Farcaster community."
      default:
        return "Welcome to Farcaster! There&apos;s a vibrant community waiting to be discovered."
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Farcaster Expert":
        return "text-green-600 bg-green-50 border-green-200"
      case "Active Community Member":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "Casual Observer":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "Getting Started":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getPerformanceInsights = () => {
    const insights = []
    const score = calculateScore()
    const percentage = Math.round((score / answers.length) * 100)
    const timeTaken = QUIZ_TIME_LIMIT - timeRemaining
    const wasAutoSubmitted = timeRemaining === 0
    const questionsPerMinute = Math.round((answers.length / (timeTaken / 60)) * 10) / 10

    if (percentage >= 90) {
      insights.push("🎯 Perfect accuracy - you know your Farcaster community!")
    } else if (percentage >= 75) {
      insights.push("🔥 Strong performance - you're well-connected to the ecosystem")
    } else if (percentage >= 50) {
      insights.push("📈 Solid foundation - keep engaging with the community")
    } else {
      insights.push("🌱 Room to grow - explore more Farcaster profiles")
    }

    if (questionsPerMinute > 1.5) {
      insights.push("⚡ Lightning fast - you made quick, confident decisions")
    } else if (questionsPerMinute < 0.8) {
      insights.push("🤔 Thoughtful approach - you took time to consider each answer")
    }

    if (wasAutoSubmitted) {
      insights.push("⏰ Time management challenge - try to pace yourself next time")
    }

    return insights
  }

  const handleShare = () => {
    const score = calculateScore()
    const percentage = Math.round((score / answers.length) * 100)
    const category = getScoreCategory(score)
    const shareText = `I just scored ${score}/${answers.length} (${percentage}%) on the Brains Farcaster Profile Picture IQ Quiz! I'm a ${category}. Can you beat my score?`

    if (navigator.share) {
      navigator.share({
        title: "Brains - Farcaster IQ Quiz Results",
        text: shareText,
        url: window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`)
    }
  }

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
                  <div
                    className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-secondary/50 animate-spin mx-auto"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                  ></div>
                </div>
                <h2 className="text-xl font-semibold text-primary mb-2 animate-in slide-in-from-bottom-2 duration-700 delay-200">
                  Loading Real-Time Farcaster Data
                </h2>
                <p className="text-muted-foreground animate-in slide-in-from-bottom-2 duration-700 delay-300">
                  Fetching live profiles from your network...
                </p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
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

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / answers.length) * 100)
    const category = getScoreCategory(score)
    const timeTaken = QUIZ_TIME_LIMIT - timeRemaining
    const wasAutoSubmitted = timeRemaining === 0
    const questionsPerMinute = Math.round((answers.length / (timeTaken / 60)) * 10) / 10
    const averageTimePerQuestion = Math.round(timeTaken / answers.length)

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
            {wasAutoSubmitted && (
              <Alert className="border-orange-200 bg-orange-50 animate-in slide-in-from-top duration-500 delay-500">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Quiz auto-submitted due to time limit. You answered {answers.length} out of {quizData.length}{" "}
                  questions.
                </AlertDescription>
              </Alert>
            )}

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
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500 delay-1300">
                      <CheckCircle2 className="h-6 w-6 text-secondary-foreground" />
                    </div>
                  </div>

                  <div
                    className={`inline-block px-6 py-3 rounded-full border-2 font-semibold text-lg ${getCategoryColor(category)} animate-in slide-in-from-bottom duration-500 delay-1400`}
                  >
                    {category}
                  </div>

                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty animate-in fade-in duration-500 delay-1500">
                    {getCategoryDescription(category)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Time Analysis",
                  content: [
                    { label: "Total Time:", value: formatTime(timeTaken), color: "" },
                    { label: "Avg per Question:", value: `${averageTimePerQuestion}s`, color: "" },
                    { label: "Questions/Min:", value: questionsPerMinute, color: "" },
                  ],
                  delay: "delay-1600",
                },
                {
                  icon: Target,
                  title: "Accuracy Stats",
                  content: [
                    { label: "Correct:", value: score, color: "text-green-600" },
                    { label: "Incorrect:", value: answers.length - score, color: "text-red-600" },
                    { label: "Completion:", value: `${Math.round((answers.length / quizData.length) * 100)}%`, color: "" },
                  ],
                  delay: "delay-1700",
                },
                {
                  icon: TrendingUp,
                  title: "Performance",
                  content: null,
                  delay: "delay-1800",
                },
              ].map((card, index) => (
                <Card
                  key={index}
                  className={`animate-in slide-in-from-bottom duration-500 ${card.delay} hover:shadow-lg transition-shadow`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <card.icon className="h-5 w-5 text-secondary" />
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {card.content ? (
                      card.content.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className={`font-semibold ${item.color || ""}`}>{item.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Accuracy</span>
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Speed</span>
                            <span className="text-sm font-medium">
                              {Math.min(100, Math.round((questionsPerMinute / 2) * 100))}%
                            </span>
                          </div>
                          <Progress value={Math.min(100, Math.round((questionsPerMinute / 2) * 100))} className="h-2" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="animate-in slide-in-from-bottom duration-500 delay-1900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-secondary" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {getPerformanceInsights().map((insight, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 bg-muted/50 rounded-lg animate-in slide-in-from-left duration-500`}
                      style={{ animationDelay: `${2000 + index * 100}ms` }}
                    >
                      <div className="text-lg">{insight.split(" ")[0]}</div>
                      <p className="text-sm text-muted-foreground flex-1">{insight.split(" ").slice(1).join(" ")}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Best Display */}
            {user && (
              <Card className="bg-gradient-to-r from-secondary/5 to-primary/5 border-secondary/20 animate-in slide-in-from-bottom duration-500 delay-2200">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-6 w-6 text-secondary" />
                      <h3 className="text-lg font-semibold text-secondary">Personal Best</h3>
                    </div>
                    {(() => {
                      const personalBest = getPersonalBest()
                      if (personalBest) {
                        return (
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">
                              {personalBest.score}/{personalBest.totalQuestions} ({personalBest.percentage}%)
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Best time: {Math.floor(personalBest.timeTaken / 60)}:{(personalBest.timeTaken % 60).toString().padStart(2, '0')}
                            </div>
                            {score > personalBest.score || (score === personalBest.score && (QUIZ_TIME_LIMIT - timeRemaining) < personalBest.timeTaken) ? (
                              <div className="text-green-600 font-medium animate-pulse">
                                🎉 New Personal Best!
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                Previous best: {new Date(personalBest.date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )
                      }
                      return (
                        <div className="text-muted-foreground">
                          This is your first quiz attempt!
                        </div>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom duration-500 delay-2300">
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
                onClick={handleShare}
                className="flex items-center gap-2 px-8 py-4 text-lg font-semibold border-2 hover:bg-secondary/10 hover:border-secondary transition-all duration-200 bg-transparent"
              >
                <Share2 className="h-5 w-5" />
                Share Your Score
              </Button>
            </div>

            {/* Farcaster Sharing Options */}
            {user && (
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 animate-in slide-in-from-bottom duration-500 delay-2400">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold text-primary">Share on Farcaster</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const shareText = generateShareText(score, answers.length, percentage, category)
                          if (navigator.share) {
                            navigator.share({
                              title: "Brains Quiz Results",
                              text: shareText,
                              url: window.location.origin
                            })
                          } else {
                            navigator.clipboard.writeText(shareText)
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Score
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const challengeText = generateChallengeText(user?.username || 'user')
                          if (navigator.share) {
                            navigator.share({
                              title: "Challenge Friends",
                              text: challengeText,
                              url: window.location.origin
                            })
                          } else {
                            navigator.clipboard.writeText(challengeText)
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Challenge Friends
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 animate-in fade-in duration-500 delay-2400">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-medium text-primary mb-2">
                  {percentage >= 80 ? "Exceptional work!" : percentage >= 60 ? "Great effort!" : "Keep exploring!"}
                </p>
                <p className="text-muted-foreground text-pretty">
                  {percentage >= 80
                    ? "You&apos;re clearly a dedicated member of the Farcaster community. Share your expertise!"
                    : percentage >= 60
                      ? "You have solid knowledge of the community. Keep engaging to learn even more!"
                      : "The Farcaster community is full of interesting people to discover. Keep exploring!"}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

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
              {user && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <img
                    src={user.pfpUrl || '/default-pfp.png'}
                    alt="Profile"
                    className="w-6 h-6 rounded-full border border-primary/20"
                  />
                  <span className="text-xs text-primary font-medium">@{user.username}</span>
                </div>
              )}
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
        <div className="mx-auto max-w-3xl">
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
                          <img
                            src={question?.profilePictureUrl || "/placeholder.svg"}
                            alt="Profile picture to identify"
                            className={`w-40 h-40 rounded-full mx-auto border-4 border-primary/20 shadow-xl object-cover ring-4 ring-primary/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                              showContent ? "animate-in zoom-in" : ""
                            }`}
                            onError={() => setImageErrors((prev) => new Set(prev).add(currentQuestion))}
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
                      <p
                        className={`text-muted-foreground text-lg transition-all duration-500 ${
                          showContent ? "animate-in slide-in-from-bottom delay-400" : ""
                        }`}
                      >
                        Select the correct Farcaster username from the options below
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="space-y-4 mb-8">
                    {question?.options.map((option, index) => {
                      const isSelected = selectedAnswer === option
                      const optionLetter = String.fromCharCode(65 + index)

                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          className={`group w-full p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md ${
                            isSelected
                              ? "border-secondary bg-secondary/10 shadow-lg scale-[1.02]"
                              : "border-border hover:border-secondary/50 hover:bg-secondary/5 hover:shadow-sm"
                          } ${showContent ? "animate-in slide-in-from-left" : ""}`}
                          style={{ animationDelay: `${500 + index * 100}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                                isSelected
                                  ? "bg-secondary text-secondary-foreground shadow-md scale-110"
                                  : "bg-muted text-muted-foreground group-hover:bg-secondary/20 group-hover:text-secondary group-hover:scale-105"
                              }`}
                            >
                              {isSelected ? (
                                <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-200" />
                              ) : (
                                optionLetter
                              )}
                            </div>

                            <div className="flex-1">
                              <span
                                className={`text-lg font-medium transition-colors duration-200 ${
                                  isSelected
                                    ? "text-secondary font-semibold"
                                    : "text-foreground group-hover:text-secondary"
                                }`}
                              >
                                {option}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="flex-shrink-0 animate-in zoom-in duration-200">
                                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div
                    className={`text-center space-y-4 transition-all duration-500 ${
                      showContent ? "animate-in slide-in-from-bottom delay-900" : ""
                    }`}
                  >
                    <Button
                      size="lg"
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswer || isTransitioning}
                      className={`px-16 py-4 text-lg font-semibold transition-all duration-200 ${
                        selectedAnswer && !isTransitioning
                          ? "shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Quiz"}
                    </Button>

                    {!selectedAnswer && !isTransitioning && (
                      <p className="text-sm text-muted-foreground animate-pulse">Please select an answer to continue</p>
                    )}

                    {selectedAnswer && !isTransitioning && (
                      <p className="text-sm text-secondary font-medium animate-in fade-in duration-300">
                        Answer selected: {selectedAnswer}
                      </p>
                    )}

                    {isTransitioning && (
                      <p className="text-sm text-muted-foreground animate-pulse">Loading next question...</p>
                    )}
                  </div>
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
              <span className="font-medium">Tip:</span> Trust your first instinct - you can&apos;t go back to previous
              questions
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
