'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { resetPassword } from '../lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await resetPassword(email)
      
      if (error) {
        throw new Error(error)
      }
      
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
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

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100"></div>
        <Image
          src="/village-items/decor/greenery_11.png"
          alt="Background Greenery"
          fill
          className="object-cover opacity-10"
        />
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-20 left-20"
          animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }} 
          transition={{ repeat: Infinity, duration: 8 }}
        >
          <Image 
            src="/village-items/houses/21.png" 
            alt="Village House" 
            width={150} 
            height={150} 
            className="opacity-25"
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-20 left-40"
          animate={{ y: [0, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 6, delay: 1.2 }}
        >
          <Image 
            src="/village-items/decor/tree_2.png" 
            alt="Tree" 
            width={100} 
            height={100}
            className="opacity-30"
          />
        </motion.div>
        
        <motion.div 
          className="absolute top-32 right-20"
          animate={{ y: [0, -7, 0], rotate: [0, -1, 0] }} 
          transition={{ repeat: Infinity, duration: 7, delay: 0.5 }}
        >
          <Image 
            src="/village-items/tents/6.png" 
            alt="Tent" 
            width={120} 
            height={120}
            className="opacity-30"
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 right-32"
          animate={{ y: [0, -4, 0], rotate: [0, 1, 0] }} 
          transition={{ repeat: Infinity, duration: 5, delay: 0.8 }}
        >
          <Image 
            src="/village-items/decor/decor_15.png" 
            alt="Decoration" 
            width={80} 
            height={80}
            className="opacity-40"
          />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 left-1/3"
          animate={{ opacity: [0.3, 0.5, 0.3] }} 
          transition={{ repeat: Infinity, duration: 8 }}
        >
          <Image 
            src="/village-items/decor/stones_2.png" 
            alt="Stones" 
            width={60} 
            height={60}
            className="opacity-30"
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
          {!isSubmitted ? (
            <>
              <motion.div variants={itemVariants} className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                  Recover Your Password
                </h2>
                <p className="text-gray-600">Enter your email to receive a password reset link</p>
              </motion.div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-purple-200 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                    placeholder="Your registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                        Sending...
                      </div>
                    ) : 'Send Recovery Link'}
                  </motion.button>
                </motion.div>
              </form>
            </>
          ) : (
            <motion.div 
              variants={itemVariants} 
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-6">
                We've sent a password recovery link to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                If you don't see the email, please check your spam folder
              </p>
              <motion.div
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <Link href="/login" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Return to Login
                </Link>
              </motion.div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                Back to Login
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
} 