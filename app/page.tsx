"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Clock, Users, Trophy, HelpCircle } from "lucide-react"
import QuizEngine from "@/components/quiz-engine"
import FarcasterAuth from "@/components/farcaster-auth"
import { useFarcaster } from "@/src/hooks/useFarcaster"
import Link from "next/link"

export default function HomePage() {
  const [quizStarted, setQuizStarted] = useState(false)
  const [launchingAccount, setLaunchingAccount] = useState<string | undefined>(undefined)
  const { isAuthenticated } = useFarcaster()

  useEffect(() => {
    // Check URL parameters for launching account
    const urlParams = new URLSearchParams(window.location.search)
    const accountParam = urlParams.get("account") || urlParams.get("username")

    if (accountParam) {
      setLaunchingAccount(accountParam)
      console.log("[v0] Detected launching account from URL:", accountParam)
    }

    // In a real implementation, you might also check:
    // - Farcaster Frame context
    // - Wallet connection
    // - Session storage
    // - Other authentication methods
  }, [])

  if (quizStarted) {
    return (
      <FarcasterAuth onComplete={() => setQuizStarted(false)}>
        <QuizEngine onComplete={() => setQuizStarted(false)} launchingAccount={launchingAccount} />
      </FarcasterAuth>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card animate-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary animate-in zoom-in duration-500 hover:scale-110 transition-transform">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary animate-in slide-in-from-left duration-500 delay-200">
                  Brains
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground animate-in slide-in-from-left duration-500 delay-300">
                  Farcaster Profile IQ Quiz
                </p>
              </div>
            </div>
            
            {/* Help Icon */}
            <Link href="/how-it-works">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full hover:bg-primary/10 transition-colors animate-in zoom-in duration-500 delay-400"
                title="How it works"
              >
                <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section with Brain Image */}
          <div className="text-center mb-8 md:mb-12">
            <div className="mb-6 animate-in zoom-in duration-700 delay-200">
              <img
                src="/icon.png"
                alt="Brains - Farcaster PFP Quiz icon representing intelligence and knowledge"
                className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-primary mb-3 md:mb-4 text-balance animate-in slide-in-from-bottom duration-700 delay-400">
              Test Your Farcaster Knowledge
            </h2>
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 text-pretty max-w-2xl mx-auto animate-in slide-in-from-bottom duration-700 delay-500">
              Identify Farcaster community members from their profile pictures. How well do you know the faces?
            </p>
            {launchingAccount && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-sm text-secondary font-medium animate-in fade-in duration-500 delay-600">
                <Users className="h-4 w-4" />
                Quiz launched by @{launchingAccount}
              </div>
            )}
          </div>

          {/* Quiz Info Cards - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            {[
              {
                icon: Clock,
                title: "10 Min Challenge",
                description: "20 questions in 10 minutes",
                delay: "delay-600",
              },
              {
                icon: Trophy,
                title: "Score & Share",
                description: "Get your IQ category",
                delay: "delay-700",
              },
            ].map((card, index) => (
              <Card
                key={index}
                className={`text-center animate-in slide-in-from-bottom duration-500 ${card.delay} hover:shadow-lg hover:scale-105 transition-all duration-200`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-center mb-2">
                    <card.icon
                      className="h-6 w-6 md:h-8 md:w-8 text-secondary animate-in zoom-in duration-300"
                      style={{ animationDelay: `${600 + index * 100 + 200}ms` }}
                    />
                  </div>
                  <CardTitle className="text-base md:text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{card.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>



          {/* Start Button - Mobile Optimized */}
          <div className="text-center animate-in slide-in-from-bottom duration-500 delay-800">
            <div className="space-y-4">
              {isAuthenticated ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
                  <Users className="h-4 w-4" />
                  Connected to Farcaster
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-sm text-secondary font-medium">
                  <Users className="h-4 w-4 animate-spin" />
                  Connecting to Farcaster...
                </div>
              )}
              
              <Button
                size="lg"
                className="w-full md:w-auto px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => setQuizStarted(true)}
              >
                Start Quiz
              </Button>
              
              {!isAuthenticated && (
                <p className="text-xs md:text-sm text-muted-foreground">
                  Auto-connecting to your Farcaster account
                </p>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-3 md:mt-4 animate-in fade-in duration-500 delay-900">
              Ready to test your knowledge?
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
