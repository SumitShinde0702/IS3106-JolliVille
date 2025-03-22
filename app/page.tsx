'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Welcome to JolliVille
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Your personal space for emotional wellness and growth
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              href="/journal"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Your Journey
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <FeatureCard
            title="Daily Journal"
            description="Express your thoughts and feelings in a safe, private space. Track your emotional journey and earn rewards for consistency."
            icon="📝"
            gradient="from-purple-500 to-indigo-500"
          />
          <FeatureCard
            title="Virtual Avatar"
            description="Create and customize your unique character and personal space. Unlock new items and decorations as you progress."
            icon="🎮"
            gradient="from-pink-500 to-rose-500"
          />
          <FeatureCard
            title="Wellness Activities"
            description="Discover guided meditation, mindfulness exercises, and relaxation techniques tailored to your needs."
            icon="🧘‍♀️"
            gradient="from-blue-500 to-cyan-500"
          />
        </motion.div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon, gradient }: {
  title: string
  description: string
  icon: string
  gradient: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-200"
    >
      <div className={`text-5xl mb-6 bg-gradient-to-r ${gradient} w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
} 