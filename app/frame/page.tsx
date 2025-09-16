"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Share2, RotateCcw } from "lucide-react"
import Link from "next/link"

function FrameContent() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const score = parseInt(searchParams?.get('score') || '0')
  const total = parseInt(searchParams?.get('total') || '20')
  const percentage = parseInt(searchParams?.get('percentage') || '0')
  const category = searchParams?.get('category') || 'Quiz Taker'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      'Farcaster Expert': '🏆',
      'Active Member': '⭐',
      'Casual Observer': '👀',
      'Getting Started': '🌱',
      'New to Farcaster': '🆕',
      'OG': '🔥',
      'Expert': '💜',
      'Regular': '🎯',
      'Casual': '📱',
      'Newbie': '👋'
    }
    return emojiMap[category] || '🧠'
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Farcaster Expert': 'text-green-600 bg-green-50 border-green-200',
      'Active Member': 'text-blue-600 bg-blue-50 border-blue-200',
      'Casual Observer': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Getting Started': 'text-orange-600 bg-orange-50 border-orange-200',
      'New to Farcaster': 'text-gray-600 bg-gray-50 border-gray-200',
      'OG': 'text-green-600 bg-green-50 border-green-200',
      'Expert': 'text-blue-600 bg-blue-50 border-blue-200',
      'Regular': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Casual': 'text-orange-600 bg-orange-50 border-orange-200',
      'Newbie': 'text-gray-600 bg-gray-50 border-gray-200'
    }
    return colorMap[category] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Brains</h1>
                <p className="text-xs text-muted-foreground">Farcaster Profile IQ Quiz</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="animate-in slide-in-from-bottom duration-500">
            <CardHeader className="text-center">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl text-primary">Quiz Results</CardTitle>
              <CardDescription className="text-lg">
                Your Farcaster knowledge score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">
                  {score}/{total}
                </div>
                <div className="text-3xl font-semibold text-secondary">
                  {percentage}%
                </div>
              </div>

              {/* Category Badge */}
              <div className={`text-center p-4 rounded-lg border ${getCategoryColor(category)}`}>
                <div className="text-2xl mb-2">{getCategoryEmoji(category)}</div>
                <div className="text-lg font-semibold">{category}</div>
                <div className="text-sm opacity-75">
                  {category === 'OG' && "SimplySimi says you're a true Farcaster OG! 🔥"}
                  {category === 'Expert' && "SimplySimi says you're a Farcaster Expert! 💜"}
                  {category === 'Regular' && "SimplySimi says you have solid Farcaster knowledge! 🎯"}
                  {category === 'Casual' && "SimplySimi says you're a casual Farcaster user! 📱"}
                  {category === 'Newbie' && "SimplySimi says you're new! Welcome to Farcaster! 👋"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/">
                  <Button size="lg" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Take Quiz Again
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const shareText = `🧠 I scored ${score}/${total} (${percentage}%) on the Brains Farcaster Quiz!\n\n${getCategoryEmoji(category)} I'm a "${category}" - how well do you know the Farcaster community?\n\nTake the quiz: https://brains.vercel.app`
                    navigator.clipboard.writeText(shareText)
                    alert('Share text copied to clipboard!')
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </Button>
              </div>

              {/* Frame Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>This frame was generated by the Brains Quiz Mini App</p>
                <p>Challenge your friends to beat your score!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function FramePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <FrameContent />
    </Suspense>
  )
}