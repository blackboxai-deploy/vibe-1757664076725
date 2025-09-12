'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ChildSelector from '@/components/ui/ChildSelector'

interface HeaderProps {
  onAddChild: () => void
}

export default function Header({ onAddChild }: HeaderProps) {
  const { currentParent, selectedChild, logout } = useAuth()

  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-blue-600">DE</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DyslexiaEdu Pro</h1>
            </div>
          </div>

          {/* Child Selector and User Menu */}
          <div className="flex items-center space-x-4">
            
            {/* Child Selector */}
            {currentParent && currentParent.children.length > 0 && (
              <ChildSelector />
            )}

            {/* Add Child Button */}
            <Button
              onClick={onAddChild}
              variant="ghost"
              className="text-white hover:bg-white/20 hidden sm:inline-flex"
            >
              Add Child
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarFallback className="bg-white text-blue-600 font-semibold">
                      {currentParent?.name.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentParent?.name || 'Parent'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentParent?.email}
                    </p>
                    {selectedChild && (
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="text-lg">{selectedChild.avatar}</span>
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            Active Child: {selectedChild.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Age: {selectedChild.age} years
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={onAddChild} className="sm:hidden">
                  Add Child
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  Help & Support
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}