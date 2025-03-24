'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import { FiPlus, FiMessageSquare, FiTrash2 } from 'react-icons/fi'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentConversationId) return

    const newMessage: Message = { role: 'user', content: message }
    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // Save user message
    await saveMessage(currentConversationId, newMessage)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage]
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
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white shadow-md text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white shadow-sm"
                />
                <button
                  type="submit"
                  className="bg-pink-600 text-white rounded-xl px-6 py-4 hover:bg-pink-700 transition-colors shadow-sm"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
