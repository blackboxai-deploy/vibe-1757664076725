'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { playSound } from '@/lib/voiceSynthesis'

interface GameProps {
  onGameComplete: (score: number, details: any) => void
  onBackToMenu: () => void
}

interface NumberQuest {
  question: string
  correctAnswer: number
  options: number[]
  icon: string
  story: string
}

const numberQuests: NumberQuest[] = [
  {
    question: "How many apples do you see?",
    correctAnswer: 3,
    options: [2, 3, 4, 5],
    icon: "🍎🍎🍎",
    story: "You found a magical apple tree!"
  },
  {
    question: "Count the stars in the sky!",
    correctAnswer: 5,
    options: [4, 5, 6, 7],
    icon: "⭐⭐⭐⭐⭐",
    story: "The night sky is full of bright stars!"
  },
  {
    question: "How many cars are in the parking lot?",
    correctAnswer: 2,
    options: [1, 2, 3, 4],
    icon: "🚗🚗",
    story: "You arrived at a busy parking lot!"
  },
  {
    question: "Count the flowers in the garden!",
    correctAnswer: 4,
    options: [3, 4, 5, 6],
    icon: "🌸🌸🌸🌸",
    story: "Beautiful flowers bloom in the garden!"
  },
  {
    question: "How many balloons are floating?",
    correctAnswer: 6,
    options: [5, 6, 7, 8],
    icon: "🎈🎈🎈🎈🎈🎈",
    story: "Colorful balloons dance in the wind!"
  },
  {
    question: "Count the fish swimming!",
    correctAnswer: 7,
    options: [6, 7, 8, 9],
    icon: "🐟🐟🐟🐟🐟🐟🐟",
    story: "Fish swim happily in the clear water!"
  },
  {
    question: "How many books are on the shelf?",
    correctAnswer: 8,
    options: [7, 8, 9, 10],
    icon: "📚📚📚📚📚📚📚📚",
    story: "The library has many interesting books!"
  },
  {
    question: "Count the butterflies!",
    correctAnswer: 9,
    options: [8, 9, 10, 11],
    icon: "🦋🦋🦋🦋🦋🦋🦋🦋🦋",
    story: "Beautiful butterflies flutter around!"
  },
  {
    question: "How many cookies are in the jar?",
    correctAnswer: 10,
    options: [9, 10, 11, 12],
    icon: "🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪",
    story: "Grandma baked delicious cookies!"
  }
]

