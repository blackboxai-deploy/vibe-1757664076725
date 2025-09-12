'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ChildSelector() {
  const { currentParent, selectedChild, selectChild } = useAuth()

  if (!currentParent || currentParent.children.length === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 text-white">
      <span className="text-sm font-medium hidden md:inline">Learning with:</span>
      <Select
        value={selectedChild?.id || ''}
        onValueChange={selectChild}
      >
        <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30">
          <SelectValue placeholder="Select child">
            {selectedChild && (
              <div className="flex items-center space-x-2">
                <span>{selectedChild.avatar}</span>
                <span>{selectedChild.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currentParent.children.map((child) => (
            <SelectItem key={child.id} value={child.id}>
              <div className="flex items-center space-x-2">
                <span>{child.avatar}</span>
                <span>{child.name}</span>
                <span className="text-xs text-gray-500">Age {child.age}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}