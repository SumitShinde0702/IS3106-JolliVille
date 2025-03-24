import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: 'https://jolliville.openai.azure.com/openai/deployments/gpt-4',
  defaultQuery: { 'api-version': '2025-01-01-preview' }
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
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