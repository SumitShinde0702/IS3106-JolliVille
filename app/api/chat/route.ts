import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: 'https://jolliville.openai.azure.com/openai/deployments/gpt-4',
  defaultQuery: { 'api-version': '2025-01-01-preview' }
})

// Get the most recent journal entry for context
async function getRecentJournal(userId: string) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching journal:', error)
    return null
  }

  return data
}

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json()

    // Get recent journal entry if available
    const recentJournal = await getRecentJournal(userId)

    // Create system message with context
    const systemMessage = recentJournal 
      ? `You are JolliBot, an empathetic AI assistant focused on mental well-being and personal growth. 
         The user's most recent journal entry from ${recentJournal.created_at} shows they were feeling ${recentJournal.mood}. 
         They wrote: "${recentJournal.content}"
         
         Use this context to provide more personalized and empathetic responses. Your role is to:
         1. Be supportive and understanding
         2. Offer gentle guidance and positive perspectives
         3. Help users reflect on their thoughts and feelings
         4. Suggest healthy coping strategies when appropriate
         5. Maintain a warm and friendly tone
         6. Encourage journaling and self-reflection
         7. Never give medical advice or try to diagnose conditions
         8. Keep responses concise but meaningful
         9. You can use emojis in your responses and be very nice and friendly
         10. Do not try to provide solutions, instead just be supportive and understanding and listen to the user
         11. Prompt the user to talk more about their day and what they are feeling, and ask them open ended questions to help them talk more about their day and what they are feeling`
         
      : `You are JolliBot, an empathetic AI assistant focused on mental well-being and personal growth.
         Your role is to:
         1. Be supportive and understanding
         2. Offer gentle guidance and positive perspectives
         3. Help users reflect on their thoughts and feelings
         4. Suggest healthy coping strategies when appropriate
         5. Maintain a warm and friendly tone
         6. Encourage journaling and self-reflection
         7. Never give medical advice or try to diagnose conditions
         8. Keep responses concise but meaningful
        9. You can use emojis in your responses and be very nice and friendly
         10. Do not try to provide solutions, instead just be supportive and understanding and listen to the user
         11. Prompt the user to talk more about their day and what they are feeling, and ask them open ended questions to help them talk more about their day and what they are feeling`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: systemMessage },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({
      message: completion.choices[0].message.content
    })
  } catch (error) {
    console.error('Azure OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    )
  }
} 