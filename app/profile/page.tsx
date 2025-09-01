"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Trophy, Target, TrendingUp, ArrowLeft, Calendar, Award, Users } from "lucide-react"
import Link from "next/link"
import { useFarcaster } from "@/src/hooks/useFarcaster"

interface ScoreEntry {
  score: number
  totalQuestions: number
  percentage: number
  date: string
  timeTaken: number
}

interface LeaderboardEntry {
  username: string
  displayName: string
  pfpUrl: string
  aggregateScore: number
  totalGames: number
  averageScore: number
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useFarcaster()
  const [dailyScore, setDailyScore] = useState<ScoreEntry | null>(null)
  const [allTimeBest, setAllTimeBest] = useState<ScoreEntry | null>(null)
  const [recentScores, setRecentScores] = useState<ScoreEntry[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserData()
      loadLeaderboard()
    }
  }, [user])

  const loadUserData = () => {
    if (!user) return

    // Load personal best
    const personalBestKey = `personal_best_${user.fid}`
    const personalBest = localStorage.getItem(personalBestKey)
    if (personalBest) {
      setAllTimeBest(JSON.parse(personalBest))
    }

    // Load daily score (today's best)
    const today = new Date().toDateString()
    const dailyKey = `daily_score_${user.fid}_${today}`
    const dailyScore = localStorage.getItem(dailyKey)
    if (dailyScore) {
      setDailyScore(JSON.parse(dailyScore))
    }

    // Load recent scores (last 10 games)
    const recentScoresKey = `recent_scores_${user.fid}`
    const recentScores = localStorage.getItem(recentScoresKey)
    if (recentScores) {
      setRecentScores(JSON.parse(recentScores).slice(0, 10))
    }
  }

  const loadLeaderboard = () => {
    // Simulate leaderboard data - in a real app, this would come from a backend
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        username: "vitalik.eth",
        displayName: "Vitalik Buterin",
        pfpUrl: "https://picsum.photos/200/200?random=2",
        aggregateScore: 277, // 15 games * 18.5 average
        totalGames: 15,
        averageScore: 18.5
      },
      {
        username: "dwr.eth",
        displayName: "Dan Romero",
        pfpUrl: "https://picsum.photos/200/200?random=1",
        aggregateScore: 206, // 12 games * 17.2 average
        totalGames: 12,
        averageScore: 17.2
      },
      {
        username: "jessepollak",
        displayName: "Jesse Pollak",
        pfpUrl: "https://picsum.photos/200/200?random=3",
        aggregateScore: 134, // 8 games * 16.8 average
        totalGames: 8,
        averageScore: 16.8
      },
      {
        username: "balajis.eth",
        displayName: "Balaji Srinivasan",
        pfpUrl: "https://picsum.photos/200/200?random=4",
        aggregateScore: 161, // 10 games * 16.1 average
        totalGames: 10,
        averageScore: 16.1
      },
      {
        username: "patrickalphac",
        displayName: "Patrick Collins",
        pfpUrl: "https://picsum.photos/200/200?random=5",
        aggregateScore: 93, // 6 games * 15.5 average
        totalGames: 6,
        averageScore: 15.5
      },
      {
        username: "naval",
        displayName: "Naval Ravikant",
        pfpUrl: "https://picsum.photos/200/200?random=6",
        aggregateScore: 137, // 9 games * 15.2 average
        totalGames: 9,
        averageScore: 15.2
      },
      {
        username: "hayden.eth",
        displayName: "Hayden Adams",
        pfpUrl: "https://picsum.photos/200/200?random=7",
        aggregateScore: 104, // 7 games * 14.8 average
        totalGames: 7,
        averageScore: 14.8
      },
      {
        username: "linda.eth",
        displayName: "Linda Xie",
        pfpUrl: "https://picsum.photos/200/200?random=8",
        aggregateScore: 73, // 5 games * 14.5 average
        totalGames: 5,
        averageScore: 14.5
      },
      {
        username: "coopahtroopa.eth",
        displayName: "Cooper Turley",
        pfpUrl: "https://picsum.photos/200/200?random=9",
        aggregateScore: 57, // 4 games * 14.2 average
        totalGames: 4,
        averageScore: 14.2
      },
      {
        username: "stani.eth",
        displayName: "Stani Kulechov",
        pfpUrl: "https://picsum.photos/200/200?random=10",
        aggregateScore: 83, // 6 games * 13.8 average
        totalGames: 6,
        averageScore: 13.8
      }
    ]

    // Add current user to leaderboard if they have scores
    if (recentScores.length > 0 && user) {
      const userAggregateScore = recentScores.reduce((sum, score) => sum + score.score, 0)
      const userEntry: LeaderboardEntry = {
        username: user.username,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
        aggregateScore: userAggregateScore,
        totalGames: recentScores.length,
        averageScore: userAggregateScore / recentScores.length
      }
      
      // Insert user into correct position
      const updatedLeaderboard = [...mockLeaderboard, userEntry]
        .sort((a, b) => b.aggregateScore - a.aggregateScore || b.averageScore - a.averageScore)
        .slice(0, 10)
      
      setLeaderboard(updatedLeaderboard)
    } else {
      setLeaderboard(mockLeaderboard)
    }
    
    setIsLoading(false)
  }

  const getScoreCategory = (score: number) => {
    if (score >= 18) return { name: "Farcaster Expert", color: "text-green-600", bg: "bg-green-100" }
    if (score >= 15) return { name: "Active Member", color: "text-blue-600", bg: "bg-blue-100" }
    if (score >= 12) return { name: "Casual Observer", color: "text-yellow-600", bg: "bg-yellow-100" }
    if (score >= 8) return { name: "Getting Started", color: "text-orange-600", bg: "bg-orange-100" }
    return { name: "New to Farcaster", color: "text-gray-600", bg: "bg-gray-100" }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Please Connect to Farcaster</CardTitle>
            <CardDescription>You need to be connected to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary">
                  Brains
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Farcaster Profile IQ Quiz
                </p>
              </div>
            </Link>
            
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Profile Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="mb-6">
              <img
                src={user.pfpUrl}
                alt={`${user.displayName}'s profile picture`}
                className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full shadow-lg border-4 border-primary/20"
              />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-primary mb-2">
              {user.displayName}
            </h2>
            <p className="text-base md:text-xl text-muted-foreground mb-4">
              @{user.username}
            </p>
            {allTimeBest && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getScoreCategory(allTimeBest.score).bg} ${getScoreCategory(allTimeBest.score).color}`}>
                <Trophy className="h-4 w-4" />
                {getScoreCategory(allTimeBest.score).name}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Daily Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Today&apos;s Best
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyScore ? (
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      {dailyScore.score}/{dailyScore.totalQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dailyScore.percentage}% • {Math.floor(dailyScore.timeTaken / 60)}m {dailyScore.timeTaken % 60}s
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No quiz taken today
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Time Best */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  All Time Best
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allTimeBest ? (
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      {allTimeBest.score}/{allTimeBest.totalQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {allTimeBest.percentage}% • {new Date(allTimeBest.date).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No quiz completed yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total Games */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Total Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">
                  {recentScores.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {recentScores.length > 0 ? 
                    `Avg: ${(recentScores.reduce((sum, score) => sum + score.score, 0) / recentScores.length).toFixed(1)}` : 
                    'Start playing!'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Scores and Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentScores.length > 0 ? (
                  <div className="space-y-3">
                    {recentScores.slice(0, 5).map((score, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-semibold">{score.score}/{score.totalQuestions}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(score.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">{score.percentage}%</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.floor(score.timeTaken / 60)}m {score.timeTaken % 60}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No recent scores. Take your first quiz!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top 10 Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading leaderboard...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${entry.username === user.username ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-lg font-bold text-muted-foreground w-6">
                            {index + 1}
                          </div>
                          <img
                            src={entry.pfpUrl}
                            alt={`${entry.displayName}'s profile`}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{entry.displayName}</div>
                            <div className="text-xs text-muted-foreground">@{entry.username}</div>
                          </div>
                        </div>
                                                 <div className="text-right">
                           <div className="font-semibold text-primary">{entry.aggregateScore} pts</div>
                           <div className="text-xs text-muted-foreground">{entry.totalGames} games</div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button
                size="lg"
                className="px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Take Another Quiz
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
