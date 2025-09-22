"use client"

import { Brain, Clock } from "lucide-react"

interface LoadingProps {
  message?: string
  subMessage?: string
  showBrain?: boolean
  showClock?: boolean
}

export default function Loading({ 
  message = "Loading...", 
  subMessage,
  showBrain = true,
  showClock = false 
}: LoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="mb-6">
          {showBrain && (
            <div className="relative">
              <Brain className="h-16 w-16 text-purple-600 mx-auto animate-pulse" />
              <div className="absolute inset-0 animate-spin">
                <Brain className="h-16 w-16 text-purple-200" />
              </div>
            </div>
          )}
          
          {showClock && (
            <div className="relative">
              <Clock className="h-16 w-16 text-purple-600 mx-auto animate-pulse" />
              <div className="absolute inset-0 animate-spin">
                <Clock className="h-16 w-16 text-purple-200" />
              </div>
            </div>
          )}
          
          {!showBrain && !showClock && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
        {subMessage && (
          <p className="text-gray-600">{subMessage}</p>
        )}
        
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}


