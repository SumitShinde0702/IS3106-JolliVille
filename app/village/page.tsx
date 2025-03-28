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
  category: 'houses' | 'tents' | 'decor'
  isStarter?: boolean
}

interface VillageResources {
  points: number
  plotSize: number
}

const initialItems: VillageItem[] = [
  // Houses
  { id: 'house-1', name: 'House 1', image: '/village-items/houses/1.png', category: 'houses', isStarter: true },
  { id: 'house-2', name: 'House 2', image: '/village-items/houses/2.png', category: 'houses', isStarter: true },
  { id: 'house-3', name: 'House 3', image: '/village-items/houses/3.png', category: 'houses' },
  { id: 'house-4', name: 'House 4', image: '/village-items/houses/4.png', category: 'houses' },
  
  // Tents
  { id: 'tent-1', name: 'Tent 1', image: '/village-items/tents/1.png', category: 'tents', isStarter: true },
  { id: 'tent-2', name: 'Tent 2', image: '/village-items/tents/2.png', category: 'tents' },
  { id: 'tent-3', name: 'Tent 3', image: '/village-items/tents/3.png', category: 'tents' },
  { id: 'tent-4', name: 'Tent 4', image: '/village-items/tents/4.png', category: 'tents' },
  
  // Decor
  { id: 'decor-1', name: 'Decor 1', image: '/village-items/decor/1.png', category: 'decor', isStarter: true },
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
  { id: 'decor-17', name: 'Decor 17', image: '/village-items/decor/17.png', category: 'decor' }
]

const GRID_SIZE = 8 // 8x8 grid
const DAILY_POINTS_LOSS = 10 // Points lost per day
const MAX_POINTS = 1000 // Maximum points
const BASE_EXPANSION_COST = 250 // Base cost for first expansion
const MAX_PLOT_SIZE = 12 // Maximum plot size

// Function to calculate points loss
const calculatePointsLoss = (lastUpdate: Date): number => {
  const now = new Date()
  const daysPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
  return daysPassed * DAILY_POINTS_LOSS
}

