# JolliVille - Your Personal Emotional Wellness Journey 🌟

JolliVille is an interactive journaling and wellness platform designed for young adults (12-25) that combines emotional well-being with gamification elements. Express your feelings, customize your virtual space, and grow while earning rewards!

## Features

- 📝 **Personal Journal**: Write and track your daily emotions and thoughts
- 🎮 **Virtual Avatar & Room**: Customize your personal space with earned rewards
- 🤖 **AI Companion**: Chat with an empathetic AI friend about your feelings
- 🧘‍♀️ **Wellness Activities**: Access guided meditation and mindfulness exercises
- 🎯 **Daily Challenges**: Complete self-care activities and earn points
- 🎵 **Sound Therapy**: Interactive tools for stress relief
- 💫 **Rewards System**: Earn points through consistent journaling and wellness activities

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: NextAuth.js
- UI: Tailwind CSS
- AI Integration: OpenAI API for chat functionality
- Animations: Framer Motion

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the frontend:
   ```bash
   npm run dev
   ```
5. Run the backend server:
   ```bash
   npm run server
   ```

## Environment Variables

Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_anon_key

AZURE_OPENAI_API_KEY=openai_api_key
AZURE_OPENAI_ENDPOINT=openai_endpoint
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
