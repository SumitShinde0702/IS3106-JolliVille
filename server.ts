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

    res.json({ user: { id: user.id, email: user.email, username: user.username, points: user.points, admin: user.admin } })
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
      .select('id, email, username, points, admin')
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

// **Profile API Routes**
// Update profile
const updateProfileHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { username, email } = req.body
    const userId = req.session.userId

    const { data: user, error } = await supabase
      .from('profiles')
      .update({ username, email })
      .eq('id', userId)
      .select('id, email, username, points')
      .single()

    if (error) throw error
    res.json({ user })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

// Change password
const changePasswordHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.session.userId

    const { data: user, error } = await supabase
      .from('profiles')
      .select('password')
      .eq('id', userId)
      .single()

    if (error || !user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid current password' })
      return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const { data: updatedUser } = await supabase
      .from('profiles')
      .update({ password: hashedPassword })
      .eq('id', userId)
      .select('id, email, username, points')
      .single()


    res.json({ user: updatedUser })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
}

// Sync password from Supabase reset
const syncPasswordHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    res.json({ success: true, message: 'Password synchronized successfully' });
  } catch (error) {
    console.error('Password sync error:', error);
    res.status(500).json({ error: 'Failed to sync password' });
  }
};

// Delete account
const deleteAccountHandler: AsyncRequestHandler = async (req, res) => {
  try {
    const { password } = req.body
    const userId = req.session.userId

    const { data: user, error } = await supabase
      .from('profiles')
      .select('password')
      .eq('id', userId)
      .single()

    if (error || !user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid password' })
      return
    }

    // Delete user from Supabase
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (deleteError) throw deleteError

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to log out after account deletion' })
        return
      }
      res.json({ message: 'Account deleted successfully' })
    })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Failed to delete account' })
  }
}

// Register routes
app.post('/api/auth/register', registerHandler)
app.post('/api/auth/login', loginHandler)
app.post('/api/auth/logout', logoutHandler)
app.get('/api/auth/me', requireAuth, meHandler)
app.put('/api/auth/update-points', requireAuth, updatePointsHandler)

// Profile routes
app.put('/api/auth/update-profile', requireAuth, updateProfileHandler)
app.post('/api/auth/change-password', requireAuth, changePasswordHandler)
app.delete('/api/auth/delete-account', requireAuth, deleteAccountHandler)

// Password reset sync route - no auth required as it's coming from password reset flow
app.post('/api/auth/sync-password', syncPasswordHandler)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
}) 