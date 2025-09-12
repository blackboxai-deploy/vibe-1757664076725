'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { playSound } from '@/lib/voiceSynthesis'

const letterCharacters = {
  'A': { icon: '🍎', word: 'Apple', sound: '/eɪ/' },
  'B': { icon: '📚', word: 'Book', sound: '/biː/' },
  'C': { icon: '🐱', word: 'Cat', sound: '/siː/' },
  'D': { icon: '🐕', word: 'Dog', sound: '/diː/' },
  'E': { icon: '🥚', word: 'Egg', sound: '/iː/' },
  'F': { icon: '🐟', word: 'Fish', sound: '/ɛf/' },
  'G': { icon: '🍇', word: 'Grape', sound: '/dʒiː/' },
  'H': { icon: '🏠', word: 'House', sound: '/eɪtʃ/' },
  'I': { icon: '🍦', word: 'Ice cream', sound: '/aɪ/' },
  'J': { icon: '🧃', word: 'Juice', sound: '/dʒeɪ/' },
  'K': { icon: '🔑', word: 'Key', sound: '/keɪ/' },
  'L': { icon: '🍋', word: 'Lemon', sound: '/ɛl/' },
  'M': { icon: '🌙', word: 'Moon', sound: '/ɛm/' },
  'N': { icon: '👃', word: 'Nose', sound: '/ɛn/' },
  'O': { icon: '🍊', word: 'Orange', sound: '/oʊ/' },
  'P': { icon: '🍕', word: 'Pizza', sound: '/piː/' },
  'Q': { icon: '👸', word: 'Queen', sound: '/kjuː/' },
  'R': { icon: '🌧️', word: 'Rain', sound: '/ɑː/' },
  'S': { icon: '☀️', word: 'Sun', sound: '/ɛs/' },
  'T': { icon: '🌳', word: 'Tree', sound: '/tiː/' },
  'U': { icon: '☂️', word: 'Umbrella', sound: '/juː/' },
  'V': { icon: '🎻', word: 'Violin', sound: '/viː/' },
  'W': { icon: '💧', word: 'Water', sound: '/ˈdʌbəl.juː/' },
  'X': { icon: '❌', word: 'X-ray', sound: '/ɛks/' },
  'Y': { icon: '🟡', word: 'Yellow', sound: '/waɪ/' },
  'Z': { icon: '🦓', word: 'Zebra', sound: '/ziː/' }
}

const numberCharacters = {
  '1': { icon: '1️⃣', word: 'One', value: 1 },
  '2': { icon: '2️⃣', word: 'Two', value: 2 },
  '3': { icon: '3️⃣', word: 'Three', value: 3 },
  '4': { icon: '4️⃣', word: 'Four', value: 4 },
  '5': { icon: '5️⃣', word: 'Five', value: 5 },
  '6': { icon: '6️⃣', word: 'Six', value: 6 },
  '7': { icon: '7️⃣', word: 'Seven', value: 7 },
  '8': { icon: '8️⃣', word: 'Eight', value: 8 },
  '9': { icon: '9️⃣', word: 'Nine', value: 9 },
  '10': { icon: '🔟', word: 'Ten', value: 10 }
}

