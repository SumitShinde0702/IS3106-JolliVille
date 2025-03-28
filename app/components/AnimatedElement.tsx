import React, { useEffect, useState } from 'react'

interface AnimatedElementProps {
  type: 'butterfly' | 'wolf' | 'blue-man' | 'cow-woman' | 'red-woman'
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  delay: number
  gridSize: number
}

export default function AnimatedElement({
  type,
  startX,
  startY,
  endX,
  endY,
  duration,
  delay,
  gridSize
}: AnimatedElementProps) {
  const [uniqueId] = useState(() => Math.random().toString(36).substr(2, 9))
  
  // Dimension mapping based on sprite sheet sizes
  const getDimensions = (type: string) => {
    switch (type) {
      case 'butterfly':
        return { width: 16, height: 16, scale: 1.5, frames: 2, duration: 2 }
      case 'wolf':
        return { width: 48, height: 48, scale: 0.8, frames: 6, duration: 0.6 }
      case 'blue-man':
        return { width: 32, height: 48, scale: 0.8, frames: 6, duration: 2.2 }
      case 'cow-woman':
        return { width: 32, height: 48, scale: 0.8, frames: 4, duration: 2.2 }
      case 'red-woman':
        return { width: 32, height: 48, scale: 0.8, frames: 4, duration: 2.2 }
      default:
        return { width: 32, height: 32, scale: 1, frames: 4, duration: 0.8 }
    }
  }

  const { width, height, scale, frames, duration: spriteDuration } = getDimensions(type)

  // Calculate direction
  const dx = endX - startX
  const dy = endY - startY
  const direction = Math.abs(dx) > Math.abs(dy) 
    ? (dx > 0 ? 'S' : 'S') 
    : (dy > 0 ? 'D' : 'U')

  // Get folder name
  const folderMap: Record<string, string> = {
    'butterfly': 'butterflies',
    'wolf': 'wolves',
    'blue-man': 'blue-men',
    'cow-woman': 'cow-women',
    'red-woman': 'red-women'
  }

  // Convert to pixels
  const pxX = (x: number) => (x * 800) / 100
  const pxY = (y: number) => (y * 800) / 100

  return (
    <div
      style={{
        position: 'absolute',
        width: width,
        height: height,
        left: pxX(startX),
        top: pxY(startY),
        backgroundImage: `url(/village-items/${folderMap[type]}/${direction}_Walk.png)`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        transform: `scale(${scale}) ${dx < 0 ? 'scaleX(-1)' : ''}`,
        transformOrigin: 'center',
        zIndex: 10
      }}
      className={`character-${uniqueId}`}
    >
      <style jsx>{`
        .character-${uniqueId} {
          animation: 
            walkSprite-${uniqueId} ${spriteDuration}s steps(${frames}) infinite;
        }

        @keyframes walkSprite-${uniqueId} {
          0% { background-position-x: 0px; }
          100% { background-position-x: -${width * frames}px; }
        }
      `}</style>
    </div>
  )
} 