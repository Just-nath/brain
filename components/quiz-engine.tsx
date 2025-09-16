import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { generateQuizDataAsync, QuizQuestion } from "@/src/utils/farcaster"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface QuizProps {
  onComplete: () => void
  launchingAccount?: string
}

const MINI_APP_FRAME_LINK = "https://brains.vercel.app"

export default function Quiz({ onComplete }: QuizProps) {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true)
      try {
        const data = await generateQuizDataAsync(10)
        setQuizData(data)
      } catch (error) {
        console.error("Failed to load quiz data:", error)
        // Fallback to empty data
        setQuizData([])
      }
      setLoading(false)
    }

    loadQuiz()
  }, [])

  const [answers, setAnswers] = useState<{ [key: number]: string }>({})

  const calculateScore = useCallback(() => {
    return Object.entries(answers).reduce((score, [questionIndex, answer]) => {
      const question = quizData[parseInt(questionIndex)]
      return score + (answer === question?.correctAnswer ? 1 : 0)
    }, 0)
  }, [answers, quizData])

  const getSimplySimiRanking = useCallback((score: number, totalQuestions: number) => {
    const percentage = Math.round((score / totalQuestions) * 100)

    if (percentage >= 90) return { level: "OG", message: "SimplySimi says you're a true Farcaster OG! 🔥", color: "text-green-600 bg-green-50 border-green-200" }
    if (percentage >= 70) return { level: "Expert", message: "SimplySimi says you're a Farcaster Expert! 💜", color: "text-blue-600 bg-blue-50 border-blue-200" }
    if (percentage >= 50) return { level: "Regular", message: "SimplySimi says you have solid Farcaster knowledge! 🎯", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
    if (percentage >= 30) return { level: "Casual", message: "SimplySimi says you're a casual Farcaster user! 📱", color: "text-orange-600 bg-orange-50 border-orange-200" }
    return { level: "Newbie", message: "SimplySimi says you're new! Welcome to Farcaster! 👋", color: "text-gray-600 bg-gray-50 border-gray-200" }
  }, [])

  const handleAnswerSelect = (option: string) => {
    setSelectedAnswer(option)
    setAnswers(prev => ({ ...prev, [currentQuestion]: option }))
    const question = quizData[currentQuestion]
    setFeedbackMessage(option === question.correctAnswer ? "Correct!" : `Oops! Correct answer is ${question.correctAnswer}`)
    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      if (currentQuestion + 1 < quizData.length) {
        setCurrentQuestion(prev => prev + 1)
      } else {
        setShowResults(true)
      }
    }, 1500)
  }

  const handleFarcasterShare = useCallback(() => {
    const score = calculateScore()
    const percentage = Math.round((score / quizData.length) * 100)
    const ranking = getSimplySimiRanking(score, quizData.length)
    
    // Create frame URL for sharing
    const frameUrl = `${MINI_APP_FRAME_LINK}/frame?score=${score}&total=${quizData.length}&percentage=${percentage}&category=${encodeURIComponent(ranking.level)}`
    const castText = `🧠 I scored ${score}/${quizData.length} (${percentage}%) on the Brains Farcaster Quiz!\n\n${ranking.message}\n\nTake the quiz: ${frameUrl}`

    type FarcasterWindow = Window & { farcaster?: { cast: (text: string) => void } }
    const w = window as unknown as FarcasterWindow
    if (w.farcaster) {
      try {
        w.farcaster.cast(castText)
      } catch {
        navigator.clipboard.writeText(castText)
      }
      return
    }
    navigator.clipboard.writeText(castText)
  }, [quizData, getSimplySimiRanking, calculateScore])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="animate-pulse">Loading quiz...</p></div>

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / quizData.length) * 100)
    const ranking = getSimplySimiRanking(score, quizData.length)

    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-4xl font-bold text-center mb-4">Quiz Complete!</h1>
        <p className="text-center mb-6">You scored {score}/{quizData.length} ({percentage}%)</p>

        <Card className={`max-w-md mx-auto mb-6 ${ranking.color}`}>
          <CardContent>
            <p className="text-center text-lg font-semibold">{ranking.level}</p>
            <p className="text-center mt-2">{ranking.message}</p>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={() => { 
            setCurrentQuestion(0); 
            setShowResults(false); 
            setAnswers({});
            setSelectedAnswer(null);
          }}>Take Quiz Again</Button>
          <Button variant="outline" onClick={handleFarcasterShare}>Share on Farcaster</Button>
          <Button variant="ghost" onClick={onComplete}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const question = quizData[currentQuestion]
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="text-center mb-6">
        <p>Question {currentQuestion + 1}/{quizData.length}</p>
      </div>

      <div className="flex justify-center mb-6">
        {imageErrors.has(currentQuestion) ? (
          <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-gray-500" />
          </div>
        ) : (
          <Image
            src={question.user.pfpUrl || "/icon.png"}
            alt="Profile"
            width={160}
            height={160}
            className="rounded-full border-4 border-primary/20"
            onError={() => setImageErrors(prev => new Set(prev).add(currentQuestion))}
            unoptimized
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {question.options.map(option => (
          <button
            key={option}
            onClick={() => handleAnswerSelect(option)}
            className={`p-4 border rounded hover:bg-secondary/10 transition ${
              selectedAnswer === option ? 'bg-primary/10 border-primary' : ''
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showFeedback && <p className="text-center mt-4 font-semibold">{feedbackMessage}</p>}
    </div>
  )
}