export default function Learning() {
  const [activeTab, setActiveTab] = useState('alphabet')
  const [isPlaying, setIsPlaying] = useState(false)
  const { selectedChild, startSession, endSession, updateChildProgress } = useAuth()

  if (!selectedChild) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to start learning
        </h2>
      </div>
    )
  }

   // Start learning session when component mounts
  useEffect(() => {
    let sessionId: string | null = null
    
    const initSession = async () => {
      if (selectedChild) {
        sessionId = await startSession(`learning-${activeTab}`)
      }
    }
    
    initSession()
    
    // Cleanup session on unmount
    return () => {
      if (sessionId && selectedChild) {
        endSession()
      }
    }
  }, [selectedChild, activeTab])

  const handleLetterClick = async (letter: string) => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      await playSound.letter(letter)
      
      // Update progress if letter not yet mastered
      if (selectedChild && !selectedChild.progress.completedModules.includes(`letter-${letter.toLowerCase()}`)) {
        const newLettersMastered = Math.min(26, selectedChild.progress.lettersMastered + 1)
        const newOverallProgress = Math.round((newLettersMastered / 26) * 100)
        
        await updateChildProgress(selectedChild.id, {
          lettersMastered: newLettersMastered,
          overallProgress: Math.max(selectedChild.progress.overallProgress, newOverallProgress),
          completedModules: [...selectedChild.progress.completedModules, `letter-${letter.toLowerCase()}`]
        })
      }
    } catch (error) {
      console.error('Error playing letter sound:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const handleNumberClick = async (number: string) => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      await playSound.number(number)
      
      // Update progress if number not yet completed
      if (selectedChild && !selectedChild.progress.completedModules.includes(`number-${number}`)) {
        const newNumbersCompleted = Math.min(10, selectedChild.progress.numbersCompleted + 1)
        const newOverallProgress = Math.round(((selectedChild.progress.lettersMastered + newNumbersCompleted) / 36) * 100)
        
        await updateChildProgress(selectedChild.id, {
          numbersCompleted: newNumbersCompleted,
          overallProgress: Math.max(selectedChild.progress.overallProgress, newOverallProgress),
          completedModules: [...selectedChild.progress.completedModules, `number-${number}`]
        })
      }
    } catch (error) {
      console.error('Error playing number sound:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const playAllLetters = async () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      await playSound.allLetters()
    } catch (error) {
      console.error('Error playing all letters:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const playAllNumbers = async () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      await playSound.allNumbers()
    } catch (error) {
      console.error('Error playing all numbers:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const stopPlaying = () => {
    playSound.stop()
    setIsPlaying(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Learning Center
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Interactive alphabet and number learning for {selectedChild.name}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
          <TabsTrigger value="alphabet" className="text-base font-semibold">
            🔤 Alphabet
          </TabsTrigger>
          <TabsTrigger value="numbers" className="text-base font-semibold">
            🔢 Numbers
          </TabsTrigger>
        </TabsList>

        {/* Alphabet Tab */}
        <TabsContent value="alphabet" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold">Alphabet Learning</CardTitle>
                <p className="text-gray-600">Click any letter to hear its sound and see examples</p>
              </div>
               <div className="flex gap-2">
                <Button
                  onClick={playAllLetters}
                  disabled={isPlaying}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  {isPlaying ? '⏸️ Playing...' : '🔊 Play All'}
                </Button>
                {isPlaying && (
                  <Button
                    onClick={stopPlaying}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    ⏹️ Stop
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {Object.entries(letterCharacters).map(([letter, data]) => (
                   <div
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    className={`bg-white border-2 border-gray-200 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 group ${
                      selectedChild?.progress.completedModules.includes(`letter-${letter.toLowerCase()}`) ? 'border-green-400 bg-green-50' : ''
                    } ${isPlaying ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {data.icon}
                    </div>
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {letter}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {data.word}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {data.sound}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Numbers Tab */}
        <TabsContent value="numbers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold">Number Learning</CardTitle>
                <p className="text-gray-600">Click any number to hear its pronunciation</p>
              </div>
               <div className="flex gap-2">
                <Button
                  onClick={playAllNumbers}
                  disabled={isPlaying}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isPlaying ? '⏸️ Playing...' : '🔊 Play All'}
                </Button>
                {isPlaying && (
                  <Button
                    onClick={stopPlaying}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    ⏹️ Stop
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-6">
                {Object.entries(numberCharacters).map(([number, data]) => (
                   <div
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={`bg-white border-2 border-gray-200 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1 group ${
                      selectedChild?.progress.completedModules.includes(`number-${number}`) ? 'border-green-400 bg-green-50' : ''
                    } ${isPlaying ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {data.icon}
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {number}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {data.word}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learning Progress</h3>
                <p className="text-gray-600">
                  {selectedChild.name} has mastered {selectedChild.progress.lettersMastered} letters 
                  and {selectedChild.progress.numbersCompleted} numbers!
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}