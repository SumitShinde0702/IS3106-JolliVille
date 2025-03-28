import React from 'react'
import Image from 'next/image'

interface AnimatedElementProps {
  type: 'person' | 'butterfly' | 'wolf'
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  delay: number
  controlX?: number
  controlY?: number
  gridSize: number
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  type,
  startX,
  startY,
  endX,
  endY,
  duration,
  delay,
  controlX,
  controlY,
  gridSize
}) => {
  // Get sprite dimensions based on type
  const getSpriteDimensions = () => {
    switch (type) {
      case 'person':
        return { width: 32, height: 32, steps: 4, duration: 1 }
      case 'butterfly':
        return { width: 24, height: 24, steps: 4, duration: 0.8 }
      case 'wolf':
        return { width: 40, height: 40, steps: 4, duration: 1.2 }
      default:
        return { width: 32, height: 32, steps: 4, duration: 1 }
    }
  }

  const dimensions = getSpriteDimensions()
  
  // Calculate scale based on grid size (smaller as grid gets bigger)
  const scale = Math.max(0.4, 1 - (gridSize - 8) * 0.1)

  // Calculate direction based on movement
  const dx = endX - startX
  const dy = endY - startY
  let direction = 'D' // Default to down
  if (Math.abs(dx) > Math.abs(dy)) {
    // For horizontal movement, use S_Walk for both directions
    direction = 'S'
  } else {
    direction = dy > 0 ? 'D' : 'U'
  }

  // Get the sprite sheet path based on type and direction
  const imagePath = type === 'person' 
    ? `/village-items/people/${direction}_${direction === 'D' ? 'Idle' : 'Special'}.png`
    : type === 'wolf'
    ? `/village-items/wolves/${direction}_Walk.png`
    : `/village-items/butterflies/${direction}_Walk.png`

  // Flip the image horizontally if moving left
  const shouldFlip = dx < 0 && Math.abs(dx) > Math.abs(dy)

  return (
    <div
      className="animated-element"
      style={{
        '--start-x': `${startX}%`,
        '--start-y': `${startY}%`,
        '--end-x': `${endX}%`,
        '--end-y': `${endY}%`,
        '--control-x': controlX ? `${controlX}%` : undefined,
        '--control-y': controlY ? `${controlY}%` : undefined,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        '--sprite-duration': `${dimensions.duration}s`,
        '--sprite-steps': dimensions.steps,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        transform: shouldFlip ? 'scaleX(-1)' : 'none'
      } as React.CSSProperties}
    >
      <div 
        className="relative w-full h-full"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={imagePath}
            alt={type}
            fill
            className="object-cover"
            style={{
              objectPosition: '0 0', // Show only the first frame
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AnimatedElement 