'use client'

import { ActiveSection } from '@/components/pages/HomePage'

interface NavigationProps {
  activeSection: ActiveSection
  onSectionChange: (section: ActiveSection) => void
}

const navigationItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
  { id: 'assessment' as const, label: 'Assessment', icon: '📝' },
  { id: 'learning' as const, label: 'Learning', icon: '📚' },
  { id: 'modules' as const, label: 'Modules', icon: '🎓' },
  { id: 'games' as const, label: 'Games', icon: '🎮' },
  { id: 'reports' as const, label: 'Reports', icon: '📈' },
  { id: 'parent' as const, label: 'Parent View', icon: '👨‍👩‍👧‍👦' },
]

export default function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                transition-all duration-200 border-b-3 min-w-fit
                ${activeSection === item.id
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  )
}