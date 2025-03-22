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

export default function WellnessPage() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const activities = [
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: 'Simple breathing techniques to help you relax and focus',
      duration: '5 min',
      icon: '🫁',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'meditation',
      title: 'Guided Meditation',
      description: 'Calming meditation session for inner peace',
      duration: '10 min',
      icon: '🧘‍♀️',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness Practice',
      description: 'Stay present and aware with mindfulness exercises',
      duration: '7 min',
      icon: '🎯',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'gratitude',
      title: 'Gratitude Journal',
      description: 'Practice gratitude by writing down what you\'re thankful for',
      duration: '5 min',
      icon: '🙏',
      color: 'from-amber-500 to-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <motion.div 
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Wellness Activities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take a moment to focus on your mental well-being with these guided activities
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          variants={containerVariants}
        >
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="card hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedActivity(activity.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${activity.color} flex items-center justify-center text-3xl text-white shadow-lg`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                  <p className="text-gray-600 mb-4">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Duration: {activity.duration}
                    </span>
                    <button 
                      className="btn-primary py-2 px-4"
                      onClick={() => setSelectedActivity(activity.id)}
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Daily Challenge */}
        <motion.div 
          className="mt-12 max-w-4xl mx-auto"
          variants={itemVariants}
        >
          <div className="card bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Daily Challenge</h2>
                <p className="text-purple-100">Complete 3 activities today to earn bonus points!</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">1/3</div>
                <div className="text-sm text-purple-100">Activities Done</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 