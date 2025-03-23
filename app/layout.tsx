import type { Metadata } from 'next'
import React, { useState } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import { AuthProvider } from './context/AuthContext'

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
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
} 