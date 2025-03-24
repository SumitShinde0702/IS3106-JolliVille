'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import AnimatedElement from '../components/AnimatedElement'
import { getCurrentUser, updateUserPoints } from '../lib/auth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface VillageItem {
  id: string
  name: string
  image: string
  category: 'houses' | 'tents' | 'decor' | 'grass'
}

interface VillageResources {
  points: number
  plotSize: number
}

const initialItems: VillageItem[] = [
  // Houses
  { id: 'house-1', name: 'House 1', image: '/village-items/houses/1.png', category: 'houses' },
  { id: 'house-2', name: 'House 2', image: '/village-items/houses/2.png', category: 'houses' },
  { id: 'house-3', name: 'House 3', image: '/village-items/houses/3.png', category: 'houses' },
  { id: 'house-4', name: 'House 4', image: '/village-items/houses/4.png', category: 'houses' },
  
  // Tents
  { id: 'tent-1', name: 'Tent 1', image: '/village-items/tents/1.png', category: 'tents' },
  { id: 'tent-2', name: 'Tent 2', image: '/village-items/tents/2.png', category: 'tents' },
  { id: 'tent-3', name: 'Tent 3', image: '/village-items/tents/3.png', category: 'tents' },
  { id: 'tent-4', name: 'Tent 4', image: '/village-items/tents/4.png', category: 'tents' },
  
  // Decor
  { id: 'decor-1', name: 'Decor 1', image: '/village-items/decor/1.png', category: 'decor' },
  { id: 'decor-2', name: 'Decor 2', image: '/village-items/decor/2.png', category: 'decor' },
  { id: 'decor-3', name: 'Decor 3', image: '/village-items/decor/3.png', category: 'decor' },
  { id: 'decor-4', name: 'Decor 4', image: '/village-items/decor/4.png', category: 'decor' },
  { id: 'decor-5', name: 'Decor 5', image: '/village-items/decor/5.png', category: 'decor' },
  { id: 'decor-6', name: 'Decor 6', image: '/village-items/decor/6.png', category: 'decor' },
  { id: 'decor-7', name: 'Decor 7', image: '/village-items/decor/7.png', category: 'decor' },
  { id: 'decor-8', name: 'Decor 8', image: '/village-items/decor/8.png', category: 'decor' },
  { id: 'decor-9', name: 'Decor 9', image: '/village-items/decor/9.png', category: 'decor' },
  { id: 'decor-10', name: 'Decor 10', image: '/village-items/decor/10.png', category: 'decor' },
  { id: 'decor-11', name: 'Decor 11', image: '/village-items/decor/11.png', category: 'decor' },
  { id: 'decor-12', name: 'Decor 12', image: '/village-items/decor/12.png', category: 'decor' },
  { id: 'decor-13', name: 'Decor 13', image: '/village-items/decor/13.png', category: 'decor' },
  { id: 'decor-14', name: 'Decor 14', image: '/village-items/decor/14.png', category: 'decor' },
  { id: 'decor-15', name: 'Decor 15', image: '/village-items/decor/15.png', category: 'decor' },
  { id: 'decor-16', name: 'Decor 16', image: '/village-items/decor/16.png', category: 'decor' },
  { id: 'decor-17', name: 'Decor 17', image: '/village-items/decor/17.png', category: 'decor' },
  
  // Grass
  { id: 'grass-1', name: 'Grass 1', image: '/village-items/grass/1.png', category: 'grass' },
  { id: 'grass-2', name: 'Grass 2', image: '/village-items/grass/2.png', category: 'grass' },
  { id: 'grass-3', name: 'Grass 3', image: '/village-items/grass/3.png', category: 'grass' },
  { id: 'grass-4', name: 'Grass 4', image: '/village-items/grass/4.png', category: 'grass' },
  { id: 'grass-5', name: 'Grass 5', image: '/village-items/grass/5.png', category: 'grass' }
]

const GRID_SIZE = 8 // 8x8 grid
const DAILY_POINTS_LOSS = 10 // Points lost per day
const MAX_POINTS = 1000 // Maximum points
const EXPANSION_COST = 50 // Cost to expand plot size
const MAX_PLOT_SIZE = 12 // Maximum plot size

// Function to calculate points loss
const calculatePointsLoss = (lastUpdate: Date): number => {
  const now = new Date()
  const daysPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
  return daysPassed * DAILY_POINTS_LOSS
}

