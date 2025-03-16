'use client'

import React from 'react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Journal', href: '/journal' },
  { name: 'Avatar', href: '/avatar' },
  { name: 'Wellness', href: '/wellness' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="en">
      <head>
        <title>JolliVille - Your Emotional Wellness Journey</title>
        <meta name="description" content="A gamified journaling and wellness platform for young adults" />
      </head>
      <body className={inter.className}>
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link 
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                JolliVille
              </Link>
              <div className="flex space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-600">
                  350 ⭐
                </div>
                <button className="btn-primary py-2">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 