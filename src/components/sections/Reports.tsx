'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function Reports() {
  const { selectedChild } = useAuth()

  if (!selectedChild) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Select a child to view their progress reports
        </h2>
      </div>
    )
  }

  const { progress } = selectedChild
  
  const reportData = [
    {
      title: 'Alphabet Mastery',
      current: progress.lettersMastered,
      total: 26,
      percentage: (progress.lettersMastered / 26) * 100,
      color: 'from-blue-500 to-cyan-500',
      icon: '🔤',
      improvement: '+3 this week'
    },
    {
      title: 'Number Recognition',
      current: progress.numbersCompleted,
      total: 10,
      percentage: (progress.numbersCompleted / 10) * 100,
      color: 'from-green-500 to-emerald-500',
      icon: '🔢',
      improvement: '+2 this week'
    },
    {
      title: 'Reading Comprehension',
      current: 8,
      total: 10,
      percentage: 80,
      color: 'from-purple-500 to-pink-500',
      icon: '📖',
      improvement: '+1 this week'
    },
    {
      title: 'Writing Skills',
      current: 7,
      total: 10,
      percentage: 70,
      color: 'from-orange-500 to-red-500',
      icon: '✍️',
      improvement: '+2 this week'
    }
  ]

    const assessmentHistory = selectedChild.progress.assessmentScores.map((assessmentScore, index) => {
    const currentScore = typeof assessmentScore === 'object' ? assessmentScore.score : assessmentScore
    const currentDate = typeof assessmentScore === 'object' 
      ? new Date(assessmentScore.date).toLocaleDateString()
      : new Date(Date.now() - (selectedChild.progress.assessmentScores.length - index - 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    
    let improvement = 0
    if (index > 0) {
      const previousScore = selectedChild.progress.assessmentScores[index - 1]
      const prevScoreValue = typeof previousScore === 'object' ? previousScore.score : previousScore
      improvement = currentScore - prevScoreValue
    }
    
    return {
      date: currentDate,
      score: currentScore,
      improvement
    }
  })

  const achievements = [
    { title: 'Letter Master', description: 'Mastered all 26 letters', achieved: progress.lettersMastered === 26, icon: '🏆' },
    { title: 'Number Ninja', description: 'Completed all number recognition', achieved: progress.numbersCompleted === 10, icon: '🥷' },
    { title: 'Game Enthusiast', description: 'Played 10+ educational games', achieved: progress.gamesPlayed >= 10, icon: '🎮' },
    { title: 'Consistent Learner', description: '7 days of continuous learning', achieved: true, icon: '📅' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                📈
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Progress Reports
                </CardTitle>
                <CardDescription className="text-lg">
                  {selectedChild.name}'s learning journey and achievements
                </CardDescription>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {progress.overallProgress}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Skill Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportData.map((item, index) => (
          <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className={`h-3 bg-gradient-to-r ${item.color}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-green-600 font-medium">{item.improvement}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {item.current}/{item.total}
                    </div>
                    <div className="text-sm text-gray-500">{Math.round(item.percentage)}%</div>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assessment History */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Assessment History</CardTitle>
          <CardDescription>
            Track {selectedChild.name}'s assessment scores over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessmentHistory.map((assessment, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Assessment {index + 1}</div>
                    <div className="text-sm text-gray-500">{assessment.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {assessment.improvement !== 0 && (
                    <div className={`text-sm font-medium px-2 py-1 rounded ${
                      assessment.improvement > 0 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-red-700 bg-red-100'
                    }`}>
                      {assessment.improvement > 0 ? '+' : ''}{assessment.improvement}%
                    </div>
                  )}
                  <div className="text-xl font-bold text-gray-900">{assessment.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Achievements</CardTitle>
          <CardDescription>
            {selectedChild.name}'s learning milestones and accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.achieved 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${achievement.achieved ? 'grayscale-0' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      achievement.achieved ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.achieved ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.achieved && (
                    <div className="text-green-500">
                      <span className="text-xl">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Share Progress</h3>
              <p className="text-gray-600">
                Download detailed reports or share {selectedChild.name}'s progress with teachers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                📄 Download PDF Report
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                📧 Email to Teacher
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                📊 View Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}