// Function to get organized tile number based on position
const getTileNumber = (row: number, col: number) => {
  // Create a pattern that repeats every 2x2 tiles
  const basePattern = [
    [1, 2],
    [3, 4]
  ]
  
  // Use modulo to repeat the pattern
  const patternRow = row % 2
  const patternCol = col % 2
  
  // Get the base number from the pattern
  const baseNumber = basePattern[patternRow][patternCol]
  
  // Offset by the section (each section is 4 tiles)
  const section = Math.floor((row * 8 + col) / 4) % 16
  
  // Ensure the tile number is between 1 and 64
  const tileNumber = ((baseNumber + section * 4 - 1) % 64) + 1
  
  return tileNumber
}

// Function to get tile path
const getTilePath = (tileNumber: number) => {
  // Ensure the number is padded to 2 digits
  return `/village-items/tiles/FieldsTile_${String(tileNumber).padStart(2, '0')}.png`
}

// Function to generate random position within grid bounds
const getRandomPosition = (isX: boolean) => {
  // Generate positions more evenly across the grid
  const min = 10 // Minimum distance from edges
  const max = 90 // Maximum distance from edges
  const step = 20 // Divide the grid into sections
  
  // Get a random section
  const section = Math.floor(Math.random() * (max - min) / step)
  // Get a random position within that section
  const offset = Math.random() * step
  
  return min + (section * step) + offset
}

// Function to generate random duration with natural variation
const getRandomDuration = () => {
  const baseDuration = 15 + Math.random() * 10 // Base duration between 15-25 seconds
  const variation = 0.8 + Math.random() * 0.4 // Random variation between 0.8 and 1.2
  return baseDuration * variation
}

// Function to generate control points for curved paths
const getControlPoint = (startX: number, startY: number, endX: number, endY: number) => {
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
  
  // Add random offset to create natural curves
  const offsetX = (Math.random() - 0.5) * distance * 0.5
  const offsetY = (Math.random() - 0.5) * distance * 0.5
  
  return {
    x: midX + offsetX,
    y: midY + offsetY
  }
}

