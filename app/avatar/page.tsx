'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
}

export default function AvatarPage() {
  const [activeTab, setActiveTab] = useState<'avatar' | 'room'>('avatar')
  const [selectedCategory, setSelectedCategory] = useState('hair')

  const categories = {
    avatar: [
      { id: 'hair', label: 'Hair', icon: '💇‍♀️' },
      { id: 'face', label: 'Face', icon: '😊' },
      { id: 'clothes', label: 'Clothes', icon: '👕' },
      { id: 'accessories', label: 'Accessories', icon: '👑' }
    ],
    room: [
      { id: 'furniture', label: 'Furniture', icon: '🛋️' },
      { id: 'walls', label: 'Walls', icon: '🎨' },
      { id: 'floor', label: 'Floor', icon: '🔲' },
      { id: 'decor', label: 'Decor', icon: '🎭' }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div 
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-4xl font-bold mb-8 text-gradient"
          variants={itemVariants}
        >
          Customize Your Space
        </motion.h1>

        {/* Tab Switcher */}
        <motion.div 
          className="flex gap-4 mb-8"
          variants={itemVariants}
        >
          <button
            onClick={() => setActiveTab('avatar')}
            className={`px-6 py-3 rounded-full font-medium ${
              activeTab === 'avatar'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Avatar
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`px-6 py-3 rounded-full font-medium ${
              activeTab === 'room'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Room
          </button>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {/* Preview Area */}
          <motion.div 
            className="md:col-span-2"
            variants={itemVariants}
          >
            <div className="card aspect-video flex items-center justify-center">
              <p className="text-2xl text-gray-400">Preview Area</p>
            </div>
          </motion.div>

          {/* Customization Options */}
          <motion.div 
            className="md:col-span-1"
            variants={itemVariants}
          >
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">Customize</h2>
              
              {/* Categories */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {categories[activeTab].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-lg flex flex-col items-center ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 ring-2 ring-purple-500'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{category.icon}</span>
                    <span className="text-sm">{category.label}</span>
                  </button>
                ))}
              </div>

              {/* Points Display */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Available Points</h3>
                <p className="text-3xl font-bold text-gradient">350 ⭐</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
} 