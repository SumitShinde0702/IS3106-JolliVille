'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiPause, FiPlay, FiVolume2, FiVolumeX } from 'react-icons/fi'
import BackArrow from '../components/BackArrow'

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
  const [showActivityContent, setShowActivityContent] = useState(false)
  const [meditationDuration, setMeditationDuration] = useState(7)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Function to format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Start/pause meditation audio and timer
  const toggleMeditation = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Toggle mute state
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle time update for accurate progress tracking
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      // Calculate progress percentage
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
    }
  }

  // Handle audio seeking when user interacts with progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
      setProgress((seekTime / audioRef.current.duration) * 100)
    }
  }

  // Handle when audio is loaded to get accurate duration
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Reset meditation when duration changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      // Set src based on selected duration
      audioRef.current.src = `/meditation/${meditationDuration}minutes.mp3`
      setIsPlaying(false)
      setCurrentTime(0)
      setProgress(0)
    }
  }, [meditationDuration])

  // Set initial duration on first render
  useEffect(() => {
    // Create a temporary audio element to get the duration
    const tempAudio = new Audio(`/meditation/${meditationDuration}minutes.mp3`);
    
    tempAudio.addEventListener('loadedmetadata', () => {
      setDuration(tempAudio.duration);
    });
    
    // Handle potential errors
    tempAudio.addEventListener('error', () => {
      console.warn('Could not load initial audio duration');
      // Set a reasonable default based on the meditation duration
      setDuration(meditationDuration * 60);
    });
    
    return () => {
      tempAudio.pause();
      tempAudio.src = '';
    };
  }, []);

  // Meditation guide text based on duration
  const getMeditationGuide = () => {
    if (meditationDuration >= 30) {
      return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
          <p className="text-lg italic text-indigo-800 mb-3">
            {`This ${meditationDuration}-minute meditation is designed for experienced meditators. You will hear gentle bells at 5-minute intervals to help you maintain awareness of time without distraction.`}
          </p>
          <p className="text-md text-indigo-700">
            Find a comfortable seated position. Set your intention for the practice, and allow the bells to gently guide your awareness throughout the session.
          </p>
        </div>
      )
    }
    
    // Different guidance for each meditation duration
    switch(meditationDuration) {
      case 7:
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
            <h4 className="text-xl font-medium mb-2">Breath Awareness</h4>
            <p className="text-lg italic text-indigo-800">
              "Find a comfortable seated position and close your eyes. Bring your attention to your breath—notice the natural rhythm of your inhalations and exhalations. Feel the air flowing in through your nostrils, filling your lungs, and then flowing back out. Whenever your mind wanders, gently guide it back to the breath."
            </p>
          </div>
        )
      
      case 15:
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
            <h4 className="text-xl font-medium mb-2">Body Scan</h4>
            <p className="text-lg italic text-indigo-800">
              "Lie down or sit comfortably and close your eyes. Bring awareness to your body, starting from the top of your head and slowly moving down to your toes. Notice any sensations, tension, or relaxation in each area. Allow each part of your body to soften as your attention moves through it, releasing tension with each breath."
            </p>
          </div>
        )
      
      case 19:
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
            <h4 className="text-xl font-medium mb-2">Full Awareness Practice</h4>
            <p className="text-lg italic text-indigo-800">
              "Begin in a comfortable position with eyes closed. This comprehensive practice will guide you through five dimensions of awareness: first focusing on your breath, then expanding to notice sounds around you, sensations in your body, any thoughts arising in your mind, and finally the emotions present in this moment. This practice cultivates a spacious, non-judgmental awareness of your entire experience."
            </p>
          </div>
        )
      
      case 21:
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
            <h4 className="text-xl font-medium mb-2">Seated Meditation</h4>
            <p className="text-lg italic text-indigo-800">
              "Find a comfortable seated position with your spine tall yet relaxed. Rest your hands on your knees or in your lap. Allow your eyes to close gently. This traditional meditation guides you to develop concentration and mindfulness by anchoring awareness on your breath while cultivating an attitude of equanimity toward whatever arises in your experience."
            </p>
          </div>
        )
      
      default:
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
            <p className="text-lg italic text-indigo-800">
              "Find a comfortable position. Close your eyes. Take a deep breath in... and out. Notice the weight of your body. Feel yourself becoming more present with each breath."
            </p>
          </div>
        )
    }
  }

  const activities = [
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: 'Simple breathing techniques to help you relax and focus',
      duration: '5 min',
      icon: '🫁',
      color: 'from-blue-500 to-cyan-500',
      content: (
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-6">Deep Breathing Exercise</h3>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl text-blue-800">Breathe</span>
            </div>
          </div>
          <p className="text-lg mb-4">Inhale deeply through your nose for 4 seconds</p>
          <p className="text-lg mb-4">Hold your breath for 4 seconds</p>
          <p className="text-lg mb-4">Exhale slowly through your mouth for 6 seconds</p>
          <p className="text-lg mb-6">Repeat this cycle 5 times</p>
        </div>
      )
    },
    {
      id: 'meditation',
      title: 'Guided Meditation',
      description: 'Calming meditation session for inner peace',
      duration: 'Various',
      icon: '🧘‍♀️',
      color: 'from-purple-500 to-indigo-500',
      content: (
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-6">Guided Meditation</h3>
          
          {/* Duration Selection */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-3">Select Duration</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {[7, 15, 19, 21, 30, 45].map(duration => (
                <button
                  key={duration}
                  onClick={() => setMeditationDuration(duration)}
                  className={`px-3 py-2 rounded-full text-sm transition-colors ${
                    meditationDuration === duration
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>
          
          {/* Meditation Guidance */}
          {getMeditationGuide()}
          
          {/* Audio Player */}
          <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-4 mb-6">
            <audio 
              ref={audioRef} 
              src={`/meditation/${meditationDuration}minutes.mp3`}
              loop={false}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="mb-3 flex justify-between items-center">
              <button 
                onClick={toggleMeditation}
                className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
              >
                {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
            </div>
            
            {/* Scrollable progress bar */}
            <div className="mb-1">
              <input
                type="range"
                min="0"
                max={duration || meditationDuration * 60}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-purple-100 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                }}
              />
            </div>
            
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || meditationDuration * 60)}</span>
            </div>
          </div>
          
          {/* Ambient Background */}
          <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-br from-indigo-900/20 to-purple-900/20 opacity-0 transition-opacity duration-500"
            style={{ opacity: isPlaying ? 0.8 : 0 }}
          ></div>
        </div>
      )
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness Practice',
      description: 'Stay present and aware with mindfulness exercises',
      duration: '7 min',
      icon: '🎯',
      color: 'from-pink-500 to-rose-500',
      content: (
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-6">Mindfulness Exercise</h3>
          <div className="bg-pink-100 p-6 rounded-xl mb-6">
            <h4 className="text-xl font-medium mb-4">The 5-4-3-2-1 Technique</h4>
            <ul className="space-y-4 text-left">
              <li><span className="font-medium">5:</span> Notice FIVE things you can see around you</li>
              <li><span className="font-medium">4:</span> Notice FOUR things you can touch or feel</li>
              <li><span className="font-medium">3:</span> Notice THREE things you can hear</li>
              <li><span className="font-medium">2:</span> Notice TWO things you can smell</li>
              <li><span className="font-medium">1:</span> Notice ONE thing you can taste</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'gratitude',
      title: 'Gratitude Journal',
      description: 'Practice gratitude by writing down what you\'re thankful for',
      duration: '5 min',
      icon: '🙏',
      color: 'from-amber-500 to-orange-500',
      content: null // This will navigate to the journal page instead
    }
  ]

  const handleActivityClick = (id: string) => {
    setSelectedActivity(id)
    
    // For gratitude journal, navigate to the journal page
    if (id === 'gratitude') {
      router.push('/journal')
    } else {
      // For other activities, show content
      setShowActivityContent(true)
    }
  }

  // Handle going back from activity content
  const handleBackClick = () => {
    // If there's audio playing, pause it
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    // Go back to activity list
    setShowActivityContent(false);
  }

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

        {!showActivityContent ? (
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleActivityClick(activity.id)}
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
                        className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {activity.id === 'gratitude' ? 'Open Journal' : 'Start'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Back Arrow - Only visible in activity view */}
            <BackArrow 
              onClick={handleBackClick} 
              className="absolute top-4 left-4 z-10"
            />
            
            {selectedActivity && activities.find(a => a.id === selectedActivity)?.content}
            
            {/* Back Button for Activity Content */}
            <div className="mt-8 flex justify-center">
              <motion.button
                onClick={handleBackClick}
                className="flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
                Back to Activities
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Daily Challenge */}
        <motion.div 
          className="mt-12 max-w-4xl mx-auto"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 shadow-lg">
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

      <style jsx global>{`
        .text-gradient {
          background: linear-gradient(to right, #ec4899, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-primary {
          background: linear-gradient(to right, #ec4899, #8b5cf6);
          color: white;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  )
} 