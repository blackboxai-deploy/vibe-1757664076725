'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { playSound } from '@/lib/voiceSynthesis'
import { db } from '@/lib/database'

const assessmentQuestions = [
  {
    question: "Which letter is this: A?",
    options: ["A", "B", "C", "D"],
    answer: "A",
    type: "letter-recognition"
  },
  {
    question: "Select the word that starts with 'B'",
    options: ["Cat", "Ball", "Dog", "Egg"],
    answer: "Ball",
    type: "word-recognition"
  },
  {
    question: "Which number comes after 5?",
    options: ["4", "6", "7", "8"],
    answer: "6",
    type: "number-sequence"
  },
  {
    question: "Select the correct spelling of the fruit",
    options: ["Aple", "Apple", "Appl", "Appel"],
    answer: "Apple",
    type: "spelling"
  },
  {
    question: "What sound does the letter 'M' make?",
    options: ["mmm", "nnn", "bbb", "sss"],
    answer: "mmm",
    type: "phonics"
  }
]

export default function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { selectedChild, updateChildProgress, startSession, endSession } = useAuth()

   // Start assessment session
  useEffect(() => {
    const initializeAssessment = async () => {
      if (selectedChild && !sessionId) {
        const newSessionId = await startSession('assessment')
        setSessionId(newSessionId)
        setStartTime(new Date())
      }
    }
    initializeAssessment()
    
    return () => {
      // Cleanup session on unmount
      if (sessionId) {
        endSession()
      }
    }
  }, [selectedChild])

  if (!selectedChild) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to start assessment
        </h2>
      </div>
    )
  }

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100

   const handleOptionSelect = async (option: string) => {
    setSelectedOption(option)
    await playSound.speak(option, { rate: 0.8 })
  }

  const handleNext = () => {
    if (!selectedOption) return

    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = selectedOption

    setUserAnswers(newAnswers)
    setSelectedOption('')

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      completeAssessment(newAnswers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedOption(userAnswers[currentQuestionIndex - 1] || '')
    }
  }

   const completeAssessment = async (answers: string[]) => {
    let correctCount = 0
    assessmentQuestions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / assessmentQuestions.length) * 100)
    setScore(finalScore)
    setAssessmentComplete(true)

    // Calculate time spent
    const timeSpent = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) : 0

    // Record assessment in database
    if (selectedChild) {
      await db.recordAssessment(selectedChild.id, {
        score: finalScore,
        totalQuestions: assessmentQuestions.length,
        correctAnswers: correctCount,
        timeSpent,
        category: 'general'
      })

      // Update child's progress
      await updateChildProgress(selectedChild.id, {
        overallProgress: Math.max(selectedChild.progress.overallProgress, 
          Math.round((selectedChild.progress.overallProgress + finalScore) / 2))
      })
    }

    // End session
    if (sessionId) {
      await endSession(finalScore, {
        correctAnswers: correctCount,
        totalQuestions: assessmentQuestions.length,
        timeSpent,
        answers
      })
    }

    // Play encouraging feedback
    if (finalScore >= 80) {
      await playSound.encouragement()
      await playSound.speak("Excellent work! You did amazing on this assessment!", { rate: 0.8, pitch: 1.2 })
    } else if (finalScore >= 60) {
      await playSound.encouragement()
      await playSound.speak("Great job! You're making good progress!", { rate: 0.8, pitch: 1.1 })
    } else {
      await playSound.support()
      await playSound.speak("Good effort! Keep practicing and you'll do even better next time!", { rate: 0.8 })
    }
  }

   const resetAssessment = async () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedOption('')
    setAssessmentComplete(false)
    setScore(0)
    
    // Start new session
    if (selectedChild) {
      const newSessionId = await startSession('assessment-retry')
      setSessionId(newSessionId)
      setStartTime(new Date())
    }
  }

  if (assessmentComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">🎉</span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Assessment Complete!
            </CardTitle>
            <CardDescription className="text-lg">
              Great job, {selectedChild.name}!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {score}%
              </div>
              <p className="text-xl text-gray-600">Final Score</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-inner">
              <h3 className="font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Answered:</span>
                  <span className="font-semibold">{assessmentQuestions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Correct Answers:</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((score / 100) * assessmentQuestions.length)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className={`font-semibold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {score}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={resetAssessment}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Take Again
              </Button>
              <Button variant="outline">
                View Detailed Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Dyslexia Assessment
              </CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Question */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
            
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium
                    ${selectedOption === option
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedOption === option ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                    `}>
                      {selectedOption === option && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedOption}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {currentQuestionIndex === assessmentQuestions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}