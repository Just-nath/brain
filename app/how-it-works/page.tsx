"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Clock, Users, Trophy, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
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
        <div className="mx-auto max-w-4xl">
          {/* Page Title */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
              How It Works
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about the Farcaster Profile IQ Quiz
            </p>
          </div>

          {/* Quiz Format Details */}
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiz Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sm md:text-base">Question Structure</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>20 multiple choice questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>4 options per question</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Real Farcaster profile pictures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>No going back to previous questions</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm md:text-base">Time & Rules</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>10 minute time limit total</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>30 seconds per question average</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Timer shown during quiz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Auto-submit when time runs out</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring System */}
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Scoring & Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Your score is based on the number of correct answers out of 20 questions. Each correct answer adds to your Farcaster IQ score.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { score: "18-20", category: "Farcaster Expert", description: "You know the community inside and out!", color: "bg-green-100 text-green-800 border-green-200" },
                    { score: "15-17", category: "Active Member", description: "You're well-connected in the ecosystem", color: "bg-blue-100 text-blue-800 border-blue-200" },
                    { score: "12-14", category: "Casual Observer", description: "You follow the community regularly", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                    { score: "8-11", category: "Getting Started", description: "You're learning the ropes", color: "bg-orange-100 text-orange-800 border-orange-200" },
                    { score: "0-7", category: "New to Farcaster", description: "Welcome to the community!", color: "bg-gray-100 text-gray-800 border-gray-200" },
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${item.color}`}>
                      <div className="font-semibold text-sm">{item.score}</div>
                      <div className="font-bold text-base mb-1">{item.category}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips & Strategy */}
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sm md:text-base">Before You Start</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Make sure you&apos;re connected to Farcaster</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Find a quiet place to focus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Have a stable internet connection</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm md:text-base">During the Quiz</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Look for distinctive features in profiles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Don&apos;t spend too long on one question</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Trust your first instinct</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Quiz CTA */}
          <div className="text-center">
            <Link href="/">
              <Button
                size="lg"
                className="px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Your Quiz Now
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Ready to test your Farcaster knowledge?
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}


