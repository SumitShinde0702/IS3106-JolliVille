'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import { FiPlus, FiMessageSquare, FiTrash2, FiEdit } from 'react-icons/fi'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface JournalEntry {
  id: string
  user_id: string
  mood: string
  written_reflection: string
  created_at: string
  image_urls: string[]
}

interface Conversation {
  id: string
  created_at: string
  title?: string
  messages?: Message[]
}

export default function ChatBot() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId)
    }
  }, [currentConversationId])

  // Fetch journal entries
  const fetchJournalEntries = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching journal entries:', error)
      return
    }

    setJournalEntries(data)
  }

  // Add useEffect to fetch journal entries
  useEffect(() => {
    fetchJournalEntries()
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*, chat_messages!chat_messages_conversation_id_fkey(content)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return
    }

    // Process conversations to include first message as title
    const processedConversations = data.map(conv => ({
      ...conv,
      title: conv.chat_messages?.[0]?.content || 'New conversation'
    }))

    setConversations(processedConversations)
    if (processedConversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(processedConversations[0].id)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    if (!user) return

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    setMessages(data.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    })))
  }

  const createNewConversation = async () => {
    if (!user) return

    const newConversationId = uuidv4()
    const { error } = await supabase
      .from('chat_conversations')
      .insert([{ id: newConversationId, user_id: user.id }])

    if (error) {
      console.error('Error creating conversation:', error)
      return
    }

    setCurrentConversationId(newConversationId)
    setMessages([])
    fetchConversations()
  }

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting conversation:', error)
      return
    }

    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setMessages([])
    }
    fetchConversations()
  }

  const saveMessage = async (conversationId: string, message: Message) => {
    if (!user) return

    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: conversationId,
        role: message.role,
        content: message.content
      }])

    if (error) {
      console.error('Error saving message:', error)
    }
  }

  const handleEditMessage = (index: number) => {
    // Only allow editing user messages
    if (messages[index].role === 'user') {
      setEditingMessageIndex(index)
      setMessage(messages[index].content)
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageIndex(null)
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user) return

    // Handle editing an existing message
    if (editingMessageIndex !== null) {
      // Create a copy of messages up to the edited message
      const updatedMessages = messages.slice(0, editingMessageIndex + 1)
      
      // Update the content of the edited message
      updatedMessages[editingMessageIndex] = {
        ...updatedMessages[editingMessageIndex],
        content: message
      }
      
      // Update state with just these messages
      setMessages(updatedMessages)
      setMessage('')
      setEditingMessageIndex(null)
      
      // Send the updated message
      setIsLoading(true)
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            userId: user.id
          })
        })

        if (!response.ok) throw new Error('Failed to fetch response')

        const data = await response.json()
        const assistantMessage: Message = { role: 'assistant', content: data.message }
        setMessages([...updatedMessages, assistantMessage])

        // Save assistant message
        if (currentConversationId) {
          await saveMessage(currentConversationId, assistantMessage)
        }
        
        // Update conversations list to show new message
        fetchConversations()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
      
      return
    }

    // Check if the message is asking about journals
    const journalCommand = message.toLowerCase()
    if (journalCommand.includes('journal') || journalCommand.includes('entry') || journalCommand.includes('diary')) {
      const newMessage: Message = { role: 'user', content: message }
      setMessages(prev => [...prev, newMessage])
      setMessage('')

      // Save user message
      if (currentConversationId) {
        await saveMessage(currentConversationId, newMessage)
      }

      setIsLoading(true)

      try {
        let response: string = ''

        // Handle different journal-related commands
        if (journalCommand.includes('latest') || journalCommand.includes('recent')) {
          const latestEntry = journalEntries[0]
          if (latestEntry) {
            // First provide the entry details
            response = `Your latest journal entry was on ${new Date(latestEntry.created_at).toLocaleDateString()}. You were feeling ${latestEntry.mood}. Here's what you wrote:\n\n${latestEntry.written_reflection}\n\n`
            
            // Add empathetic response based on mood
            if (latestEntry.mood.toLowerCase() === 'angry') {
              response += "I can sense that you were really frustrated and angry about this situation. It's completely valid to feel this way when dealing with unfair practices. Would you like to talk more about how you're feeling now? Has anything changed since you wrote this entry?"
            } else if (latestEntry.mood.toLowerCase() === 'sad') {
              response += "I can tell this was a difficult moment for you. Sometimes writing about our feelings helps process them. How are you feeling now? Would you like to explore what might help lift your spirits?"
            } else if (latestEntry.mood.toLowerCase() === 'happy') {
              response += "It's wonderful to see you in such good spirits! These positive moments are worth celebrating. Would you like to share more about what made this experience special?"
            } else if (latestEntry.mood.toLowerCase() === 'anxious') {
              response += "I can sense that you were dealing with some anxiety. Remember that it's okay to feel this way. Would you like to talk about what helps you manage anxiety? Or would you prefer to focus on some positive aspects?"
            } else {
              response += "Thank you for sharing this with me. How are you feeling now compared to when you wrote this? I'm here if you'd like to discuss it further."
            }

            // Add follow-up prompts based on content
            if (latestEntry.written_reflection.toLowerCase().includes('solution') || 
                latestEntry.written_reflection.toLowerCase().includes('discovered')) {
              response += "\n\nIt's great that you found a potential solution! Would you like to discuss how you plan to implement this or explore other alternatives?"
            }
            
            if (latestEntry.written_reflection.toLowerCase().includes('lost') || 
                latestEntry.written_reflection.toLowerCase().includes('no refund')) {
              response += "\n\nDealing with loss and unfairness can be really challenging. Would you like to explore some coping strategies or discuss ways to prevent similar situations in the future?"
            }
          } else {
            response = "You haven't written any journal entries yet. Would you like to write one now?"
          }
        } else if (journalCommand.includes('all') || journalCommand.includes('list')) {
          response = journalEntries.length > 0 
            ? `You have ${journalEntries.length} journal entries. Here are your recent entries:\n\n${
                journalEntries.slice(0, 3).map(entry => 
                  `📅 ${new Date(entry.created_at).toLocaleDateString()} - Feeling ${entry.mood}\n${entry.written_reflection.substring(0, 100)}...`
                ).join('\n\n')
              }`
            : "You haven't written any journal entries yet. Would you like to start journaling?"
        } else if (journalCommand.includes('mood') || journalCommand.includes('feeling')) {
          const moodCounts = journalEntries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
          response = mostCommonMood 
            ? `Based on your journal entries, you most commonly feel ${mostCommonMood[0]} (${mostCommonMood[1]} times).`
            : "I don't have enough journal entries to analyze your moods yet."
        } else {
          response = "I can help you with your journal entries! You can ask me to:\n- Show your latest entry\n- List all entries\n- Analyze your moods\n\nWhat would you like to know?"
        }

        const assistantMessage: Message = { role: 'assistant', content: response }
        setMessages(prev => [...prev, assistantMessage])

        // Save assistant message
        if (currentConversationId) {
          await saveMessage(currentConversationId, assistantMessage)
        }
        
        // Update conversations list
        fetchConversations()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
      
      return
    }

    // If no conversation exists, create one first
    if (!currentConversationId) {
      // We need to wait for the state to update with the new conversation ID
      // So we'll create a temporary ID to use for this submission
      const tempId = uuidv4()
      const { error } = await supabase
        .from('chat_conversations')
        .insert([{ id: tempId, user_id: user.id }])

      if (error) {
        console.error('Error creating conversation:', error)
        return
      }
      setCurrentConversationId(tempId)
      
      const newMessage: Message = { role: 'user', content: message }
      setMessages([newMessage])
      setMessage('')
      
      // Save user message
      await saveMessage(tempId, newMessage)
      
      // Set loading state
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [newMessage],
            userId: user.id
          })
        })

        if (!response.ok) throw new Error('Failed to fetch response')

        const data = await response.json()
        const assistantMessage: Message = { role: 'assistant', content: data.message }
        setMessages([newMessage, assistantMessage])

        // Save assistant message
        await saveMessage(tempId, assistantMessage)
        
        // Update conversations list to show new message
        fetchConversations()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
      
      return
    }

    const newMessage: Message = { role: 'user', content: message }
    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // Save user message
    await saveMessage(currentConversationId, newMessage)
    
    // Set loading state
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          userId: user.id
        })
      })

      if (!response.ok) throw new Error('Failed to fetch response')

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message
      await saveMessage(currentConversationId, assistantMessage)
      
      // Update conversations list to show new message
      fetchConversations()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex justify-center items-center p-4">
      <div className="w-full max-w-7xl h-[90vh] flex rounded-2xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-md border-r border-gray-200">
          <div className="p-4">
            <button
              onClick={createNewConversation}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white rounded-lg px-4 py-3 hover:bg-pink-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              New Chat
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(90vh-80px)]">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative"
              >
                <div
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-100/80 flex items-center gap-3 ${
                    currentConversationId === conv.id ? 'bg-gray-100/80' : ''
                  }`}
                >
                  <FiMessageSquare className="w-4 h-4 text-gray-500" />
                  <p className="truncate flex-1 text-sm text-gray-700">
                    {conv.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-pink-600 transition-opacity"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 relative group ${
                    msg.role === 'user'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white shadow-md text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Edit button for user messages */}
                  {msg.role === 'user' && (
                    <button 
                      className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditMessage(index)}
                      title="Edit message"
                    >
                      <FiEdit className="w-4 h-4 text-pink-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl p-4 bg-white shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-sm text-gray-500">JolliBot is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white/70">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={editingMessageIndex !== null ? "Edit your message..." : "Type your message..."}
                className="flex-1 p-3 rounded-lg border border-gray-300 focus:border-pink-500 focus:outline-none"
                disabled={isLoading}
              />
              <div className="relative">
                <button
                  type="submit"
                  className="bg-pink-600 text-white rounded-lg px-6 py-3 hover:bg-pink-700 transition-colors disabled:bg-pink-400 group"
                  disabled={!message.trim() || isLoading}
                >
                  {editingMessageIndex !== null ? 'Update' : 'Send'}
                  
                  {/* Tooltip for disabled button - Now positioned to the left of the button */}
                  <div className="absolute opacity-0 pointer-events-none group-hover:opacity-100 top-1/2 right-full mr-3 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md px-3 py-2 w-44 text-center transition-opacity duration-200 z-[100]">
                    <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 top-1/2 -translate-y-1/2 -right-1"></div>
                    {!message.trim() ? (
                      <span>
                        Please type a message<br />before sending
                      </span>
                    ) : (
                      'Sending...'
                    )}
                  </div>
                </button>
              </div>
              
              {/* Cancel edit button */}
              {editingMessageIndex !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-200 text-gray-700 rounded-lg px-4 py-3 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