// Function to get organized tile number based on position
const getTileNumber = (row: number, col: number, gridSize: number) => {
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
  const section = Math.floor((row * gridSize + col) / 4) % 16
  
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

// Function to calculate expansion cost based on current plot size
const calculateExpansionCost = (currentPlotSize: number): number => {
  // Special case for plot size 5
  if (currentPlotSize === 5) {
    return 500
  }
  return BASE_EXPANSION_COST * currentPlotSize
}

export default function VillagePage() {
  const [gridItems, setGridItems] = useState<(VillageItem | null)[]>(Array(GRID_SIZE * GRID_SIZE).fill(null))
  const [ownedItems, setOwnedItems] = useState<VillageItem[]>([])
  const [draggedItem, setDraggedItem] = useState<VillageItem | null>(null)
  const [isDraggingFromGrid, setIsDraggingFromGrid] = useState(false)
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'houses' | 'tents' | 'decor'>('houses')
  const [resources, setResources] = useState<VillageResources>(() => ({
    points: 0,
    plotSize: 1
  }))
  const [loading, setLoading] = useState(true)
  const [currentGridSize, setCurrentGridSize] = useState(GRID_SIZE)
  const [tileNumbers, setTileNumbers] = useState(() => 
    Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) => getTileNumber(row, col, GRID_SIZE))
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
    const hasSeenInstructions = localStorage.getItem('hasSeenVillageInstructions')
    if (hasSeenInstructions) {
      setInstructionPopup(prev => ({ ...prev, show: false }))
    }
  }, [])

  // Save instruction preferences when user closes the popup
  const handleCloseInstructions = () => {
    localStorage.setItem('hasSeenVillageInstructions', 'true')
    setInstructionPopup(prev => ({ ...prev, show: false }))
  }

  // Load user data and points
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user, error } = await getCurrentUser()
        if (error) {
          console.error('Error getting user:', error)
          return
        }
        if (user) {
          // Get points from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
            return
          }

          // Update points from the profile
          setResources(prev => ({
            ...prev,
            points: profile?.points || 0
          }))
          
          // Load village layout after we have the user data
          await loadVillageLayout(user.id)
        }
      } catch (err) {
        console.error('Error loading user data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Add a function to update points
  const updatePoints = async (newPoints: number) => {
    try {
      const { user, error } = await getCurrentUser()
      if (error || !user) return

      // Update points in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating points:', updateError)
        return
      }

      // Update local state
      setResources(prev => ({
        ...prev,
        points: newPoints
      }))
    } catch (error) {
      console.error('Error updating points:', error)
    }
  }

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

  const loadVillageLayout = async (userId: string) => {
    try {
      console.log('Loading village layout for user:', userId)

      // First, ensure the profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error checking profile:', profileError)
        // Create profile if it doesn't exist
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            points: 1000, // Starting points
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError)
          return
        }
      }

      // Now get or create village layout - explicitly specify columns
      let { data: layout, error: layoutError } = await supabase
        .from('village_layouts')
        .select('id, user_id, plot_size, grid_size, created_at, updated_at')
        .eq('user_id', userId)
        .single()

      if (layoutError) {
        console.log('No existing layout found, creating new one for user:', userId)
        const { data: newLayout, error: createError } = await supabase
          .from('village_layouts')
          .insert([{ 
            user_id: userId,
            plot_size: 1,
            grid_size: GRID_SIZE,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id, user_id, plot_size, grid_size, created_at, updated_at')
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

      console.log('Successfully loaded/created layout:', layout)

      setLayoutId(layout.id)
      setResources(prev => ({
        ...prev,
        plotSize: layout.plot_size || 1
      }))

      // Set the current grid size from the layout
      const savedGridSize = layout.grid_size || GRID_SIZE
      setCurrentGridSize(savedGridSize)

      // Update tile numbers for the saved grid size
      setTileNumbers(
        Array.from({ length: savedGridSize }, (_, row) =>
          Array.from({ length: savedGridSize }, (_, col) => getTileNumber(row, col, savedGridSize))
        ).flat()
      )

      // Load placed items from village_items - explicitly specify columns
      const { data: placedItems, error: placedItemsError } = await supabase
        .from('village_items')
        .select('item_id, grid_position')
        .eq('layout_id', layout.id)

      if (placedItemsError) {
        console.error('Error loading placed items:', placedItemsError)
        return
      }

      // Load owned items from owned_items - explicitly specify columns
      const { data: ownedItemsData, error: ownedItemsError } = await supabase
        .from('owned_items')
        .select('item_id')
        .eq('user_id', userId)

      if (ownedItemsError) {
        console.error('Error loading owned items:', ownedItemsError)
        return
      }

      console.log('Successfully loaded placed items:', placedItems)
      console.log('Successfully loaded owned items:', ownedItemsData)

      // Create sets for efficient lookup
      const ownedItemIds = new Set<string>()
      const placedItemIds = new Set<string>()
      
      // Add starter items
      initialItems.forEach(item => {
        if (item.isStarter) {
          ownedItemIds.add(item.id)
        }
      })
      
      // Add owned items from database
      if (ownedItemsData) {
        ownedItemsData.forEach(item => {
          ownedItemIds.add(item.item_id)
        })
      }

      // Track placed items
      if (placedItems) {
        placedItems.forEach(item => {
          placedItemIds.add(item.item_id)
        })
      }

      // Set up grid items
      const newGridItems = Array(savedGridSize * savedGridSize).fill(null)
      if (placedItems && placedItems.length > 0) {
        placedItems.forEach(item => {
          const itemData = initialItems.find(i => i.id === item.item_id)
          if (itemData && item.grid_position < newGridItems.length) {
            newGridItems[item.grid_position] = itemData
          }
        })
      }

      console.log('Setting up grid items:', newGridItems)
      setGridItems(newGridItems)

      // Set owned items - filter out items that are placed in the grid
      const ownedItemsList = initialItems.filter(item => 
        ownedItemIds.has(item.id) && !placedItemIds.has(item.id)
      )
      console.log('Setting up owned items:', ownedItemsList)
      setOwnedItems(ownedItemsList)

    } catch (error) {
      console.error('Error loading village layout:', error)
    }
  }

  const handleSaveVillage = async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user || !layoutId) {
        console.error('No user or layout ID found')
        return
      }

      // First verify the profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile not found:', profileError)
        return
      }

      console.log('Starting village save...')
      console.log('Layout ID:', layoutId)
      console.log('Current grid items:', gridItems)

      // First, delete all existing placed items for this layout
      const { error: deleteError } = await supabase
        .from('village_items')
        .delete()
        .eq('layout_id', layoutId)

      if (deleteError) {
        console.error('Error deleting existing items:', deleteError)
        throw deleteError
      }

      // Prepare items to insert - only include non-null items
      const itemsToInsert = gridItems
        .map((item, index) => {
          if (!item) return null
          return {
            layout_id: layoutId,
            item_id: item.id,
            grid_position: index,
            created_at: new Date().toISOString()
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      console.log('Items to insert:', itemsToInsert)

      // Insert new items if there are any
      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('village_items')
          .insert(itemsToInsert)
          .select('item_id, grid_position')

        if (insertError) {
          console.error('Error inserting items:', insertError)
          throw insertError
        }
      }

      // Update the layout's updated_at timestamp
      const { error: updateError } = await supabase
        .from('village_layouts')
        .update({ 
          updated_at: new Date().toISOString(),
          plot_size: resources.plotSize,
          grid_size: currentGridSize
        })
        .eq('id', layoutId)
        .eq('user_id', user.id) // Add this check to ensure we only update the user's own layout
        .select('id, plot_size, grid_size, updated_at')

      if (updateError) {
        console.error('Error updating layout timestamp:', updateError)
        throw updateError
      }

      setHasUnsavedChanges(false)
      console.log('Village saved successfully')
      alert('Village saved successfully!')
      
      // Reload the layout to ensure everything is in sync
      await loadVillageLayout(user.id)
    } catch (error) {
      console.error('Error saving village:', error)
      alert('Failed to save village')
    }
  }

  // Modify handleExpandPlot to use dynamic expansion cost
  const handleExpandPlot = async () => {
    const expansionCost = calculateExpansionCost(resources.plotSize)
    if (resources.plotSize >= MAX_PLOT_SIZE || resources.points < expansionCost) return

    try {
      const { user } = await getCurrentUser()
      if (!user || !layoutId) {
        console.error('No user or layout ID found')
        return
      }

      // Calculate new plot size and grid size
      const newPlotSize = resources.plotSize + 1
      const newGridSize = GRID_SIZE + ((newPlotSize - 1) * 2)

      console.log('Expanding plot:', {
        currentPlotSize: resources.plotSize,
        newPlotSize,
        currentGridSize,
        newGridSize,
        expansionCost
      })

      // Update points in database
      const { error: updatePointsError } = await supabase
        .from('profiles')
        .update({ points: resources.points - expansionCost })
        .eq('id', user.id)

      if (updatePointsError) {
        console.error('Error updating points:', updatePointsError)
        throw updatePointsError
      }

      // Update layout in database
      const { error: updateLayoutError } = await supabase
        .from('village_layouts')
        .update({ 
          plot_size: newPlotSize,
          grid_size: newGridSize,
          updated_at: new Date().toISOString()
        })
        .eq('id', layoutId)
        .eq('user_id', user.id)

      if (updateLayoutError) {
        console.error('Error updating layout:', updateLayoutError)
        throw updateLayoutError
      }

      // Update local state
      setResources(prev => ({
        ...prev,
        points: prev.points - expansionCost,
        plotSize: newPlotSize
      }))

      // Update grid size and tile numbers
      setCurrentGridSize(newGridSize)
      setTileNumbers(
        Array.from({ length: newGridSize }, (_, row) =>
          Array.from({ length: newGridSize }, (_, col) => getTileNumber(row, col, newGridSize))
        ).flat()
      )

      // Expand grid items array with null values
      setGridItems(prev => {
        const newItems = Array(newGridSize * newGridSize).fill(null)
        // Copy existing items to their positions
        prev.forEach((item, index) => {
          if (item) {
            newItems[index] = item
          }
        })
        return newItems
      })

      setHasUnsavedChanges(true)
      alert(`Plot expanded successfully! New size: ${newGridSize}x${newGridSize}`)
    } catch (error) {
      console.error('Error expanding plot:', error)
      alert('Failed to expand plot')
    }
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
      setOwnedItems(prev => [...prev, draggedItem])
      
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
    
    // Create a new array for the grid items
    const newGridItems = [...gridItems]
    
    // If we're dragging from the grid (moving an existing item)
    if (isDraggingFromGrid && dragSourceIndex !== null) {
      // Remove item from source position
      newGridItems[dragSourceIndex] = null
      // Add the item back to available items
      setOwnedItems(prev => [...prev, draggedItem])
    } else {
      // If we're dragging from the sidebar (placing a new item)
      // Remove from available items
      setOwnedItems(prev => prev.filter(i => i.id !== draggedItem.id))
    }

    // Place item in new position
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
  const categoryItems = ownedItems.filter(item => item.category === selectedCategory)

  // Add function to reset all users to starter items
  const resetAllUsersToStarterItems = async () => {
    try {
      // Delete all owned items
      const { error: deleteOwnedError } = await supabase
        .from('owned_items')
        .delete()
        .neq('id', 'dummy') // Delete all rows

      if (deleteOwnedError) {
        console.error('Error deleting owned items:', deleteOwnedError)
        return
      }

      // Delete all placed items
      const { error: deletePlacedError } = await supabase
        .from('village_items')
        .delete()
        .neq('id', 'dummy') // Delete all rows

      if (deletePlacedError) {
        console.error('Error deleting placed items:', deletePlacedError)
        return
      }

      // Reset all users' points to starting amount (e.g., 1000)
      const { error: resetPointsError } = await supabase
        .from('profiles')
        .update({ points: 1000 })
        .neq('id', 'dummy') // Update all rows

      if (resetPointsError) {
        console.error('Error resetting points:', resetPointsError)
        return
      }

      // Reset all plot sizes to 1
      const { error: resetLayoutError } = await supabase
        .from('village_layouts')
        .update({ plot_size: 1 })
        .neq('id', 'dummy') // Update all rows

      if (resetLayoutError) {
        console.error('Error resetting layouts:', resetLayoutError)
        return
      }

      console.log('Successfully reset all users to starter items')
      
      // Reload the current user's data
      const { user } = await getCurrentUser()
      if (user) {
        await loadVillageLayout(user.id)
      }
    } catch (error) {
      console.error('Error resetting users:', error)
    }
  }

  // Add button to reset all users (temporary, remove after use)
  const ResetAllUsersButton = () => (
    <button
      onClick={resetAllUsersToStarterItems}
      className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      Reset All Users
    </button>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex">
      {/* Sidebar with Owned Items */}
      <div 
        className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-lg p-4 overflow-y-auto"
        onDragOver={handleSidebarDragOver}
        onDragLeave={handleSidebarDragLeave}
        onDrop={handleSidebarDrop}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            Your Items
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
          {(['houses', 'tents', 'decor'] as const).map((category) => (
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
                <a
                  href="/shop"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <span>Shop</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </a>
                <button
                  onClick={handleExpandPlot}
                  disabled={resources.plotSize >= MAX_PLOT_SIZE || resources.points < calculateExpansionCost(resources.plotSize)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    resources.plotSize >= MAX_PLOT_SIZE || resources.points < calculateExpansionCost(resources.plotSize)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-pink-600 text-white hover:bg-pink-700'
                  }`}
                >
                  Expand Plot ({calculateExpansionCost(resources.plotSize)} points)
                </button>
              </div>
            </div>

            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center h-[800px]">
                  <div className="text-xl">Loading your village...</div>
                </div>
              ) : (
                <>
                  <div 
                    className="grid gap-0 bg-gray-800 p-1 rounded-lg aspect-square w-[800px] mx-auto" 
                    style={{ gridTemplateColumns: `repeat(${currentGridSize}, 1fr)` }}
                  >
                    {Array.from({ length: currentGridSize * currentGridSize }).map((_, index) => (
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
                        gridSize={currentGridSize}
                      />
                    ))}
                  </div>
                </>
              )}
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
              onClick={handleCloseInstructions}
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <ResetAllUsersButton />

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