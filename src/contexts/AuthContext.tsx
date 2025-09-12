'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { db, Child, User, SessionRecord } from '@/lib/database'

// Re-export types for convenience
export type { Child, User, SessionRecord }

interface Parent extends User {
  children: Child[]
}

interface AuthContextType {
  isAuthenticated: boolean
  currentParent: Parent | null
  selectedChild: Child | null
  currentSession: SessionRecord | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addChild: (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt' | 'sessionHistory' | 'achievements' | 'parentId'>) => Promise<void>
  selectChild: (childId: string) => void
  updateChildProgress: (childId: string, progress: Partial<Child['progress']>) => Promise<void>
  startSession: (activity: string) => Promise<string | null>
  endSession: (score?: number, details?: Record<string, any>) => Promise<void>
  refreshChildren: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentParent, setCurrentParent] = useState<Parent | null>(null)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [currentSession, setCurrentSession] = useState<SessionRecord | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      const savedAuth = localStorage.getItem('dyslexia-auth')
      if (savedAuth) {
        const { parentId, childId } = JSON.parse(savedAuth)
        
        // Try to find parent in database
        const users = JSON.parse(localStorage.getItem('dyslexia_users') || '[]')
        const user = users.find((u: User) => u.id === parentId)
        
        if (user) {
          const children = await db.getChildrenByParent(user.id)
          const parent: Parent = { ...user, children }
          
          setCurrentParent(parent)
          setIsAuthenticated(true)
          
          if (childId) {
            const child = children.find(c => c.id === childId)
            if (child) {
              setSelectedChild(child)
            }
          } else if (children.length > 0) {
            setSelectedChild(children[0])
          }
        }
      }
    }
    
    loadAuthState()
  }, [])

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && currentParent) {
      localStorage.setItem('dyslexia-auth', JSON.stringify({
        parentId: currentParent.id,
        childId: selectedChild?.id
      }))
    }
  }, [isAuthenticated, currentParent, selectedChild])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await db.authenticateUser(email, password)
      if (user) {
        const children = await db.getChildrenByParent(user.id)
        const parent: Parent = { ...user, children }
        
        setCurrentParent(parent)
        setIsAuthenticated(true)
        
        if (children.length > 0) {
          setSelectedChild(children[0])
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    // End current session if exists
    if (currentSession) {
      await endSession()
    }
    
    setIsAuthenticated(false)
    setCurrentParent(null)
    setSelectedChild(null)
    setCurrentSession(null)
    localStorage.removeItem('dyslexia-auth')
  }

  const addChild = async (childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt' | 'sessionHistory' | 'achievements' | 'parentId'>) => {
    if (!currentParent) return
    
    try {
      const newChild = await db.createChild({
        ...childData,
        parentId: currentParent.id,
        progress: {
          overallProgress: 0,
          lettersMastered: 0,
          numbersCompleted: 0,
          gamesPlayed: 0,
          assessmentScores: [],
          lastActivity: new Date().toISOString(),
          totalPlayTime: 0,
          streakDays: 0,
          completedModules: [],
          currentLevel: 1
        }
      })
      
      // Refresh children list
      await refreshChildren()
    } catch (error) {
      console.error('Error adding child:', error)
    }
  }

  const selectChild = (childId: string) => {
    if (!currentParent) return
    const child = currentParent.children.find(c => c.id === childId)
    if (child) {
      setSelectedChild(child)
    }
  }

  const updateChildProgress = async (childId: string, progressUpdate: Partial<Child['progress']>) => {
    try {
      const updatedChild = await db.updateChildProgress(childId, progressUpdate)
      if (updatedChild) {
        // Refresh children to get updated data
        await refreshChildren()
        
        // Update selected child if it's the one being updated
        if (selectedChild?.id === childId) {
          setSelectedChild(updatedChild)
        }
      }
    } catch (error) {
      console.error('Error updating child progress:', error)
    }
  }

  const startSession = async (activity: string): Promise<string | null> => {
    if (!selectedChild) return null
    
    try {
      const sessionId = await db.startSession(selectedChild.id, activity)
      // Note: We don't store the full session object as it's not needed for UI
      return sessionId
    } catch (error) {
      console.error('Error starting session:', error)
      return null
    }
  }

  const endSession = async (score?: number, details?: Record<string, any>) => {
    if (!currentSession) return
    
    try {
      await db.endSession(currentSession.id, score, details)
      setCurrentSession(null)
      
      // Refresh child data to get updated play time
      if (selectedChild) {
        await refreshChildren()
      }
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const refreshChildren = async () => {
    if (!currentParent) return
    
    try {
      const children = await db.getChildrenByParent(currentParent.id)
      const updatedParent: Parent = { ...currentParent, children }
      setCurrentParent(updatedParent)
      
      // Update selected child if it exists in the refreshed list
      if (selectedChild) {
        const updatedSelectedChild = children.find(c => c.id === selectedChild.id)
        if (updatedSelectedChild) {
          setSelectedChild(updatedSelectedChild)
        }
      }
    } catch (error) {
      console.error('Error refreshing children:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentParent,
      selectedChild,
      currentSession,
      login,
      logout,
      addChild,
      selectChild,
      updateChildProgress,
      startSession,
      endSession,
      refreshChildren
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}