'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const learningModules = [
  {
    id: 'phonics-basics',
    title: 'Phonics Basics',
    description: 'Learn fundamental letter sounds and combinations',
    icon: '🔤',
    difficulty: 'Beginner',
    duration: '15 min',
    lessons: 8,
    completed: 6,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'reading-comprehension',
    title: 'Reading Comprehension',
    description: 'Improve understanding of texts and stories',
    icon: '📖',
    difficulty: 'Intermediate',
    duration: '20 min',
    lessons: 10,
    completed: 4,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'writing-skills',
    title: 'Writing Skills',
    description: 'Practice letter formation and word writing',
    icon: '✍️',
    difficulty: 'Beginner',
    duration: '12 min',
    lessons: 6,
    completed: 6,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'visual-processing',
    title: 'Visual Processing',
    description: 'Enhance visual recognition and memory',
    icon: '👁️',
    difficulty: 'Advanced',
    duration: '25 min',
    lessons: 12,
    completed: 2,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'word-patterns',
    title: 'Word Patterns',
    description: 'Recognize common spelling patterns',
    icon: '🧩',
    difficulty: 'Intermediate',
    duration: '18 min',
    lessons: 9,
    completed: 0,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'sentence-building',
    title: 'Sentence Building',
    description: 'Construct sentences with proper grammar',
    icon: '🏗️',
    difficulty: 'Advanced',
    duration: '30 min',
    lessons: 15,
    completed: 1,
    color: 'from-teal-500 to-blue-500'
  }
]

export default function Modules() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const { selectedChild } = useAuth()

  if (!selectedChild) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to view learning modules
        </h2>
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'from-green-500 to-emerald-500'
    if (progress >= 50) return 'from-blue-500 to-cyan-500'
    return 'from-gray-400 to-gray-500'
  }

  const openModule = (moduleId: string) => {
    setSelectedModule(moduleId)
    // In a real app, this would navigate to the module content
    alert(`Opening module: ${moduleId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🎓
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Learning Modules
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Structured educational content for {selectedChild.name}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {learningModules.map((module) => {
          const progressPercent = (module.completed / module.lessons) * 100
          
          return (
            <Card 
              key={module.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1"
            >
              {/* Module Header with Gradient */}
              <div className={`h-32 bg-gradient-to-br ${module.color} flex items-center justify-center relative`}>
                <span className="text-5xl">{module.icon}</span>
                
                {/* Completion Badge */}
                {progressPercent === 100 && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <span className="text-white text-xl">✓</span>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title and Description */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {module.description}
                    </p>
                  </div>

                  {/* Module Info */}
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(module.difficulty)} border-0`}
                    >
                      {module.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      ⏱️ {module.duration}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      📚 {module.lessons} lessons
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">
                        {module.completed}/{module.lessons} completed
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={progressPercent} className="h-2" />
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getProgressColor(progressPercent)} transition-all duration-500`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {progressPercent === 100 ? 'Completed!' : `${Math.round(progressPercent)}% complete`}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => openModule(module.id)}
                    className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 transition-opacity`}
                  >
                    {progressPercent === 100 ? 'Review Module' : 
                     progressPercent > 0 ? 'Continue Learning' : 'Start Module'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Overall Progress Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Overall Module Progress</h3>
                <p className="text-gray-600">
                  {selectedChild.name} has completed{' '}
                  {learningModules.reduce((acc, mod) => acc + mod.completed, 0)} out of{' '}
                  {learningModules.reduce((acc, mod) => acc + mod.lessons, 0)} total lessons
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  (learningModules.reduce((acc, mod) => acc + mod.completed, 0) /
                   learningModules.reduce((acc, mod) => acc + mod.lessons, 0)) * 100
                )}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}