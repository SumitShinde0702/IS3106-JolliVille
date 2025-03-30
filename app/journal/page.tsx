'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MicrophoneIcon } from '@heroicons/react/24/solid'

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

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [mood, setMood] = useState('happy')
  const [isRecording, setIsRecording] = useState(false)

  // Set up the SpeechRecognition API if it's available in the browser
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: { resultIndex: any; results: string | any[] }) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setEntry(transcript); // Update the text area with the transcribed text
    };

    recognition.onerror = (event: { error: any }) => {
      console.error("Speech recognition error", event.error);
    };

    // Store the recognition instance globally so we can access it in the handler
    window.recognition = recognition;
  }, []);

  // Start recording when the user clicks the button
  const handleRecordButtonClick = () => {
    const recognition = window.recognition;
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement journal entry submission
    console.log({ entry, mood })
  }

  const moods = [
    { emoji: '😊', value: 'happy', label: 'Happy' },
    { emoji: '😢', value: 'sad', label: 'Sad' },
    { emoji: '😌', value: 'calm', label: 'Calm' },
    { emoji: '😤', value: 'angry', label: 'Angry' },
    { emoji: '😰', value: 'anxious', label: 'Anxious' }
  ]

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
          Daily Journal
        </motion.h1>

        <motion.div 
          className="grid md:grid-cols-5 gap-8"
          variants={containerVariants}
        >
          {/* Journal Entry Form */}
          <motion.div 
            className="md:col-span-3"
            variants={itemVariants}
          >
            <form onSubmit={handleSubmit} className="card">
              <h2 className="text-2xl font-semibold mb-6">How are you feeling today?</h2>
              
              <div className="flex gap-4 mb-6">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`p-4 rounded-lg flex flex-col items-center ${
                      mood === m.value 
                        ? 'bg-purple-100 ring-2 ring-purple-500' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className="text-sm">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Textarea with Record Button */}
              <div className="relative">
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="w-full h-48 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />

                {/* Record Button */}
                <button
                  onClick={handleRecordButtonClick}
                  className="absolute top-2 right-2 p-2 bg-purple-500 text-white rounded-full focus:outline-none hover:bg-purple-600"
                >
                  <MicrophoneIcon className="h-6 w-6" />
                </button>
              </div>

              <button 
                type="submit"
                className="btn-primary mt-4 w-full justify-center"
              >
                Save Entry
              </button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="md:col-span-2"
            variants={itemVariants}
          >
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Current Streak</h3>
                  <p className="text-3xl font-bold text-purple-600">7 Days 🔥</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Points Earned</h3>
                  <p className="text-3xl font-bold text-pink-600">350 ⭐</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Total Entries</h3>
                  <p className="text-3xl font-bold text-blue-600">42 📝</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
} 