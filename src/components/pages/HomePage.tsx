'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import Dashboard from '@/components/sections/Dashboard'
import Assessment from '@/components/sections/Assessment'
import Learning from '@/components/sections/Learning'
import Modules from '@/components/sections/Modules'
import Games from '@/components/sections/Games'
import Reports from '@/components/sections/Reports'
import ParentDashboard from '@/components/sections/ParentDashboard'
import AddChildModal from '@/components/modals/AddChildModal'

export type ActiveSection = 'dashboard' | 'assessment' | 'learning' | 'modules' | 'games' | 'reports' | 'parent'

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard')
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false)
  const { selectedChild, currentParent } = useAuth()

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'assessment':
        return <Assessment />
      case 'learning':
        return <Learning />
      case 'modules':
        return <Modules />
      case 'games':
        return <Games />
      case 'reports':
        return <Reports />
      case 'parent':
        return <ParentDashboard onAddChild={() => setIsAddChildModalOpen(true)} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onAddChild={() => setIsAddChildModalOpen(true)} />
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedChild && currentParent?.children.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👶</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Add Your First Child
                </h2>
                <p className="text-gray-600 mb-8">
                  Get started by adding your child's profile to begin tracking their learning progress.
                </p>
                <button
                  onClick={() => setIsAddChildModalOpen(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add Child Profile
                </button>
              </div>
            </div>
          ) : (
            renderSection()
          )}
        </div>
      </main>

      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
      />
    </div>
  )
}