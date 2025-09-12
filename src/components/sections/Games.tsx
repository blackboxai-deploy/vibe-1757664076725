'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LetterMatchingGame from '@/components/games/LetterMatchingGame'
import WordBuilderGame from '@/components/games/WordBuilderGame'
import NumberAdventureGame from '@/components/games/NumberAdventureGame'

const educationalGames = [
  {
    id: 'letter-matching',
    title: 'Letter Matching',
    description: 'Match letters with corresponding images and words',
    icon: '🔤',
    difficulty: 'Easy',
    duration: '5-10 min',
    category: 'Alphabet',
    color: 'from-blue-500 to-cyan-500',
    players: 'Single Player',
    skills: ['Letter Recognition', 'Visual Memory'],
    implemented: true
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    description: 'Build words by arranging letters in correct order',
    icon: '🏗️',
    difficulty: 'Medium',
    duration: '10-15 min',
    category: 'Spelling',
    color: 'from-green-500 to-emerald-500',
    players: 'Single Player',
    skills: ['Spelling', 'Word Formation'],
    implemented: true
  },
  {
    id: 'number-adventure',
    title: 'Number Adventure',
    description: 'Go on a quest while learning numbers 1-10',
    icon: '🔢',
    difficulty: 'Easy',
    duration: '10-15 min',
    category: 'Numbers',
    color: 'from-purple-500 to-pink-500',
    players: 'Single Player',
    skills: ['Number Recognition', 'Counting'],
    implemented: true
  },
  {
    id: 'sound-safari',
    title: 'Sound Safari',
    description: 'Identify animals by their starting letter sounds',
    icon: '🦁',
    difficulty: 'Easy',
    duration: '8-12 min',
    category: 'Phonics',
    color: 'from-yellow-500 to-orange-500',
    players: 'Single Player',
    skills: ['Phonics', 'Sound Recognition'],
    implemented: false
  },
  {
    id: 'pattern-puzzle',
    title: 'Pattern Puzzle',
    description: 'Complete visual and letter patterns',
    icon: '🧩',
    difficulty: 'Hard',
    duration: '15-20 min',
    category: 'Logic',
    color: 'from-indigo-500 to-purple-500',
    players: 'Single Player',
    skills: ['Pattern Recognition', 'Logic'],
    implemented: false
  },
  {
    id: 'reading-race',
    title: 'Reading Race',
    description: 'Race against time to read simple sentences',
    icon: '🏁',
    difficulty: 'Medium',
    duration: '5-8 min',
    category: 'Reading',
    color: 'from-red-500 to-pink-500',
    players: 'Single Player',
    skills: ['Reading Speed', 'Comprehension'],
    implemented: false
  }
]

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  const { selectedChild, startSession, endSession, updateChildProgress } = useAuth()

  if (!selectedChild) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to play educational games
        </h2>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(educationalGames.map(game => game.category)))]
  
  const filteredGames = selectedCategory === 'All' 
    ? educationalGames 
    : educationalGames.filter(game => game.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

   const startGame = async (gameId: string) => {
    const game = educationalGames.find(g => g.id === gameId)
    if (!game) return
    
    if (!game.implemented) {
      alert(`${game.title} is coming soon! Try our implemented games: Letter Matching, Word Builder, or Number Adventure.`)
      return
    }
    
    if (selectedChild) {
      await startSession(`game-${gameId}`)
    }
    setCurrentGame(gameId)
  }

  const handleGameComplete = async (score: number, details: any) => {
    if (selectedChild) {
      // Record game completion and update progress
      await updateChildProgress(selectedChild.id, {
        gamesPlayed: selectedChild.progress.gamesPlayed + 1
      })
    }
    
    // End the session
    await endSession(score, details)
    
    // Show completion message
    alert(`Game completed! Score: ${score}%`)
  }

  const backToGameMenu = () => {
    setCurrentGame(null)
  }

  // Render specific game component
  const renderGame = () => {
    switch (currentGame) {
      case 'letter-matching':
        return (
          <LetterMatchingGame
            onGameComplete={handleGameComplete}
            onBackToMenu={backToGameMenu}
          />
        )
      case 'word-builder':
        return (
          <WordBuilderGame
            onGameComplete={handleGameComplete}
            onBackToMenu={backToGameMenu}
          />
        )
      case 'number-adventure':
        return (
          <NumberAdventureGame
            onGameComplete={handleGameComplete}
            onBackToMenu={backToGameMenu}
          />
        )
      default:
        return null
    }
  }

   // If a game is selected, render the game component
  if (currentGame) {
    return renderGame()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🎮
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Educational Games
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Learn through fun and interactive games, {selectedChild?.name}!
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className={selectedCategory === category ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Card 
            key={game.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1 group"
          >
            {/* Game Header with Icon */}
            <div className={`h-40 bg-gradient-to-br ${game.color} flex flex-col items-center justify-center relative p-6`}>
              <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {game.icon}
              </div>
              <Badge 
                className={`${getDifficultyColor(game.difficulty)} border-0 font-semibold`}
              >
                {game.difficulty}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Title and Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Game Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium text-gray-700">{game.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-700">{game.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Mode:</span>
                    <span className="font-medium text-gray-700">{game.players}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Practiced:</h4>
                  <div className="flex flex-wrap gap-1">
                    {game.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                 {/* Play Button */}
                <Button
                  onClick={() => startGame(game.id)}
                  disabled={!game.implemented}
                  className={`w-full ${
                    game.implemented 
                      ? `bg-gradient-to-r ${game.color} hover:opacity-90` 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-all duration-300 font-semibold`}
                >
                  {game.implemented ? '🎮 Play Now' : '🚧 Coming Soon'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Game Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gaming Progress</h3>
                <p className="text-gray-600">
                  {selectedChild.name} has played {selectedChild.progress.gamesPlayed} games this week!
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedChild.progress.gamesPlayed}
              </div>
              <div className="text-sm text-gray-500">Games Played</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Preview */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl text-white">🎯</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Next Achievement</h3>
              <p className="text-gray-600">
                Play 5 more games to unlock the "Game Explorer" badge!
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(selectedChild.progress.gamesPlayed % 15 / 15) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {15 - (selectedChild.progress.gamesPlayed % 15)} games to go!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}