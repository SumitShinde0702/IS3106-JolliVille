'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

export default function Navigation() {
  const { user, loading, signOut } = useAuth()

  // Don't render anything while loading
  if (loading) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-pink-600">
            JolliVille
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 hover:text-pink-600 transition-colors">Home</Link>
            {user ? (
              <>
                <Link href="/village" className="px-3 py-2 hover:text-pink-600 transition-colors">Village</Link>
                <Link href="/journal" className="px-3 py-2 hover:text-pink-600 transition-colors">Journal</Link>
                <Link href="/wellness" className="px-3 py-2 hover:text-pink-600 transition-colors">Wellness</Link>
                <Link href="/avatar" className="px-3 py-2 hover:text-pink-600 transition-colors">Avatar</Link>
                <Link href="/profile" className="px-3 py-2 hover:text-pink-600 transition-colors">Profile</Link>
                <button
                  onClick={signOut}
                  className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 hover:text-pink-600 transition-colors">Login</Link>
                <Link href="/register" className="px-3 py-2 hover:text-pink-600 transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 