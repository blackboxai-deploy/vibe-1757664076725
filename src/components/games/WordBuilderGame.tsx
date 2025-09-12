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

interface WordChallenge {
  word: string
  letters: string[]
  image: string
  hint: string
}

const wordChallenges: WordChallenge[] = [
  { word: 'CAT', letters: ['C', 'A', 'T', 'B', 'D', 'E'], image: '🐱', hint: 'A furry pet that says meow' },
  { word: 'DOG', letters: ['D', 'O', 'G', 'A', 'B', 'C'], image: '🐕', hint: 'A loyal pet that barks' },
  { word: 'SUN', letters: ['S', 'U', 'N', 'M', 'O', 'P'], image: '☀️', hint: 'It shines bright in the sky' },
  { word: 'TREE', letters: ['T', 'R', 'E', 'E', 'A', 'S'], image: '🌳', hint: 'Tall plant with leaves' },
  { word: 'FISH', letters: ['F', 'I', 'S', 'H', 'A', 'B'], image: '🐟', hint: 'Swims in the water' },
  { word: 'BOOK', letters: ['B', 'O', 'O', 'K', 'A', 'T'], image: '📚', hint: 'You read this to learn' },
  { word: 'APPLE', letters: ['A', 'P', 'P', 'L', 'E', 'B'], image: '🍎', hint: 'Red fruit that\'s healthy' },
  { word: 'HOUSE', letters: ['H', 'O', 'U', 'S', 'E', 'A'], image: '🏠', hint: 'Where you live' }
]

