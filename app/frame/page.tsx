import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Trophy, Users } from "lucide-react"

interface FramePageProps {
  searchParams: Promise<{
    score?: string
    total?: string
    percentage?: string
    category?: string
  }>
}

export default async function FramePage({ searchParams }: FramePageProps) {
  const params = await searchParams
  const score = parseInt(params.score || "0")
  const total = parseInt(params.total || "20")
  const percentage = parseInt(params.percentage || "0")
  const category = decodeURIComponent(params.category || "Quiz Taker")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-primary">Brains Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="space-y-2">
            <div className="text-4xl font-bold text-secondary">
              {score}/{total}
            </div>
            <div className="text-xl text-primary">{percentage}%</div>
            <div className="inline-block px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-sm text-secondary font-medium">
              {category}
            </div>
          </div>

          {/* Quiz Info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Test your knowledge of the Farcaster community</p>
            <p>20 questions • 10 minutes • Multiple choice</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full py-3 text-lg font-semibold"
              onClick={() => window.location.href = '/'}
            >
              <Trophy className="h-5 w-5 mr-2" />
              Take the Quiz
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full py-3"
              onClick={() => window.location.href = '/?frame=1'}
            >
              <Users className="h-5 w-5 mr-2" />
              View in Farcaster
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Powered by the Farcaster community
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
