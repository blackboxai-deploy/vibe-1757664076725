// Database Service - Local Storage Implementation
// In production, this would connect to a real database like PostgreSQL/MongoDB

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
  updatedAt: string
}

export interface Child {
  id: string
  parentId: string
  name: string
  age: number
  avatar: string
  createdAt: string
  updatedAt: string
  progress: ChildProgress
  sessionHistory: SessionRecord[]
  achievements: Achievement[]
}

export interface ChildProgress {
  overallProgress: number
  lettersMastered: number
  numbersCompleted: number
  gamesPlayed: number
  assessmentScores: AssessmentScore[]
  lastActivity: string
  totalPlayTime: number // in minutes
  streakDays: number
  completedModules: string[]
  currentLevel: number
}

export interface SessionRecord {
  id: string
  childId: string
  activity: string
  startTime: string
  endTime: string
  duration: number // in minutes
  score?: number
  completed: boolean
  details?: Record<string, any>
}

export interface AssessmentScore {
  id: string
  date: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  category: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  category: string
}

export interface GameProgress {
  gameId: string
  childId: string
  level: number
  highScore: number
  timesPlayed: number
  lastPlayed: string
  completed: boolean
}

class DatabaseService {
  private readonly STORAGE_KEYS = {
    USERS: 'dyslexia_users',
    CHILDREN: 'dyslexia_children',
    SESSIONS: 'dyslexia_sessions',
    GAMES: 'dyslexia_games'
  }

  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = this.getUsers()
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    users.push(user)
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users))
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getUsers()
    return users.find(user => user.email === email) || null
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email)
    if (user && user.password === password) {
      return user
    }
    return null
  }

  // Child Management
  async createChild(childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt' | 'sessionHistory' | 'achievements'>): Promise<Child> {
    const children = this.getChildren()
    const child: Child = {
      ...childData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessionHistory: [],
      achievements: []
    }
    
    children.push(child)
    localStorage.setItem(this.STORAGE_KEYS.CHILDREN, JSON.stringify(children))
    return child
  }

  async getChildrenByParent(parentId: string): Promise<Child[]> {
    const children = this.getChildren()
    return children.filter(child => child.parentId === parentId)
  }

  async updateChild(childId: string, updates: Partial<Child>): Promise<Child | null> {
    const children = this.getChildren()
    const index = children.findIndex(child => child.id === childId)
    
    if (index === -1) return null
    
    children[index] = {
      ...children[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(this.STORAGE_KEYS.CHILDREN, JSON.stringify(children))
    return children[index]
  }

  async updateChildProgress(childId: string, progressUpdates: Partial<ChildProgress>): Promise<Child | null> {
    const children = this.getChildren()
    const child = children.find(c => c.id === childId)
    
    if (!child) return null
    
    child.progress = {
      ...child.progress,
      ...progressUpdates,
      lastActivity: new Date().toISOString()
    }
    child.updatedAt = new Date().toISOString()
    
    localStorage.setItem(this.STORAGE_KEYS.CHILDREN, JSON.stringify(children))
    return child
  }

  // Session Management
  async startSession(childId: string, activity: string): Promise<string> {
    const sessionId = this.generateId()
    const session: SessionRecord = {
      id: sessionId,
      childId,
      activity,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      completed: false
    }
    
    const sessions = this.getSessions()
    sessions.push(session)
    localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    
    return sessionId
  }

  async endSession(sessionId: string, score?: number, details?: Record<string, any>): Promise<SessionRecord | null> {
    const sessions = this.getSessions()
    const session = sessions.find(s => s.id === sessionId)
    
    if (!session) return null
    
    const endTime = new Date()
    const startTime = new Date(session.startTime)
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) // minutes
    
    session.endTime = endTime.toISOString()
    session.duration = duration
    session.completed = true
    if (score !== undefined) session.score = score
    if (details) session.details = details
    
    localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    
    // Update child's total play time
    const child = this.getChildren().find(c => c.id === session.childId)
    if (child) {
      await this.updateChildProgress(session.childId, {
        totalPlayTime: child.progress.totalPlayTime + duration
      })
    }
    
    return session
  }

  async getSessionsByChild(childId: string): Promise<SessionRecord[]> {
    const sessions = this.getSessions()
    return sessions.filter(session => session.childId === childId)
  }

  // Assessment Management
  async recordAssessment(childId: string, assessmentData: Omit<AssessmentScore, 'id' | 'date'>): Promise<void> {
    const child = this.getChildren().find(c => c.id === childId)
    if (!child) return
    
    const assessment: AssessmentScore = {
      ...assessmentData,
      id: this.generateId(),
      date: new Date().toISOString()
    }
    
    child.progress.assessmentScores.push(assessment)
    await this.updateChild(childId, child)
  }

  // Achievement Management
  async unlockAchievement(childId: string, achievementData: Omit<Achievement, 'id' | 'unlockedAt'>): Promise<void> {
    const child = this.getChildren().find(c => c.id === childId)
    if (!child) return
    
    // Check if achievement already exists
    const existingAchievement = child.achievements.find(a => a.title === achievementData.title)
    if (existingAchievement) return
    
    const achievement: Achievement = {
      ...achievementData,
      id: this.generateId(),
      unlockedAt: new Date().toISOString()
    }
    
    child.achievements.push(achievement)
    await this.updateChild(childId, child)
  }

  // Game Progress Management
  async updateGameProgress(childId: string, gameId: string, updates: Partial<GameProgress>): Promise<void> {
    const games = this.getGameProgress()
    const existingProgress = games.find(g => g.childId === childId && g.gameId === gameId)
    
    if (existingProgress) {
      Object.assign(existingProgress, updates, { lastPlayed: new Date().toISOString() })
    } else {
      const newProgress: GameProgress = {
        gameId,
        childId,
        level: 1,
        highScore: 0,
        timesPlayed: 0,
        lastPlayed: new Date().toISOString(),
        completed: false,
        ...updates
      }
      games.push(newProgress)
    }
    
    localStorage.setItem(this.STORAGE_KEYS.GAMES, JSON.stringify(games))
  }

  async getGameProgressByChild(childId: string): Promise<GameProgress[]> {
    const games = this.getGameProgress()
    return games.filter(game => game.childId === childId)
  }

  // Analytics
  async getChildAnalytics(childId: string, days: number = 7): Promise<any> {
    const sessions = await this.getSessionsByChild(childId)
    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      return sessionDate >= cutoffDate
    })
    
    const totalPlayTime = recentSessions.reduce((sum, session) => sum + session.duration, 0)
    const activitiesCount = recentSessions.reduce((acc, session) => {
      acc[session.activity] = (acc[session.activity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalSessions: recentSessions.length,
      totalPlayTime,
      averageSessionTime: recentSessions.length > 0 ? totalPlayTime / recentSessions.length : 0,
      activitiesBreakdown: activitiesCount,
      recentSessions: recentSessions.slice(-10)
    }
  }

  // Private helper methods
  private getUsers(): User[] {
    const users = localStorage.getItem(this.STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  }

  private getChildren(): Child[] {
    const children = localStorage.getItem(this.STORAGE_KEYS.CHILDREN)
    return children ? JSON.parse(children) : []
  }

  private getSessions(): SessionRecord[] {
    const sessions = localStorage.getItem(this.STORAGE_KEYS.SESSIONS)
    return sessions ? JSON.parse(sessions) : []
  }

  private getGameProgress(): GameProgress[] {
    const games = localStorage.getItem(this.STORAGE_KEYS.GAMES)
    return games ? JSON.parse(games) : []
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // Initialize with demo data
  async initializeDemoData(): Promise<void> {
    const existingUsers = this.getUsers()
    if (existingUsers.length > 0) return // Already initialized
    
    // Create demo parent
    const demoParent = await this.createUser({
      name: 'Sarah Johnson',
      email: 'parent@demo.com',
      password: 'demo123'
    })
    
    // Create demo children
    await this.createChild({
      parentId: demoParent.id,
      name: 'Emma',
      age: 8,
      avatar: '👧',
      progress: {
        overallProgress: 85,
        lettersMastered: 26,
        numbersCompleted: 10,
        gamesPlayed: 12,
        assessmentScores: [
          {
            id: this.generateId(),
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            score: 75,
            totalQuestions: 10,
            correctAnswers: 8,
            timeSpent: 15,
            category: 'general'
          }
        ],
        lastActivity: new Date().toISOString(),
        totalPlayTime: 240, // 4 hours
        streakDays: 7,
        completedModules: ['phonics-basics', 'writing-skills'],
        currentLevel: 3
      }
    })
    
    await this.createChild({
      parentId: demoParent.id,
      name: 'Alex',
      age: 6,
      avatar: '👦',
      progress: {
        overallProgress: 65,
        lettersMastered: 18,
        numbersCompleted: 8,
        gamesPlayed: 8,
        assessmentScores: [
          {
            id: this.generateId(),
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            score: 60,
            totalQuestions: 10,
            correctAnswers: 6,
            timeSpent: 12,
            category: 'general'
          }
        ],
        lastActivity: new Date().toISOString(),
        totalPlayTime: 180, // 3 hours
        streakDays: 3,
        completedModules: ['phonics-basics'],
        currentLevel: 2
      }
    })
  }
}

export const db = new DatabaseService()

// Initialize demo data on first load
if (typeof window !== 'undefined') {
  db.initializeDemoData()
}