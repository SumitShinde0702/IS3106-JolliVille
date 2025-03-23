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
}

export default function AnimatedElement({ type, startX, startY, endX, endY, duration, delay, controlX, controlY }: AnimatedElementProps) {
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
      className="absolute z-20"
      style={{
        '--start-x': `${startX}%`,
        '--start-y': `${startY}%`,
        '--end-x': `${endX}%`,
        '--end-y': `${endY}%`,
        '--control-x': controlX ? `${controlX}%` : 'auto',
        '--control-y': controlY ? `${controlY}%` : 'auto',
        animation: `move ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s infinite`,
        transform: `translate(-50%, -50%) ${shouldFlip ? 'scaleX(-1)' : ''}`,
      } as React.CSSProperties}
    >
      <div className="relative w-20 h-20">
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