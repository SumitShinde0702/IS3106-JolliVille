import React, { useEffect, useState, useRef } from 'react'

interface WeatherProps {
  gridSize: number
  onWeatherChange: (weather: 'sunny' | 'rainy' | 'windy' | 'nothing') => void
}

export default function Weather({ gridSize, onWeatherChange }: WeatherProps) {
  const [currentWeather, setCurrentWeather] = useState<'sunny' | 'rainy' | 'windy' | 'nothing'>('sunny')
  const [isManualMode, setIsManualMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Audio refs
  const rainAudioRef = useRef<HTMLAudioElement | null>(null)
  const windAudioRef = useRef<HTMLAudioElement | null>(null)
  const birdsAudioRef = useRef<HTMLAudioElement | null>(null)

  // Handle weather change and sound effects
  const handleWeatherChange = (weather: 'sunny' | 'rainy' | 'windy' | 'nothing') => {
    // Stop all sounds first
    if (rainAudioRef.current) rainAudioRef.current.pause()
    if (windAudioRef.current) windAudioRef.current.pause()
    if (birdsAudioRef.current) birdsAudioRef.current.pause()

    // Start new weather sound if not muted
    if (!isMuted) {
      switch (weather) {
        case 'rainy':
          if (rainAudioRef.current) {
            rainAudioRef.current.loop = true
            rainAudioRef.current.volume = 0.3
            rainAudioRef.current.play()
          }
          break
        case 'windy':
          if (windAudioRef.current) {
            windAudioRef.current.loop = true
            windAudioRef.current.volume = 0.2
            windAudioRef.current.play()
          }
          break
        case 'sunny':
          if (birdsAudioRef.current) {
            birdsAudioRef.current.loop = true
            birdsAudioRef.current.volume = 0.2
            birdsAudioRef.current.play()
          }
          break
      }
    }

    setCurrentWeather(weather)
    onWeatherChange(weather)
  }

  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      // Stop all sounds when muting
      if (rainAudioRef.current) rainAudioRef.current.pause()
      if (windAudioRef.current) windAudioRef.current.pause()
      if (birdsAudioRef.current) birdsAudioRef.current.pause()
    } else {
      // Resume current weather sound when unmuting
      switch (currentWeather) {
        case 'rainy':
          if (rainAudioRef.current) rainAudioRef.current.play()
          break
        case 'windy':
          if (windAudioRef.current) windAudioRef.current.play()
          break
        case 'sunny':
          if (birdsAudioRef.current) birdsAudioRef.current.play()
          break
      }
    }
  }
  
  // Change weather randomly every 30-60 seconds
  useEffect(() => {
    if (isManualMode) return // Don't auto-change if in manual mode
    
    const changeWeather = () => {
      const weathers: ('sunny' | 'rainy' | 'windy' | 'nothing')[] = ['sunny', 'rainy', 'windy', 'nothing']
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)]
      handleWeatherChange(newWeather)
    }
    
    const interval = setInterval(() => {
      changeWeather()
    }, 30000 + Math.random() * 30000)
    
    return () => {
      clearInterval(interval)
      // Cleanup audio on unmount
      if (rainAudioRef.current) rainAudioRef.current.pause()
      if (windAudioRef.current) windAudioRef.current.pause()
      if (birdsAudioRef.current) birdsAudioRef.current.pause()
    }
  }, [isManualMode])

  // Generate wind particles - more quantity and better visibility
  const windParticles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    top: Math.random() * 100,
    size: 15 + Math.random() * 20
  }))

  // Generate raindrops
  const raindrops = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    duration: 0.4 + Math.random() * 0.3
  }))

  return (
    <>
      {/* Audio Elements */}
      <audio ref={rainAudioRef} src="/sounds/rain.mp3" preload="auto" />
      <audio ref={windAudioRef} src="/sounds/wind.mp3" preload="auto" />
      <audio ref={birdsAudioRef} src="/sounds/birds.mp3" preload="auto" />

      {/* Weather Controls Panel */}
      <div
        className={`fixed right-0 top-20 bg-white/80 backdrop-blur-md rounded-l-xl shadow-lg z-[9999] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-12' : 'w-48'
        }`}
      >
        <div className="p-3 flex items-center justify-between border-b border-gray-200">
          {!isCollapsed && <h3 className="text-lg font-semibold text-gray-700">Weather</h3>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            aria-label={isCollapsed ? "Expand weather controls" : "Collapse weather controls"}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-3">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleWeatherChange('sunny')}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-between ${
                  currentWeather === 'sunny' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Sunny</span>
                <span className="text-xl">☀️</span>
              </button>
              
              <button
                onClick={() => handleWeatherChange('rainy')}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-between ${
                  currentWeather === 'rainy' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Rain</span>
                <span className="text-xl">🌧️</span>
              </button>
              
              <button
                onClick={() => handleWeatherChange('windy')}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-between ${
                  currentWeather === 'windy' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Wind</span>
                <span className="text-xl">💨</span>
              </button>
              
              <button
                onClick={() => handleWeatherChange('nothing')}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-between ${
                  currentWeather === 'nothing' ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Nothing</span>
                <span className="text-xl">❌</span>
              </button>
              
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={handleMuteToggle}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    isMuted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                </button>
                
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isManualMode}
                    onChange={(e) => setIsManualMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-xs text-gray-600">Manual</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* All weather effects are defined but not rendered - 
           They are passed to page.tsx for rendering in the grid container */
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
} 