interface AnimatedElementData {
  id: string
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

// Function to get item size class
const getItemSizeClass = (itemId: string) => {
  if (itemId.startsWith('house')) return 'scale-100'
  if (itemId.startsWith('tent')) return 'scale-90'
  if (itemId.startsWith('decor')) return 'scale-75'
  return 'scale-100'
}

// Add new interface for instruction popup
interface InstructionPopup {
  show: boolean
  dontShowAgain: boolean
}

export default function VillagePage() {
  const [gridItems, setGridItems] = useState<(VillageItem | null)[]>(Array(GRID_SIZE * GRID_SIZE).fill(null))
  const [availableItems, setAvailableItems] = useState<VillageItem[]>(initialItems)
  const [draggedItem, setDraggedItem] = useState<VillageItem | null>(null)
  const [isDraggingFromGrid, setIsDraggingFromGrid] = useState(false)
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'houses' | 'tents' | 'decor' | 'grass'>('houses')
  const [resources, setResources] = useState<VillageResources>(() => ({
    points: 0,
    plotSize: 1
  }))
  const [loading, setLoading] = useState(true)
  const [tileNumbers] = useState(() => 
    Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) => getTileNumber(row, col))
    ).flat()
  )
  const [animatedElements, setAnimatedElements] = useState<AnimatedElementData[]>([])
  const [layoutId, setLayoutId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize instruction popup without localStorage
  const [instructionPopup, setInstructionPopup] = useState<InstructionPopup>({
    show: true,
    dontShowAgain: false
  })

  // Load instruction preferences from localStorage on client side
  useEffect(() => {
    const saved = localStorage.getItem('villageInstructions')
    if (saved) {
      setInstructionPopup(JSON.parse(saved))
    }
  }, [])

  // Save instruction preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('villageInstructions', JSON.stringify(instructionPopup))
    }
  }, [instructionPopup])

  // Load user data and points
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user, error } = await getCurrentUser()
        if (error) throw error
        if (user) {
          setResources(prev => ({
            ...prev,
            points: user.points || 0
          }))
        }
      } catch (err) {
        console.error('Error loading user data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  useEffect(() => {
    const updateAnimations = () => {
      setAnimatedElements(prev => prev.map(element => {
        const newEndX = getRandomPosition(true)
        const newEndY = getRandomPosition(false)
        const control = getControlPoint(element.endX, element.endY, newEndX, newEndY)
        
        return {
          ...element,
          startX: element.endX,
          startY: element.endY,
          endX: newEndX,
          endY: newEndY,
          duration: getRandomDuration(),
          delay: 0, // No delay between movements
          controlX: control.x,
          controlY: control.y
        }
      }))
    }

    // Generate initial animated elements - fewer but permanent
    const initialElements: AnimatedElementData[] = [
      // 2 people
      {
        id: 'person-1',
        type: 'person',
        startX: getRandomPosition(true),
        startY: getRandomPosition(false),
        endX: getRandomPosition(true),
        endY: getRandomPosition(false),
        duration: getRandomDuration(),
        delay: 0
      },
      {
        id: 'person-2',
        type: 'person',
        startX: getRandomPosition(true),
        startY: getRandomPosition(false),
        endX: getRandomPosition(true),
        endY: getRandomPosition(false),
        duration: getRandomDuration(),
        delay: 0
      },
      // 2 butterflies
      {
        id: 'butterfly-1',
        type: 'butterfly',
        startX: getRandomPosition(true),
        startY: getRandomPosition(false),
        endX: getRandomPosition(true),
        endY: getRandomPosition(false),
        duration: getRandomDuration(),
        delay: 0
      },
      {
        id: 'butterfly-2',
        type: 'butterfly',
        startX: getRandomPosition(true),
        startY: getRandomPosition(false),
        endX: getRandomPosition(true),
        endY: getRandomPosition(false),
        duration: getRandomDuration(),
        delay: 0
      },
      // 1 wolf
      {
        id: 'wolf-1',
        type: 'wolf',
        startX: getRandomPosition(true),
        startY: getRandomPosition(false),
        endX: getRandomPosition(true),
        endY: getRandomPosition(false),
        duration: getRandomDuration(),
        delay: 0
      }
    ]

    setAnimatedElements(initialElements)

    // Update animations more frequently for continuous movement
    const interval = setInterval(updateAnimations, 3000)
    return () => clearInterval(interval)
  }, [])

  // Load village layout on component mount
  useEffect(() => {
    loadVillageLayout()
  }, [])

  const loadVillageLayout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get or create village layout
      let { data: layout } = await supabase
        .from('village_layouts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!layout) {
        const { data: newLayout, error: createError } = await supabase
          .from('village_layouts')
          .insert([{ 
            user_id: user.id,
            points: resources.points,
            plot_size: 1
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating layout:', createError)
          return
        }
        layout = newLayout
      }

      if (!layout) {
        console.error('Failed to get or create layout')
        return
      }

      setLayoutId(layout.id)
      setResources({
        points: layout.points || 0,
        plotSize: layout.plot_size || 1
      })

      // Load placed items
      const { data: items, error: itemsError } = await supabase
        .from('village_items')
        .select('*')
        .eq('layout_id', layout.id)

      if (itemsError) {
        console.error('Error loading items:', itemsError)
        return
      }

      if (items) {
        const newGridItems = Array(GRID_SIZE * GRID_SIZE).fill(null)
        items.forEach(item => {
          const itemData = initialItems.find(i => i.id === item.item_id)
          if (itemData) {
            newGridItems[item.grid_position] = itemData
          }
        })
        setGridItems(newGridItems)
      }
    } catch (error) {
      console.error('Error loading village layout:', error)
    }
  }

  const saveVillageLayout = async () => {
    try {
      // Use getCurrentUser instead of getSession
      const { user, error } = await getCurrentUser()
      
      if (error) {
        console.error('Auth error:', error)
        alert('Please log in to save your village')
        return
      }

      if (!user) {
        console.error('No authenticated user found')
        alert('Please log in to save your village')
        return
      }

      console.log('User authenticated:', user.id)
      console.log('Current layout ID:', layoutId)
      console.log('Current grid items:', gridItems)

      // If no layoutId, create a new layout
      let currentLayoutId = layoutId
      if (!currentLayoutId) {
        const { data: newLayout, error: createError } = await supabase
          .from('village_layouts')
          .insert([{ 
            user_id: user.id,
            points: resources.points,
            plot_size: resources.plotSize,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating layout:', createError)
          alert('Failed to create village layout')
          return
        }
        if (!newLayout) {
          console.error('No layout created')
          alert('Failed to create village layout')
          return
        }
        currentLayoutId = newLayout.id
        setLayoutId(newLayout.id)
        console.log('Created new layout with ID:', currentLayoutId)
      }

      // Update existing layout
      const { error: updateError } = await supabase
        .from('village_layouts')
        .update({
          points: resources.points,
          plot_size: resources.plotSize,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentLayoutId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating layout:', updateError)
        alert('Failed to update village layout')
        return
      }
      console.log('Updated existing layout:', currentLayoutId)

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('village_items')
        .delete()
        .eq('layout_id', currentLayoutId)

      if (deleteError) {
        console.error('Error deleting items:', deleteError)
        alert('Failed to update village items')
        return
      }
      console.log('Deleted existing items for layout:', currentLayoutId)

      // Insert new items
      const items = gridItems
        .map((item, index) => {
          if (!item || !currentLayoutId) return null
          return {
            layout_id: currentLayoutId,
            item_id: item.id,
            grid_position: index
          }
        })
        .filter(Boolean)

      console.log('Saving items:', items)

      if (items.length > 0) {
        const { data: insertedItems, error: insertError } = await supabase
          .from('village_items')
          .insert(items)
          .select()

        if (insertError) {
          console.error('Error inserting items:', insertError)
          alert('Failed to save village items')
          return
        }
        console.log('Successfully saved items:', insertedItems)
      }

      setHasUnsavedChanges(false)
      console.log('Save completed successfully')
      alert('Village saved successfully!')
    } catch (error) {
      console.error('Error saving village layout:', error)
      alert('An error occurred while saving your village')
    }
  }

  const handleSaveVillage = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (error || !user) {
        alert('Please log in to save your village')
        return
      }
      await saveVillageLayout()
    } catch (error) {
      console.error('Error in handleSaveVillage:', error)
      alert('Failed to save village')
    }
  }

  // Function to handle plot expansion
  const handleExpandPlot = async () => {
    if (resources.plotSize >= MAX_PLOT_SIZE || resources.points < EXPANSION_COST) return

    setResources(prev => ({
      points: prev.points - EXPANSION_COST,
      plotSize: prev.plotSize + 1
    }))

    setHasUnsavedChanges(true)
  }

  const handleDragStart = (e: React.DragEvent, item: VillageItem, gridIndex?: number) => {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedItem(item)
    setIsDraggingFromGrid(gridIndex !== undefined)
    if (gridIndex !== undefined) {
      setDragSourceIndex(gridIndex)
    }
  }

  const handleSidebarDragOver = (e: React.DragEvent) => {
    if (isDraggingFromGrid) {
      e.preventDefault()
      e.currentTarget.classList.add('bg-red-50')
    }
  }

  const handleSidebarDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-red-50')
  }

  const handleSidebarDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-red-50')

    if (isDraggingFromGrid && dragSourceIndex !== null && draggedItem) {
      // Add back to available items
      setAvailableItems([...availableItems, draggedItem])
      
      // Remove from grid
      const newGridItems = [...gridItems]
      newGridItems[dragSourceIndex] = null
      setGridItems(newGridItems)

      // Set unsaved changes flag
      setHasUnsavedChanges(true)
    }

    setIsDraggingFromGrid(false)
    setDragSourceIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-purple-100')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-purple-100')
  }

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.currentTarget.classList.remove('brightness-110')
    
    if (!draggedItem) return
    
    // Remove item from source position if it was already on the grid
    if (isDraggingFromGrid && dragSourceIndex !== null) {
      const newGridItems = [...gridItems]
      newGridItems[dragSourceIndex] = null
      setGridItems(newGridItems)
    } else {
      // Remove from available items if coming from sidebar
      setAvailableItems(availableItems.filter(i => i.id !== draggedItem.id))
    }

    // Place item in new position
    const newGridItems = [...gridItems]
    newGridItems[index] = draggedItem
    setGridItems(newGridItems)

    // Set unsaved changes flag
    setHasUnsavedChanges(true)
    
    // Reset drag state
    setDraggedItem(null)
    setDragSourceIndex(null)
    setIsDraggingFromGrid(false)
  }

  // Get items for selected category
  const categoryItems = availableItems.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex">
      {/* Sidebar with Available Items */}
      <div 
        className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-lg p-4 overflow-y-auto"
        onDragOver={handleSidebarDragOver}
        onDragLeave={handleSidebarDragLeave}
        onDrop={handleSidebarDrop}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            Available Items
          </h2>
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveVillage}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Save Village
            </button>
          )}
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(['houses', 'tents', 'decor', 'grass'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-pink-100 text-pink-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-2">
          {categoryItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              className="bg-white p-2 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-24 flex items-center justify-center">
                <div className={`relative w-full h-full ${getItemSizeClass(item.id)}`}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100px, 200px"
                    className="object-contain"
                    priority={item.category === 'houses'}
                  />
                </div>
              </div>
              <p className="text-center mt-1 text-sm">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 flex justify-center items-center">
        <div className="w-full max-w-4xl transform scale-90">
          {/* Village Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Your Village Plot
              </h2>
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-gray-600 mr-2">Points:</span>
                  <span className="font-semibold text-pink-600">{resources.points}</span>
                </div>
                <button
                  onClick={handleExpandPlot}
                  disabled={resources.plotSize >= MAX_PLOT_SIZE || resources.points < EXPANSION_COST}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    resources.plotSize >= MAX_PLOT_SIZE || resources.points < EXPANSION_COST
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-pink-600 text-white hover:bg-pink-700'
                  }`}
                >
                  Expand Plot ({EXPANSION_COST} points)
                </button>
              </div>
            </div>

            <div className="relative">
              <div 
                className="grid gap-0 bg-gray-800 p-1 rounded-lg aspect-square w-[800px] mx-auto" 
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square relative cursor-pointer hover:brightness-110"
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('brightness-110')
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('brightness-110')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('brightness-110')
                      handleDrop(e, index)
                    }}
                  >
                    {/* Background Tile */}
                    <div className="absolute inset-0">
                      <Image
                        src={getTilePath(tileNumbers[index])}
                        alt="Tile"
                        fill
                        sizes="(max-width: 768px) 50px, 100px"
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Item Overlay */}
                    {gridItems[index] && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center z-10"
                        draggable
                        onDragStart={(e) => handleDragStart(e, gridItems[index]!, index)}
                      >
                        <div className={`relative w-full h-full transform ${getItemSizeClass(gridItems[index]!.id)}`}>
                          <Image
                            src={gridItems[index]!.image}
                            alt={gridItems[index]!.name}
                            fill
                            sizes="(max-width: 768px) 50px, 100px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Animated Elements */}
              <div className="absolute inset-0 pointer-events-none">
                {animatedElements.map((element) => (
                  <AnimatedElement
                    key={element.id}
                    type={element.type}
                    startX={element.startX}
                    startY={element.startY}
                    endX={element.endX}
                    endY={element.endY}
                    duration={element.duration}
                    delay={element.delay}
                    controlX={element.controlX}
                    controlY={element.controlY}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction Popup */}
      {instructionPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">How to Build Your Village</h3>
            <p className="mb-4">
              1. Drag items from the sidebar to place them in your village plot<br/>
              2. To remove an item, drag it back to the sidebar<br/>
              3. Expand your plot using points to build a larger village
            </p>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={instructionPopup.dontShowAgain}
                onChange={(e) => setInstructionPopup(prev => ({
                  ...prev,
                  dontShowAgain: e.target.checked
                }))}
                className="mr-2"
              />
              <label htmlFor="dontShowAgain">Don't show this again</label>
            </div>
            <button
              onClick={() => setInstructionPopup(prev => ({ ...prev, show: false }))}
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .text-gradient {
          background: linear-gradient(to right, #ec4899, #8b5cf6, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes move {
          0% {
            left: var(--start-x);
            top: var(--start-y);
          }
          50% {
            left: var(--control-x, calc((var(--start-x) + var(--end-x)) / 2));
            top: var(--control-y, calc((var(--start-y) + var(--end-y)) / 2));
          }
          100% {
            left: var(--end-x);
            top: var(--end-y);
          }
        }

        @keyframes spriteAnimation {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        .animated-element {
          position: absolute;
          width: 32px;
          height: 32px;
          animation: move var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .animated-element img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: spriteAnimation var(--sprite-duration, 1s) steps(var(--sprite-steps, 4)) infinite;
        }
      `}</style>
    </div>
  )
} 