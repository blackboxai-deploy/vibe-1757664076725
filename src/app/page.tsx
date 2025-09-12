'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginPage from '@/components/auth/LoginPage'
import HomePage from '@/components/pages/HomePage'

export default function Page() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <HomePage />
}