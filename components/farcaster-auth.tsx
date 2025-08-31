"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Users, Trophy, AlertCircle } from "lucide-react"
import { useFarcaster } from "@/src/hooks/useFarcaster"

interface FarcasterAuthProps {
  children: React.ReactNode
  onComplete: () => void
}

export default function FarcasterAuth({ children, onComplete }: FarcasterAuthProps) {
  const { isAuthenticated, isLoading, error, signIn, isInFrame } = useFarcaster()
  const [showAuth, setShowAuth] = useState(true)

  // Auto-sign in when component mounts
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Try to auto-sign in
      signIn()
    }
  }, [isAuthenticated, isLoading, signIn])

  // If user is authenticated, show the quiz
  if (isAuthenticated && !showAuth) {
    return <>{children}</>
  }

  // If we're in a Farcaster Frame and user is authenticated, show quiz directly
  if (isInFrame && isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card animate-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-center">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="animate-in slide-in-from-bottom duration-500 delay-200">
            <CardHeader className="text-center">
              <div className="mb-4">
                <Brain className="h-16 w-16 text-primary mx-auto animate-bounce" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-primary">
                Welcome to Brains
              </CardTitle>
              <CardDescription className="text-lg">
                Test your knowledge of the Farcaster community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {isInFrame ? (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                    <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-secondary font-medium">
                      You&apos;re viewing this in Farcaster
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sign in to your Farcaster account to take the quiz
                    </p>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={() => setShowAuth(false)}
                    className="w-full px-8 py-4 text-lg font-semibold"
                  >
                    Continue to Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        icon: Brain,
                        title: "20 Questions",
                        description: "Test your Farcaster knowledge"
                      },
                      {
                        icon: Trophy,
                        title: "Score & Share",
                        description: "Get your IQ category"
                      },
                      {
                        icon: Users,
                        title: "Community",
                        description: "Challenge your friends"
                      }
                    ].map((feature, index) => (
                      <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                        <feature.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="text-center space-y-4">
                    <Button
                      size="lg"
                      onClick={signIn}
                      disabled={isLoading}
                      className="w-full px-8 py-4 text-lg font-semibold"
                    >
                      {isLoading ? "Signing In..." : "Sign In with Farcaster"}
                    </Button>
                    
                    <p className="text-sm text-muted-foreground">
                      Connect your Farcaster account to start the quiz
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={onComplete}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