export default function NumberAdventureGame({ onGameComplete, onBackToMenu }: GameProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing')
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [completedQuests, setCompletedQuests] = useState(0)
  const [timeLeft, setTimeLeft] = useState(240) // 4 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  
  const { selectedChild, updateChildProgress } = useAuth()
  const currentQuest = numberQuests[currentQuestIndex]

  // Timer
  useEffect(() => {
    if (!gameStarted || gameState === 'completed' || timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameState, timeLeft])

   // Clear feedback after showing
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(null)
        if (showFeedback === 'correct') {
          nextQuest()
        }
        setSelectedAnswer(null)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
    return undefined
  }, [showFeedback])

  const startGame = async () => {
    setGameStarted(true)
    await playSound.speak("Welcome to the Number Adventure! Count the objects and choose the correct number. Let's begin your quest!", { rate: 0.8 })
  }

  const selectAnswer = async (answer: number) => {
    if (showFeedback || selectedAnswer !== null) return
    
    setSelectedAnswer(answer)
    setAttempts(prev => prev + 1)
    
    await playSound.number(answer.toString())
    
    setTimeout(() => checkAnswer(answer), 1000)
  }

  const checkAnswer = async (answer: number) => {
    if (answer === currentQuest.correctAnswer) {
      setScore(prev => prev + 15)
      setCompletedQuests(prev => prev + 1)
      setShowFeedback('correct')
      
      await playSound.encouragement()
      await playSound.speak(`Correct! The answer is ${currentQuest.correctAnswer}!`, { rate: 0.8 })
    } else {
      setShowFeedback('incorrect')
      await playSound.support()
      await playSound.speak(`Try again! Count carefully. The correct answer is ${currentQuest.correctAnswer}.`, { rate: 0.8 })
    }
  }

  const nextQuest = () => {
    if (currentQuestIndex < numberQuests.length - 1) {
      setCurrentQuestIndex(prev => prev + 1)
    } else {
      setTimeout(() => endGame(), 1000)
    }
  }

  const skipQuest = () => {
    if (currentQuestIndex < numberQuests.length - 1) {
      setCurrentQuestIndex(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      endGame()
    }
  }

  const endGame = async () => {
    setGameState('completed')
    
    const finalScore = Math.round((completedQuests / numberQuests.length) * 100)
    const timeBonus = Math.round(timeLeft / 4)
    const accuracyBonus = attempts > 0 ? Math.round((completedQuests / attempts) * 25) : 0
    const totalScore = Math.min(100, finalScore + timeBonus + accuracyBonus)
    
    // Update child progress
    if (selectedChild) {
      const newNumbersCompleted = Math.min(10, selectedChild.progress.numbersCompleted + Math.floor(completedQuests / 2))
      await updateChildProgress(selectedChild.id, {
        gamesPlayed: selectedChild.progress.gamesPlayed + 1,
        numbersCompleted: newNumbersCompleted,
        overallProgress: Math.max(selectedChild.progress.overallProgress, 
          Math.round((selectedChild.progress.overallProgress + totalScore) / 2))
      })
    }
    
    const gameDetails = {
      questsCompleted: completedQuests,
      totalQuests: numberQuests.length,
      attempts,
      timeUsed: 240 - timeLeft,
      accuracy: attempts > 0 ? Math.round((completedQuests / attempts) * 100) : 0
    }
    
    onGameComplete(totalScore, gameDetails)
    
    if (totalScore >= 90) {
      await playSound.speak("Amazing adventure! You're a number counting champion!", { rate: 0.8, pitch: 1.2 })
    } else if (totalScore >= 70) {
      await playSound.speak("Great adventure! You're getting really good with numbers!", { rate: 0.8, pitch: 1.1 })
    } else {
      await playSound.speak("Good adventure! Keep practicing counting to become even better!", { rate: 0.8 })
    }
  }

  const restartGame = () => {
    setGameState('playing')
    setCurrentQuestIndex(0)
    setScore(0)
    setAttempts(0)
    setCompletedQuests(0)
    setGameStarted(false)
    setTimeLeft(240)
    setShowFeedback(null)
    setSelectedAnswer(null)
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-orange-600 mb-4">
            🔢 Number Adventure Game
          </CardTitle>
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Go on an exciting counting adventure! Count objects and choose the correct number.
            </p>
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">How to Play:</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>• Read the story and count the objects</li>
                <li>• Click on the correct number</li>
                <li>• Complete as many quests as possible</li>
                <li>• Listen to the sounds and feedback</li>
                <li>• Have fun counting!</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={startGame}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-8 py-4"
          >
            🎮 Start Adventure
          </Button>
          <Button
            onClick={onBackToMenu}
            variant="outline"
            size="lg"
          >
            ← Back to Games
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (gameState === 'completed') {
    const finalScore = Math.round((completedQuests / numberQuests.length) * 100)
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-600 mb-4">
            🎉 Adventure Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-orange-600">{finalScore}%</div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{completedQuests}</div>
              <div className="text-sm text-gray-600">Quests Completed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{attempts}</div>
              <div className="text-sm text-gray-600">Attempts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {attempts > 0 ? Math.round((completedQuests / attempts) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={restartGame}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              🔄 New Adventure
            </Button>
            <Button
              onClick={onBackToMenu}
              variant="outline"
            >
              🏠 Back to Games
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-orange-600">
              Quest {currentQuestIndex + 1} of {numberQuests.length}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-green-600 font-semibold">
                Score: {score}
              </div>
              <div className="text-blue-600 font-semibold">
                Completed: {completedQuests}
              </div>
              <div className="text-red-600 font-semibold">
                Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          <Progress value={(completedQuests / numberQuests.length) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Story Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="text-lg font-medium text-gray-800 mb-2">
            {currentQuest.story}
          </div>
        </CardContent>
      </Card>

      {/* Quest Display */}
      <Card>
        <CardHeader className="text-center">
          <div className="text-6xl mb-4 p-4 bg-yellow-50 rounded-lg inline-block">
            {currentQuest.icon}
          </div>
          <CardTitle className="text-2xl text-gray-800">
            {currentQuest.question}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Answer Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-gray-800">Choose Your Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentQuest.options.map((option) => (
              <button
                key={option}
                onClick={() => selectAnswer(option)}
                disabled={showFeedback !== null}
                className={`h-20 text-3xl font-bold rounded-xl border-3 transition-all transform hover:scale-105 ${
                  selectedAnswer === option
                    ? showFeedback === 'correct'
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : showFeedback === 'incorrect'
                        ? 'bg-red-100 border-red-400 text-red-700'
                        : 'bg-blue-100 border-blue-400 text-blue-700'
                    : option === currentQuest.correctAnswer && showFeedback === 'incorrect'
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          {/* Feedback Display */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg text-center font-semibold ${
              showFeedback === 'correct' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {showFeedback === 'correct' 
                ? `🎉 Excellent! The answer is ${currentQuest.correctAnswer}!` 
                : `💪 Keep trying! The correct answer is ${currentQuest.correctAnswer}.`
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={onBackToMenu}
          variant="outline"
        >
          ← Back to Games
        </Button>
        <Button
          onClick={skipQuest}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          ⏭️ Skip Quest
        </Button>
        <Button
          onClick={restartGame}
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          🔄 Restart Adventure
        </Button>
      </div>
    </div>
  )
}