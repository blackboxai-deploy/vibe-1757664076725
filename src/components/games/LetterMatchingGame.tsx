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

interface MatchPair {
  letter: string
  word: string
  icon: string
  matched: boolean
}

const letterData = {
  'A': { icon: '🍎', word: 'Apple' },
  'B': { icon: '📚', word: 'Book' },
  'C': { icon: '🐱', word: 'Cat' },
  'D': { icon: '🐕', word: 'Dog' },
  'E': { icon: '🥚', word: 'Egg' },
  'F': { icon: '🐟', word: 'Fish' },
  'G': { icon: '🍇', word: 'Grape' },
  'H': { icon: '🏠', word: 'House' }
}

export default function LetterMatchingGame({ onGameComplete, onBackToMenu }: GameProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing')
  const [pairs, setPairs] = useState<MatchPair[]>([])
  const [selectedItems, setSelectedItems] = useState<{type: 'letter' | 'word', value: string}[]>([])
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [gameStarted, setGameStarted] = useState(false)
  
  const { selectedChild, updateChildProgress } = useAuth()

  // Initialize game
  useEffect(() => {
    if (!gameStarted) return
    
    const selectedLetters = Object.keys(letterData).slice(0, 6) // Use 6 letters for easier gameplay
    const gamePairs: MatchPair[] = selectedLetters.map(letter => ({
      letter,
      word: letterData[letter as keyof typeof letterData].word,
      icon: letterData[letter as keyof typeof letterData].icon,
      matched: false
    }))
    
    setPairs(gamePairs)
    setTimeLeft(120)
  }, [gameStarted])

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

  // Check for game completion
  useEffect(() => {
    if (pairs.length > 0 && pairs.every(pair => pair.matched)) {
      endGame()
    }
  }, [pairs])

  const startGame = async () => {
    setGameStarted(true)
    await playSound.speak("Let's match letters with their words! Click on a letter and then click on its matching word.", { rate: 0.8 })
  }

  const handleItemClick = async (type: 'letter' | 'word', value: string) => {
    if (selectedItems.length >= 2) return
    
    const newSelection = { type, value }
    const newSelectedItems = [...selectedItems, newSelection]
    setSelectedItems(newSelectedItems)
    
    // Play sound for the clicked item
    if (type === 'letter') {
      await playSound.letter(value)
    } else {
      await playSound.word(value)
    }
    
    // Check for match when 2 items are selected
    if (newSelectedItems.length === 2) {
      setTimeout(() => checkMatch(newSelectedItems), 500)
    }
  }

  const checkMatch = async (selection: {type: 'letter' | 'word', value: string}[]) => {
    setAttempts(prev => prev + 1)
    
    const [first, second] = selection
    let isMatch = false
    
    // Check if we have a letter-word pair
    if (first.type !== second.type) {
      const letter = first.type === 'letter' ? first.value : second.value
      const word = first.type === 'word' ? first.value : second.value
      
      const pair = pairs.find(p => p.letter === letter)
      if (pair && pair.word === word) {
        isMatch = true
        
        // Mark as matched
        setPairs(prev => prev.map(p => 
          p.letter === letter ? { ...p, matched: true } : p
        ))
        
        setScore(prev => prev + 10)
        await playSound.encouragement()
      }
    }
    
    if (!isMatch) {
      await playSound.support()
    }
    
    // Clear selection
    setSelectedItems([])
  }

  const endGame = async () => {
    setGameState('completed')
    
    const finalScore = Math.round((score / (pairs.length * 10)) * 100)
    const timeBonus = Math.round(timeLeft / 2)
    const accuracyBonus = attempts > 0 ? Math.round((score / (attempts * 10)) * 50) : 0
    const totalScore = Math.min(100, finalScore + timeBonus + accuracyBonus)
    
    // Update child progress
    if (selectedChild) {
      await updateChildProgress(selectedChild.id, {
        gamesPlayed: selectedChild.progress.gamesPlayed + 1,
        overallProgress: Math.max(selectedChild.progress.overallProgress, 
          Math.round((selectedChild.progress.overallProgress + totalScore) / 2))
      })
    }
    
    const gameDetails = {
      matches: pairs.filter(p => p.matched).length,
      totalPairs: pairs.length,
      attempts,
      timeUsed: 120 - timeLeft,
      accuracy: attempts > 0 ? Math.round((score / (attempts * 10)) * 100) : 0
    }
    
    onGameComplete(totalScore, gameDetails)
    
    if (totalScore >= 80) {
      await playSound.speak("Excellent work! You matched all the letters perfectly!", { rate: 0.8, pitch: 1.2 })
    } else if (totalScore >= 60) {
      await playSound.speak("Great job! You're getting better at matching letters!", { rate: 0.8, pitch: 1.1 })
    } else {
      await playSound.speak("Good try! Let's practice more to improve your matching skills.", { rate: 0.8 })
    }
  }

  const restartGame = () => {
    setGameState('playing')
    setScore(0)
    setAttempts(0)
    setSelectedItems([])
    setGameStarted(false)
    setPairs([])
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600 mb-4">
            🔤 Letter Matching Game
          </CardTitle>
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Match each letter with its corresponding word!
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">How to Play:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Click on a letter, then click on its matching word</li>
                <li>• Listen to the sounds to help you match</li>
                <li>• Complete all matches before time runs out</li>
                <li>• Get bonus points for speed and accuracy!</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={startGame}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4"
          >
            🎮 Start Game
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
    const finalScore = Math.round((score / (pairs.length * 10)) * 100)
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-600 mb-4">
            🎉 Game Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-blue-600">{finalScore}%</div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{pairs.filter(p => p.matched).length}</div>
              <div className="text-sm text-gray-600">Matches</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{attempts}</div>
              <div className="text-sm text-gray-600">Attempts</div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={restartGame}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              🔄 Play Again
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
            <div className="text-xl font-bold text-blue-600">
              Letter Matching Game
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-green-600 font-semibold">
                Score: {score}
              </div>
              <div className="text-red-600 font-semibold">
                Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          <Progress value={(score / (pairs.length * 10)) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Game Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letters Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-blue-600">Letters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {pairs.map((pair) => (
                <button
                  key={`letter-${pair.letter}`}
                  onClick={() => handleItemClick('letter', pair.letter)}
                  disabled={pair.matched}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    pair.matched 
                      ? 'border-green-400 bg-green-50 opacity-50' 
                      : selectedItems.some(s => s.type === 'letter' && s.value === pair.letter)
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-3xl font-bold text-blue-600">{pair.letter}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Words Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-purple-600">Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pairs.map((pair) => (
                <button
                  key={`word-${pair.word}`}
                  onClick={() => handleItemClick('word', pair.word)}
                  disabled={pair.matched}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                    pair.matched 
                      ? 'border-green-400 bg-green-50 opacity-50' 
                      : selectedItems.some(s => s.type === 'word' && s.value === pair.word)
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-2xl">{pair.icon}</span>
                  <span className="text-lg font-semibold text-gray-800">{pair.word}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={onBackToMenu}
          variant="outline"
        >
          ← Back to Games
        </Button>
        <Button
          onClick={restartGame}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          🔄 Restart Game
        </Button>
      </div>
    </div>
  )
}