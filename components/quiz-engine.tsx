import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { generateQuizDataAsync, QuizQuestion } from "@/src/utils/farcaster"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Clock, Trophy, Share2, AlertTriangle } from "lucide-react"
import { useFarcaster } from "@/src/hooks/useFarcaster"
import Loading from "@/components/loading"
import ErrorBoundary from "@/components/error-boundary"
import { preloadQuizImages } from "@/lib/image-preloader"

interface QuizProps {
  onComplete: () => void
  launchingAccount?: string
}

const MINI_APP_FRAME_LINK = "https://farcaster.xyz/miniapps/w9n2GeLADNIy/brains---farcaster-pfp-quiz"
const QUIZ_DURATION = 420 // 7 minutes in seconds
const TOTAL_QUESTIONS = 20

export default function Quiz({ onComplete }: QuizProps) {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_DURATION)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { isInMiniApp, markReady, updatePersonalBest, personalBest, user, isAuthenticated } = useFarcaster()

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await generateQuizDataAsync(TOTAL_QUESTIONS)
        if (data.length === 0) {
          throw new Error("No quiz questions could be generated")
        }
        setQuizData(data)
        setRetryCount(0)
        
        // Preload images for better performance
        preloadQuizImages(data).catch(err => {
          console.warn('Failed to preload some images:', err)
        })
      } catch (error) {
        console.error("Failed to load quiz data:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to load quiz data"
        setError(errorMessage)
        
        // Retry up to 3 times
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            loadQuiz()
          }, 2000 * (retryCount + 1)) // Exponential backoff
        }
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [retryCount])

  // Mark quiz as ready when loaded in miniapp context
  useEffect(() => {
    if (!loading && quizData.length > 0 && isInMiniApp) {
      markReady({
        disableNativeGestures: false // Allow native gestures for quiz interaction
      })
    }
  }, [loading, quizData.length, isInMiniApp, markReady])

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setQuizCompleted(true)
            setShowResults(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [quizStarted, quizCompleted, timeRemaining])

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (quizCompleted && !showResults) {
      setShowResults(true)
    }
  }, [quizCompleted, showResults])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const calculateScore = useCallback(() => {
    return Object.entries(answers).reduce((score, [questionIndex, answer]) => {
      const question = quizData[parseInt(questionIndex)]
      return score + (answer === question?.correctAnswer ? 1 : 0)
    }, 0)
  }, [answers, quizData])

  const getSimplySimiRanking = useCallback((score: number, totalQuestions: number) => {
    const percentage = Math.round((score / totalQuestions) * 100)

    if (percentage >= 90) return { 
      level: "OG", 
      message: "@simplysimi says I am a Farcaster OG! The community flows through my veins 🔥", 
      color: "text-green-600 bg-green-50 border-green-200" 
    }
    if (percentage >= 70) return { 
      level: "Expert", 
      message: "@simplysimi says I am a Farcaster Expert! I know my way around the protocol 💜", 
      color: "text-blue-600 bg-blue-50 border-blue-200" 
    }
    if (percentage >= 50) return { 
      level: "Regular", 
      message: "@simplysimi says I have solid Farcaster knowledge! I'm well-connected 🎯", 
      color: "text-yellow-600 bg-yellow-50 border-yellow-200" 
    }
    if (percentage >= 30) return { 
      level: "Casual", 
      message: "@simplysimi says I am a casual Farcaster user! Time to dive deeper 📱", 
      color: "text-orange-600 bg-orange-50 border-orange-200" 
    }
    return { 
      level: "Newbie", 
      message: "@simplysimi says I am a newbie, what about you? Welcome to Farcaster! 👋", 
      color: "text-gray-600 bg-gray-50 border-gray-200" 
    }
  }, [])

  const startQuiz = () => {
    setQuizStarted(true)
    setQuizStartTime(Date.now())
  }

  const saveScore = async (score: number, percentage: number, timeTaken: number) => {
    if (!user || !isAuthenticated) return

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userFid: user.fid,
          username: user.username,
          displayName: user.displayName,
          pfpUrl: user.pfpUrl,
          score,
          totalQuestions: quizData.length,
          timeTaken,
          quizData: quizData.map((q, index) => ({
            question: index + 1,
            correctAnswer: q.correctAnswer,
            userAnswer: answers[index] || null
          }))
        })
      })
    } catch (error) {
      console.error('Failed to save score:', error)
    }
  }

  const handleAnswerSelect = (option: string) => {
    if (quizCompleted) return
    
    setSelectedAnswer(option)
    setAnswers(prev => ({ ...prev, [currentQuestion]: option }))
    const question = quizData[currentQuestion]
    setFeedbackMessage(option === question.correctAnswer ? "Correct!" : `Oops! Correct answer is ${question.correctAnswer}`)
    setShowFeedback(true)
    
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      if (currentQuestion + 1 < quizData.length && !quizCompleted) {
        setCurrentQuestion(prev => prev + 1)
      } else {
        // Quiz completed - either all questions answered or timer expired
        setQuizCompleted(true)
        setShowResults(true)
      }
    }, 1500)
  }

  const handleFarcasterShare = useCallback(() => {
    const score = calculateScore()
    const percentage = Math.round((score / quizData.length) * 100)
    const ranking = getSimplySimiRanking(score, quizData.length)
    
    const castText = `${ranking.message} ${MINI_APP_FRAME_LINK}`

    // Try to use Farcaster SDK if available
    if (isInMiniApp) {
      try {
        const { sdk } = require('@farcaster/miniapp-sdk')
        sdk.actions.cast(castText)
        return
      } catch (error) {
        console.error('Failed to cast via SDK:', error)
      }
    }

    // Fallback to clipboard
    navigator.clipboard.writeText(castText).then(() => {
      alert('Cast text copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy cast text')
    })
  }, [quizData, getSimplySimiRanking, calculateScore, isInMiniApp])

  if (loading) {
    return (
      <Loading 
        message="Loading quiz questions..."
        subMessage={retryCount > 0 ? `Retry attempt ${retryCount}/3` : "Fetching Farcaster profiles"}
        showBrain={true}
      />
    )
  }

  if (error && quizData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Quiz</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              
              {retryCount < 3 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Retrying automatically...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setRetryCount(0)
                      setError(null)
                      // Trigger reload by updating retryCount
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onComplete}
                    className="ml-4"
                  >
                    Back to Home
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz start screen
  if (!quizStarted && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">🧠 Brains Quiz</h1>
            <p className="text-xl text-gray-600 mb-2">Test your Farcaster knowledge!</p>
            <p className="text-lg text-gray-500">Identify 20 Farcaster users from their profile pictures</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">7 Minutes</h3>
                    <p className="text-sm text-gray-600">Total time limit</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">20 Questions</h3>
                    <p className="text-sm text-gray-600">Multiple choice format</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={startQuiz}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Quiz
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Timer starts when you begin the first question
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / quizData.length) * 100)
    const ranking = getSimplySimiRanking(score, quizData.length)
    const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0
    
    // Update personal best if this score is better
    const isNewPersonalBest = personalBest === null || score > personalBest
    if (isNewPersonalBest) {
      updatePersonalBest(score)
    }

    // Save score to database
    if (isAuthenticated && user) {
      saveScore(score, percentage, timeTaken)
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <p className="text-3xl font-bold text-purple-600 mb-2">{score}/{quizData.length}</p>
              <p className="text-xl text-gray-600 mb-4">{percentage}% Correct</p>
              <p className="text-sm text-gray-500">Time taken: {formatTime(timeTaken)}</p>
            </div>
          </div>
          
          {personalBest !== null && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Personal Best: {personalBest}/{quizData.length}
              </p>
            </div>
          )}
          
          {isNewPersonalBest && (
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-green-600 bg-green-100 px-4 py-2 rounded-full inline-block">
                🎉 New Personal Best! 🎉
              </p>
            </div>
          )}

          <Card className={`mb-8 ${ranking.color}`}>
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">{ranking.level}</h3>
              <p className="text-lg">{ranking.message}</p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => { 
                setCurrentQuestion(0); 
                setShowResults(false); 
                setQuizStarted(false);
                setQuizCompleted(false);
                setAnswers({});
                setSelectedAnswer(null);
                setTimeRemaining(QUIZ_DURATION);
                setQuizStartTime(null);
              }}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Take Quiz Again
            </Button>
            <Button 
              variant="outline" 
              onClick={handleFarcasterShare}
              size="lg"
              className="border-purple-200 hover:bg-purple-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share on Farcaster
            </Button>
            <Button 
              variant="ghost" 
              onClick={onComplete}
              size="lg"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const question = quizData[currentQuestion]
  const progressPercentage = ((currentQuestion + 1) / quizData.length) * 100
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with timer and progress */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className={`text-2xl font-bold ${timeRemaining <= 60 ? 'text-red-600' : 'text-purple-600'}`}>
              {formatTime(timeRemaining)}
            </span>
            {timeRemaining <= 60 && (
              <span className="text-red-600 text-sm font-medium">⚠️ Less than 1 minute!</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-800">
              {currentQuestion + 1}/{quizData.length}
            </p>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Who is this Farcaster user?
              </h2>
              <p className="text-gray-600">Question {currentQuestion + 1} of {quizData.length}</p>
            </div>

            {/* Profile Picture */}
            <div className="flex justify-center mb-8">
              {imageErrors.has(currentQuestion) ? (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-300">
                  <AlertCircle className="h-12 w-12 text-gray-500" />
                </div>
              ) : (
                <Image
                  src={question.user.pfpUrl || "/icon.png"}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-purple-200 shadow-lg"
                  onError={() => setImageErrors(prev => new Set(prev).add(currentQuestion))}
                  unoptimized
                />
              )}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, index) => {
                const optionLabels = ['A', 'B', 'C', 'D']
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={quizCompleted}
                    className={`p-6 border-2 rounded-xl hover:bg-purple-50 transition-all duration-200 text-left group ${
                      selectedAnswer === option 
                        ? 'bg-purple-100 border-purple-400 shadow-md' 
                        : 'border-gray-200 hover:border-purple-300'
                    } ${quizCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedAnswer === option 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}>
                        {optionLabels[index]}
                      </div>
                      <span className="font-medium text-gray-800">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className="mt-6 p-4 rounded-lg text-center">
                <p className={`font-semibold ${
                  feedbackMessage.includes('Correct') 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-red-600 bg-red-50'
                }`}>
                  {feedbackMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom info */}
        <div className="text-center text-sm text-gray-500">
          <p>Click an option to select your answer</p>
        </div>
      </div>
    </div>
  )
}