export default function WordBuilderGame({ onGameComplete, onBackToMenu }: GameProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing')
  const [currentChallengeIndex, setChallengeIndex] = useState(0)
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [completedWords, setCompletedWords] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  
  const { selectedChild, updateChildProgress } = useAuth()
  const currentChallenge = wordChallenges[currentChallengeIndex]

  // Initialize game
  useEffect(() => {
    if (!gameStarted) return
    loadChallenge()
  }, [gameStarted, currentChallengeIndex])

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

  const loadChallenge = () => {
    if (!currentChallenge) return
    
    // Shuffle available letters
    const shuffled = [...currentChallenge.letters].sort(() => Math.random() - 0.5)
    setAvailableLetters(shuffled)
    setSelectedLetters([])
    setShowHint(false)
  }

  const startGame = async () => {
    setGameStarted(true)
    await playSound.speak("Build words using the letters provided! Look at the picture and listen to the hint to help you.", { rate: 0.8 })
  }

  const selectLetter = async (letter: string, index: number) => {
    if (selectedLetters.length >= currentChallenge.word.length) return
    
    setSelectedLetters(prev => [...prev, letter])
    setAvailableLetters(prev => prev.filter((_, i) => i !== index))
    
    await playSound.letter(letter)
  }

  const removeLetter = async (index: number) => {
    const letter = selectedLetters[index]
    setSelectedLetters(prev => prev.filter((_, i) => i !== index))
    setAvailableLetters(prev => [...prev, letter])
    
    await playSound.letter(letter)
  }

  const checkWord = async () => {
    const builtWord = selectedLetters.join('')
    setAttempts(prev => prev + 1)
    
    if (builtWord === currentChallenge.word) {
      // Correct word!
      setScore(prev => prev + 20)
      setCompletedWords(prev => prev + 1)
      
      await playSound.encouragement()
      await playSound.word(currentChallenge.word)
      
      // Move to next challenge or end game
      if (currentChallengeIndex < wordChallenges.length - 1) {
        setTimeout(() => {
          setChallengeIndex(prev => prev + 1)
        }, 2000)
      } else {
        setTimeout(() => endGame(), 2000)
      }
    } else {
      // Incorrect word
      await playSound.support()
      // Clear the attempt
      setAvailableLetters(prev => [...prev, ...selectedLetters])
      setSelectedLetters([])
    }
  }

  const getHint = async () => {
    setShowHint(true)
    await playSound.speak(currentChallenge.hint, { rate: 0.8 })
  }

  const skipWord = () => {
    if (currentChallengeIndex < wordChallenges.length - 1) {
      setChallengeIndex(prev => prev + 1)
    } else {
      endGame()
    }
  }

  const endGame = async () => {
    setGameState('completed')
    
    const finalScore = Math.round((completedWords / wordChallenges.length) * 100)
    const timeBonus = Math.round(timeLeft / 3)
    const accuracyBonus = attempts > 0 ? Math.round((completedWords / attempts) * 30) : 0
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
      wordsCompleted: completedWords,
      totalWords: wordChallenges.length,
      attempts,
      timeUsed: 180 - timeLeft,
      accuracy: attempts > 0 ? Math.round((completedWords / attempts) * 100) : 0
    }
    
    onGameComplete(totalScore, gameDetails)
    
    if (totalScore >= 90) {
      await playSound.speak("Outstanding! You're a fantastic word builder!", { rate: 0.8, pitch: 1.2 })
    } else if (totalScore >= 70) {
      await playSound.speak("Great job! You're getting really good at building words!", { rate: 0.8, pitch: 1.1 })
    } else {
      await playSound.speak("Good effort! Keep practicing to become an even better word builder.", { rate: 0.8 })
    }
  }

  const restartGame = () => {
    setGameState('playing')
    setChallengeIndex(0)
    setScore(0)
    setAttempts(0)
    setCompletedWords(0)
    setSelectedLetters([])
    setAvailableLetters([])
    setGameStarted(false)
    setTimeLeft(180)
    setShowHint(false)
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-purple-600 mb-4">
            🏗️ Word Builder Game
          </CardTitle>
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Build words using the letters provided! Use the pictures and hints to help you.
            </p>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">How to Play:</h4>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Look at the picture for a clue</li>
                <li>• Click letters to build the word</li>
                <li>• Click "Check Word" when you think you have it right</li>
                <li>• Use hints if you need help</li>
                <li>• Complete as many words as possible!</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={startGame}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-lg px-8 py-4"
          >
            🎮 Start Building Words
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
    const finalScore = Math.round((completedWords / wordChallenges.length) * 100)
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-600 mb-4">
            🎉 Word Building Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-purple-600">{finalScore}%</div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{completedWords}</div>
              <div className="text-sm text-gray-600">Words Built</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{attempts}</div>
              <div className="text-sm text-gray-600">Attempts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {attempts > 0 ? Math.round((completedWords / attempts) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={restartGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              🔄 Build More Words
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
            <div className="text-xl font-bold text-purple-600">
              Word Builder - Level {currentChallengeIndex + 1}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-green-600 font-semibold">
                Score: {score}
              </div>
              <div className="text-blue-600 font-semibold">
                Words: {completedWords}/{wordChallenges.length}
              </div>
              <div className="text-red-600 font-semibold">
                Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          <Progress value={(completedWords / wordChallenges.length) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Challenge Display */}
      <Card>
        <CardHeader className="text-center">
          <div className="text-8xl mb-4">{currentChallenge.image}</div>
          <CardTitle className="text-2xl text-gray-800">
            Build this word using the letters below
          </CardTitle>
          {showHint && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">💡 Hint: {currentChallenge.hint}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Word Building Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-gray-800">Your Word</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-2 mb-6">
            {Array.from({ length: currentChallenge.word.length }).map((_, index) => (
              <div
                key={index}
                onClick={() => selectedLetters[index] && removeLetter(index)}
                className={`w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-all ${
                  selectedLetters[index] 
                    ? 'bg-purple-100 border-purple-400 text-purple-800 hover:bg-purple-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {selectedLetters[index] || '?'}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={checkWord}
              disabled={selectedLetters.length !== currentChallenge.word.length}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              ✓ Check Word
            </Button>
            <Button
              onClick={getHint}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              💡 Get Hint
            </Button>
            <Button
              onClick={skipWord}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ⏭️ Skip Word
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Letters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-gray-800">Available Letters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-3">
            {availableLetters.map((letter, index) => (
              <button
                key={`${letter}-${index}`}
                onClick={() => selectLetter(letter, index)}
                className="w-14 h-14 bg-white border-2 border-purple-300 rounded-lg flex items-center justify-center text-xl font-bold text-purple-700 hover:bg-purple-100 hover:border-purple-400 transition-all transform hover:scale-105"
              >
                {letter}
              </button>
            ))}
          </div>
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
          onClick={restartGame}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          🔄 Restart Game
        </Button>
      </div>
    </div>
  )
}