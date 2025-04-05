import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const API_URL = 'http://localhost:3001/api'

interface ApiError {
  error: string
}

interface ApiResponse<T> {
  user: T
}

export interface User {
  id: string
  email: string
  username: string
  points: number
  admin: boolean
}

export async function signUp(email: string, password: string, username: string) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, username }),
    })

    if (!response.ok) {
      const error = await response.json() as ApiError
      throw new Error(error.error || 'Failed to sign up')
    }

    const data = await response.json() as ApiResponse<User>
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Failed to sign up' }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json() as ApiError
      throw new Error(error.error || 'Failed to sign in')
    }

    const data = await response.json() as ApiResponse<User>
    return { 
      user: {
        ...data.user, 
        admin: data.user.admin
      }, 
      error: null 
    };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Failed to sign in' }
  }
}

export async function resetPassword(email: string) {
  try {
    const supabase = createClientComponentClient()
    
    // Get the origin with protocol (e.g., http://localhost:3000)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectUrl = `${origin}/reset-password`
    
    console.log('Sending password reset to email:', email)
    console.log('Using redirect URL:', redirectUrl)
    
    // Make sure this URL is added in Supabase Dashboard under:
    // Authentication > URL Configuration > Redirect URLs
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })

    if (error) {
      console.error('Error sending reset email:', error.message)
      throw error
    }

    console.log('Password reset email sent successfully')
    return { data: true, error: null }
  } catch (error) {
    console.error('Reset password error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to send password reset email' 
    }
  }
}

export async function updatePassword(password: string) {
  try {
    const supabase = createClientComponentClient()
    
    // Log current auth session for debugging
    const { data: sessionData } = await supabase.auth.getSession()
    console.log('Current session before update:', !!sessionData.session)
    
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      console.error('Update user error:', error)
      throw error
    }

    // Just in case, also try the deprecated method if available
    try {
      // @ts-ignore - This is for compatibility with older versions
      if (typeof supabase.auth.update === 'function') {
        // @ts-ignore
        await supabase.auth.update({ password })
      }
    } catch (err) {
      console.log('Ignored legacy update error:', err)
      // Ignore error from this fallback attempt
    }

    return { data: true, error: null }
  } catch (error) {
    console.error('Update password error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update password' 
    }
  }
}

export async function signOut() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to sign out')
    }

    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to sign out' }
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Not authenticated')
    }

    const data = await response.json() as ApiResponse<User>

    console.log("Fetched user:", data.user);
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Failed to get user' }
  }
}

export async function updateUserPoints(userId: string, points: number) {
  try {
    const response = await fetch(`${API_URL}/auth/update-points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ points }),
    })

    if (!response.ok) {
      throw new Error('Failed to update points')
    }

    const data = await response.json() as ApiResponse<User>
    return { data: data.user, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to update points' }
  }
} 