'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ParentDashboardProps {
  onAddChild: () => void
}

export default function ParentDashboard({ onAddChild }: ParentDashboardProps) {
  const { currentParent, selectedChild, selectChild } = useAuth()

  if (!currentParent) return null

  const getTotalLessons = () => {
    return currentParent.children.reduce((total, child) => {
      return total + child.progress.lettersMastered + child.progress.numbersCompleted + child.progress.gamesPlayed
    }, 0)
  }

  const getAverageProgress = () => {
    if (currentParent.children.length === 0) return 0
    const totalProgress = currentParent.children.reduce((total, child) => total + child.progress.overallProgress, 0)
    return Math.round(totalProgress / currentParent.children.length)
  }

  const getWeeklyActivity = () => {
    // Mock data for weekly activity
    return [
      { day: 'Mon', lessons: 3 },
      { day: 'Tue', lessons: 5 },
      { day: 'Wed', lessons: 2 },
      { day: 'Thu', lessons: 4 },
      { day: 'Fri', lessons: 6 },
      { day: 'Sat', lessons: 3 },
      { day: 'Sun', lessons: 1 }
    ]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                👨‍👩‍👧‍👦
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Parent Dashboard
                </CardTitle>
                <CardDescription className="text-lg">
                  Welcome back, {currentParent.name}
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={onAddChild}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
            >
              + Add Child
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentParent.children.length}</div>
                <div className="text-sm text-gray-600">Children</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{getAverageProgress()}%</div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📚</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{getTotalLessons()}</div>
                <div className="text-sm text-gray-600">Total Lessons</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🎮</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentParent.children.reduce((total, child) => total + child.progress.gamesPlayed, 0)}
                </div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Progress */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Children's Progress</CardTitle>
          <CardDescription>
            Overview of each child's learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentParent.children.map((child) => (
              <div 
                key={child.id} 
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedChild?.id === child.id 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => selectChild(child.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                      <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {child.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{child.name}</h3>
                      <p className="text-gray-600">Age {child.age} • Member since {new Date(child.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{child.progress.overallProgress}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Progress value={child.progress.overallProgress} className="h-3" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-green-600">{child.progress.lettersMastered}</div>
                      <div className="text-xs text-gray-600">Letters</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-blue-600">{child.progress.numbersCompleted}</div>
                      <div className="text-xs text-gray-600">Numbers</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-purple-600">{child.progress.gamesPlayed}</div>
                      <div className="text-xs text-gray-600">Games</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-orange-600">
                        {child.progress.assessmentScores.length > 0 
                          ? child.progress.assessmentScores[child.progress.assessmentScores.length - 1] + '%'
                          : 'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-600">Last Score</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">This Week's Activity</CardTitle>
          <CardDescription>
            Learning activity across all children
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {getWeeklyActivity().map((day) => (
              <div key={day.day} className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">{day.day}</div>
                <div 
                  className="bg-blue-100 rounded-lg p-2 relative"
                  style={{ height: `${Math.max(40, day.lessons * 10)}px` }}
                >
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded absolute bottom-0 left-0 right-0"
                    style={{ height: `${(day.lessons / 6) * 100}%` }}
                  />
                  <div className="relative text-white text-sm font-bold mt-1">
                    {day.lessons}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                📊 View All Reports
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                ⚙️ Settings
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                💌 Contact Teacher
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                📱 Mobile App
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}