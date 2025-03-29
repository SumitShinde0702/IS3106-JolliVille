import type { Metadata } from 'next'
import React, { useState } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import { AuthProvider } from './context/AuthContext'
import './styles/animations.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JolliVille',
  description: 'Your personal wellness village',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased vsc-initialized`}>
        <AuthProvider>
          {/* 
            In a Supabase implementation, we would add a listener here:
            
            useEffect(() => {
              const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                  if (event === "PASSWORD_RECOVERY") {
                    // Redirect to reset password page
                    router.push('/reset-password');
                  }
                }
              )
              return () => subscription.unsubscribe()
            }, [router]);
          */}
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
} 