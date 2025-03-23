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
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Failed to sign in' }
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