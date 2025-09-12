'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { db, SessionRecord } from '@/lib/database'

export default function Dashboard() {
  const { selectedChild } = useAuth()
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([])
  const [analytics, setAnalytics] = useState<any>(null)

  // Load recent activity data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!selectedChild) return
      
      try {
        const sessions = await db.getSessionsByChild(selectedChild.id)
        const recentSessions = sessions
          .filter(s => s.completed)
          .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
          .slice(0, 5)
        
        setRecentSessions(recentSessions)
        
        const analyticsData = await db.getChildAnalytics(selectedChild.id, 7)
        setAnalytics(analyticsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    
    loadDashboardData()
  }, [selectedChild])

  if (!selectedChild) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to view their dashboard
        </h2>
      </div>
    )
  }

  const { progress } = selectedChild

  const statCards = [
    {
      title: 'Overall Progress',
      value: `${progress.overallProgress}%`,
      description: 'Complete learning journey',
      progress: progress.overallProgress,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Letters Mastered',
      value: progress.lettersMastered,
      description: 'Out of 26 letters',
      progress: (progress.lettersMastered / 26) * 100,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Numbers Completed',
      value: progress.numbersCompleted,
      description: 'Out of 10 numbers',
      progress: (progress.numbersCompleted / 10) * 100,
      color: 'from-yellow-500 to-orange-600'
    },
     {
      title: 'Games Played',
      value: progress.gamesPlayed,
      description: 'Learning through play',
      progress: (progress.gamesPlayed / 20) * 100,
      color: 'from-pink-500 to-red-600'
    },
    {
      title: 'Play Time',
      value: `${Math.round(progress.totalPlayTime / 60)}h`,
      description: 'Total learning time',
      progress: Math.min(100, (progress.totalPlayTime / 600) * 100), // Max 10 hours
      color: 'from-indigo-500 to-blue-600'
    },
    {
      title: 'Streak Days',
      value: progress.streakDays,
      description: 'Days in a row',
      progress: Math.min(100, (progress.streakDays / 30) * 100), // Max 30 days
      color: 'from-emerald-500 to-green-600'
    }
  ]

   const formatRecentActivities = () => {
    return recentSessions.map(session => {
      const timeAgo = getTimeAgo(new Date(session.endTime))
      const activityName = getActivityDisplayName(session.activity)
      const score = session.score ? `${session.score}%` : 'Completed'
      
      return {
        action: activityName,
        score,
        time: timeAgo,
        duration: `${session.duration} min`
      }
    })
  }

  const getActivityDisplayName = (activity: string): string => {
    const activityMap: Record<string, string> = {
      'assessment': 'Assessment Test',
      'learning-alphabet': 'Alphabet Learning',
      'learning-numbers': 'Number Learning',
      'game-letter-matching': 'Letter Matching Game',
      'game-word-builder': 'Word Builder Game',
      'game-number-adventure': 'Number Adventure Game'
    }
    
    return activityMap[activity] || activity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
            {selectedChild.avatar}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {selectedChild.name}!
            </h1>
            <p className="text-lg text-gray-600">
              Ready to continue your learning journey?
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            Continue Learning →
          </Button>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <Progress value={stat.progress} className="h-2" />
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
          <CardDescription>
            {selectedChild.name}'s latest learning achievements
          </CardDescription>
        </CardHeader>
         <CardContent>
          <div className="space-y-4">
            {formatRecentActivities().length > 0 ? (
              formatRecentActivities().map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.action}</h4>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {activity.duration}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      {activity.score}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity yet.</p>
                <p className="text-sm">Start learning to see your progress here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Continue Learning</h3>
            <p className="text-sm text-gray-600">Resume where you left off</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎮</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Play Games</h3>
            <p className="text-sm text-gray-600">Learn through fun activities</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Take Assessment</h3>
            <p className="text-sm text-gray-600">Check your progress</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}