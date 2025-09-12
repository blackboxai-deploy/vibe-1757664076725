'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
}

const avatarOptions = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩', '🙂', '😊', '🌟']

export default function AddChildModal({ isOpen, onClose }: AddChildModalProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('👧')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const { addChild } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) {
      setError('Please enter a name')
      return
    }
    
    const ageNum = parseInt(age)
    if (!age || ageNum < 3 || ageNum > 18) {
      setError('Please enter a valid age between 3 and 18')
      return
    }

    setIsSubmitting(true)
    
    try {
       await addChild({
        name: name.trim(),
        age: ageNum,
        avatar: selectedAvatar,
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
      
      // Reset form
      setName('')
      setAge('')
      setSelectedAvatar('👧')
      onClose()
    } catch (err) {
      setError('Failed to add child. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setName('')
      setAge('')
      setSelectedAvatar('👧')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add Child Profile
          </DialogTitle>
          <DialogDescription>
            Create a new learning profile for your child to track their progress.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Choose an Avatar
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all text-xl ${
                    selectedAvatar === avatar
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="childName" className="text-sm font-medium text-gray-700">
              Child's Name
            </Label>
            <Input
              id="childName"
              type="text"
              placeholder="Enter child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              disabled={isSubmitting}
              maxLength={50}
            />
          </div>

          {/* Age Selection */}
          <div className="space-y-2">
            <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
              Age
            </Label>
            <Select value={age} onValueChange={setAge} disabled={isSubmitting}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 16 }, (_, i) => i + 3).map((ageOption) => (
                  <SelectItem key={ageOption} value={ageOption.toString()}>
                    {ageOption} years old
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Preview */}
          {name && age && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Preview:</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-blue-200 flex items-center justify-center text-lg">
                  {selectedAvatar}
                </div>
                <div>
                  <div className="font-semibold text-blue-900">{name}</div>
                  <div className="text-sm text-blue-600">{age} years old</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !age}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Child'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}