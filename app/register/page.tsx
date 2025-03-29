'use client'

import React, { useState } from 'react'
import { signUp } from '../lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signUp(email, password, username)
      if (error) throw error
      
      // Redirect to village page after successful registration
      window.location.href = '/village'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 }
  }

  // Village elements animation
  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: { 
        repeat: Infinity, 
        duration: 3,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100"></div>
        <Image
          src="/village-items/decor/greenery_7.png"
          alt="Background Greenery"
          fill
          className="object-cover opacity-10"
        />
        
        {/* Village elements */}
        <motion.div 
          className="absolute top-12 left-16"
          animate={{ y: [0, -7, 0], rotate: [0, 2, 0] }} 
          transition={{ repeat: Infinity, duration: 7.5 }}
        >
          <Image 
            src="/village-items/houses/11.png" 
            alt="House" 
            width={170} 
            height={170} 
            className="opacity-25"
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-20 left-10"
          animate={{ y: [0, -5, 0], rotate: [0, -1, 0] }} 
          transition={{ repeat: Infinity, duration: 6, delay: 0.3 }}
        >
          <Image 
            src="/village-items/decor/tree_9.png" 
            alt="Tree" 
            width={120} 
            height={120}
            className="opacity-30"
          />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/4 right-20"
          animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }} 
          transition={{ repeat: Infinity, duration: 8, delay: 1 }}
        >
          <Image 
            src="/village-items/houses/18.png" 
            alt="Large House" 
            width={200} 
            height={200}
            className="opacity-25"
          />
        </motion.div>
        
        <motion.div 
          className="absolute top-40 left-1/3"
          animate={{ y: [0, -4, 0] }} 
          transition={{ repeat: Infinity, duration: 5, delay: 0.7 }}
        >
          <Image 
            src="/village-items/decor/decor_7.png" 
            alt="Decoration" 
            width={60} 
            height={60}
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-16 right-40"
          animate={{ y: [0, -6, 0], rotate: [0, 1, 0] }} 
          transition={{ repeat: Infinity, duration: 6, delay: 1.5 }}
        >
          <Image 
            src="/village-items/tents/5.png" 
            alt="Tent" 
            width={120} 
            height={120}
            className="opacity-35"
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 right-10"
          animate={{ y: [0, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 7, delay: 2 }}
        >
          <Image 
            src="/village-items/decor/tree_13.png" 
            alt="Tree" 
            width={100} 
            height={100}
            className="opacity-30"
          />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 right-1/4"
          animate={{ y: [0, -4, 0], rotate: [0, 2, 0] }} 
          transition={{ repeat: Infinity, duration: 5, delay: 1 }}
        >
          <Image 
            src="/village-items/decor/stones_6.png" 
            alt="Stones" 
            width={70} 
            height={70}
            className="opacity-40"
          />
        </motion.div>
      </div>
      
      {/* Main content */}
      <motion.div 
        className="max-w-md w-full z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-purple-100"
        >
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
              Join JolliVille
            </h2>
            <p className="text-gray-600">Create your account to start your adventure</p>
          </motion.div>
          
          {/* Village preview */}
          <div className="flex justify-center mb-8 relative h-24">
            <motion.div 
              className="absolute left-1/2 transform -translate-x-1/2"
              variants={floatVariants}
              animate="float"
            >
              <Image 
                src="/village-items/houses/3.png" 
                alt="Your future home" 
                width={100} 
                height={100}
              />
            </motion.div>
            <motion.div 
              className="absolute left-1/3 bottom-0"
              animate={{ y: [0, -4, 0], rotate: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
            >
              <Image 
                src="/village-items/decor/tree_5.png" 
                alt="Tree" 
                width={40} 
                height={40}
              />
            </motion.div>
            <motion.div 
              className="absolute right-1/3 bottom-0"
              animate={{ y: [0, -3, 0], rotate: [0, -1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
            >
              <Image 
                src="/village-items/decor/greenery_3.png" 
                alt="Bush" 
                width={35} 
                height={35}
              />
            </motion.div>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-purple-200 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-purple-200 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-purple-200 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            {error && (
              <motion.div 
                variants={itemVariants}
                className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : 'Join Village'}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already a villager?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
} 