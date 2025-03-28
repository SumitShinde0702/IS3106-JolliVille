import React, { useEffect, useState, useRef } from 'react'

interface WeatherProps {
  gridSize: number
}

export default function Weather({ gridSize }: WeatherProps) {
  const [currentWeather, setCurrentWeather] = useState<'sunny' | 'rainy' | 'windy' | 'nothing'>('sunny')
  const [isManualMode, setIsManualMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  // Audio refs
  const rainAudioRef = useRef<HTMLAudioElement | null>(null)
  const windAudioRef = useRef<HTMLAudioElement | null>(null)
  const birdsAudioRef = useRef<HTMLAudioElement | null>(null)

  // Handle weather change and sound effects
  const handleWeatherChange = (weather: 'sunny' | 'rainy' | 'windy' | 'nothing') => {
    // Only allow weather changes if in manual mode or if it's an automatic change
    if (!isManualMode || weather !== currentWeather) {
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
    }
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
    if (isManualMode) {
      // Clear any existing interval when entering manual mode
      return
    }
    
    const changeWeather = () => {
      const weathers: ('sunny' | 'rainy' | 'windy' | 'nothing')[] = ['sunny', 'rainy', 'windy', 'nothing']
      // Don't select the current weather to ensure a change
      const availableWeathers = weathers.filter(w => w !== currentWeather)
      const newWeather = availableWeathers[Math.floor(Math.random() * availableWeathers.length)]
      handleWeatherChange(newWeather)
    }
    
    // Initial weather change
    if (!isManualMode) {
      changeWeather()
    }
    
    const interval = setInterval(changeWeather, 30000 + Math.random() * 30000)
    
    return () => {
      clearInterval(interval)
      // Cleanup audio on unmount
      if (rainAudioRef.current) rainAudioRef.current.pause()
      if (windAudioRef.current) windAudioRef.current.pause()
      if (birdsAudioRef.current) birdsAudioRef.current.pause()
    }
  }, [isManualMode, currentWeather]) // Add currentWeather as dependency

  // Generate wind particles
  const windParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 2,
    top: Math.random() * 100,
    size: 8 + Math.random() * 8
  }))

  // Generate raindrops
  const raindrops = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    duration: 0.5 + Math.random() * 0.3
  }))

  // Update manual mode toggle to handle weather state
  const handleManualModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newManualMode = e.target.checked
    setIsManualMode(newManualMode)
    
    // If turning off manual mode, trigger an immediate weather change
    if (!newManualMode) {
      const weathers: ('sunny' | 'rainy' | 'windy' | 'nothing')[] = ['sunny', 'rainy', 'windy', 'nothing']
      const availableWeathers = weathers.filter(w => w !== currentWeather)
      const newWeather = availableWeathers[Math.floor(Math.random() * availableWeathers.length)]
      handleWeatherChange(newWeather)
    }
  }

  return (
    <>
      {/* Audio Elements */}
      <audio ref={rainAudioRef} src="/sounds/rain.mp3" preload="auto" />
      <audio ref={windAudioRef} src="/sounds/wind.mp3" preload="auto" />
      <audio ref={birdsAudioRef} src="/sounds/birds.mp3" preload="auto" />

      {/* Weather Controls Panel - Now positioned on the right side of the grid */}
      <div className="absolute -right-52 top-0 w-48 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Weather</h3>
          <button
            onClick={handleMuteToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        <div className="p-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleWeatherChange('nothing')}
              className={`p-2 rounded-lg transition-all ${
                currentWeather === 'nothing' 
                  ? 'bg-gray-100 text-gray-700 shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              ❌ Nothing
            </button>
            <button
              onClick={() => handleWeatherChange('sunny')}
              className={`p-2 rounded-lg transition-all ${
                currentWeather === 'sunny' 
                  ? 'bg-yellow-100 text-yellow-700 shadow-sm' 
                  : 'bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-200'
              }`}
            >
              ☀️ Sunny
            </button>
            <button
              onClick={() => handleWeatherChange('rainy')}
              className={`p-2 rounded-lg transition-all ${
                currentWeather === 'rainy' 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              🌧️ Rain
            </button>
            <button
              onClick={() => handleWeatherChange('windy')}
              className={`p-2 rounded-lg transition-all ${
                currentWeather === 'windy' 
                  ? 'bg-gray-100 text-gray-700 shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              💨 Wind
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <input
                type="checkbox"
                checked={isManualMode}
                onChange={handleManualModeToggle}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                id="manual-control"
              />
              <label htmlFor="manual-control" className="cursor-pointer">Manual Control</label>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Effects Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sun */}
        {currentWeather === 'sunny' && (
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] pointer-events-none">
            <div className="sun pointer-events-none"></div>
            <div className="sun-rays pointer-events-none"></div>
          </div>
        )}

        {/* Wind particles */}
        {currentWeather === 'windy' && windParticles.map(particle => (
          <div
            key={particle.id}
            className="absolute wind-particle pointer-events-none"
            style={{
              '--delay': `${particle.delay}s`,
              '--duration': `${particle.duration}s`,
              '--top': `${particle.top}%`,
              '--size': `${particle.size}px`
            } as React.CSSProperties}
          />
        ))}

        {/* Rain */}
        {currentWeather === 'rainy' && (
          <>
            <div className="rain-overlay pointer-events-none"></div>
            {raindrops.map(drop => (
              <div
                key={drop.id}
                className="absolute raindrop pointer-events-none"
                style={{
                  '--delay': `${drop.delay}s`,
                  '--left': `${drop.left}%`,
                  '--duration': `${drop.duration}s`
                } as React.CSSProperties}
              />
            ))}
          </>
        )}

        <style jsx>{`
          .sun {
            position: absolute;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle at center, #FFD700, #FFA500);
            border-radius: 50%;
            box-shadow: 0 0 50px #FFD700;
            animation: pulse 4s ease-in-out infinite;
            opacity: 0.6;
          }

          .sun-rays {
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle at center, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
          }

          .rain-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(146, 167, 207, 0.03) 0%, rgba(146, 167, 207, 0.08) 100%);
          }

          .raindrop {
            position: absolute;
            width: 3px;
            height: 25px;
            background: linear-gradient(transparent, rgba(174, 198, 242, 0.5));
            left: var(--left);
            top: -25px;
            animation: rain var(--duration) linear var(--delay) infinite;
            border-radius: 999px;
          }

          .wind-particle {
            width: var(--size);
            height: 3px;
            background: rgba(255, 247, 237, 0.4);
            border-radius: 999px;
            top: var(--top);
            left: -10px;
            animation: wind var(--duration) ease-in-out var(--delay) infinite;
            box-shadow: 0 0 3px rgba(255, 247, 237, 0.2);
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes wind {
            0% {
              transform: translateX(-10px) rotate(0deg) scaleX(1);
              opacity: 0;
            }
            5% { opacity: 0.5; }
            25% {
              transform: translateX(${gridSize * 25}px) rotate(15deg) scaleX(2);
            }
            50% {
              transform: translateX(${gridSize * 50}px) rotate(-15deg) scaleX(1.5);
            }
            75% {
              transform: translateX(${gridSize * 75}px) rotate(15deg) scaleX(2);
            }
            95% { opacity: 0.5; }
            100% {
              transform: translateX(${gridSize * 100 + 10}px) rotate(0deg) scaleX(1);
              opacity: 0;
            }
          }

          @keyframes rain {
            from {
              transform: translateY(-25px) rotate(15deg) scaleY(1);
            }
            to {
              transform: translateY(${gridSize * 100 + 25}px) rotate(15deg) scaleY(1.2);
            }
          }
        `}</style>
      </div>
    </>
  )
} 