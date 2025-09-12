import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'DyslexiaEdu Pro - Professional Learning Platform',
  description: 'Professional learning platform for children with dyslexia, designed for parents to track progress and support their child\'s educational journey.',
  keywords: 'dyslexia, education, learning, children, parents, reading, assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}