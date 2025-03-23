import express, { RequestHandler } from 'express'
import session from 'express-session'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Extend the Session interface
declare module 'express-session' {
  interface SessionData {
    userId: string
  }
}

// Custom type for async route handlers
type AsyncRequestHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>

const app = express()
const port = 3001

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Middleware
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}))

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    path: '/'
  }
}))

// Auth middleware to check if user is logged in
const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  next()
}

// Routes
const registerHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password, username } = req.body

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' })
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Supabase
    const { data: user, error } = await supabase
      .from('profiles')
      .insert([
        {
          email,
          username,
          password: hashedPassword,
          points: 100 // Starting points
        }
      ])
      .select()
      .single()

    if (error) throw error

    // Set session
    req.session.userId = user.id
    req.session.save()

    res.json({ user: { id: user.id, email: user.email, username: user.username, points: user.points } })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

const loginHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Set session
    req.session.userId = user.id
    req.session.save()

    res.json({ user: { id: user.id, email: user.email, username: user.username, points: user.points } })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

const logoutHandler: RequestHandler = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' })
      return
    }
    res.json({ message: 'Logged out successfully' })
  })
}

const meHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, username, points')
      .eq('id', req.session.userId)
      .single()

    if (error) throw error
    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user data' })
  }
}

const updatePointsHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { points } = req.body
    const userId = req.session.userId

    const { data: user, error } = await supabase
      .from('profiles')
      .update({ points })
      .eq('id', userId)
      .select('id, email, username, points')
      .single()

    if (error) throw error
    res.json({ user })
  } catch (error) {
    console.error('Update points error:', error)
    res.status(500).json({ error: 'Failed to update points' })
  }
}

// Register routes
app.post('/api/auth/register', registerHandler)
app.post('/api/auth/login', loginHandler)
app.post('/api/auth/logout', logoutHandler)
app.get('/api/auth/me', requireAuth, meHandler)
app.put('/api/auth/update-points', requireAuth, updatePointsHandler)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
}) 