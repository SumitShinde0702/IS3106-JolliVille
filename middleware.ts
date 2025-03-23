import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Get the pathname
  const path = req.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = ['/village', '/journal', '/wellness', '/avatar', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // Get the session cookie
  const sessionCookie = req.cookies.get('connect.sid')

  if (isProtectedRoute) {
    // If no session cookie, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Validate session with backend
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          Cookie: `connect.sid=${sessionCookie.value}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        // Session is invalid, redirect to login
        return NextResponse.redirect(new URL('/login', req.url))
      }
    } catch (error) {
      // Error checking session, redirect to login for safety
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // If trying to access login/register with valid session
  if (sessionCookie && (path === '/login' || path === '/register')) {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          Cookie: `connect.sid=${sessionCookie.value}`
        },
        credentials: 'include'
      })

      if (response.ok) {
        // Session is valid, redirect to village
        return NextResponse.redirect(new URL('/village', req.url))
      }
    } catch (error) {
      // Error checking session, allow access to login/register
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/village/:path*', '/journal/:path*', '/wellness/:path*', '/avatar/:path*', '/profile/:path*', '/login', '/register']
} 