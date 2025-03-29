'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check for PASSWORD_RECOVERY event and URL
  useEffect(() => {
    const checkForToken = async () => {
      // Log hash for debugging
      console.log('URL hash:', window.location.hash);
      console.log('URL search:', window.location.search);
      console.log('Full URL:', window.location.href);
      
      // Try to extract the token from the full URL
      let fullUrlToken = null;
      try {
        // Some email clients might mess with the URL encoding, try to extract from the full URL
        const fullUrl = window.location.href;
        if (fullUrl.includes('access_token=')) {
          const tokenStart = fullUrl.indexOf('access_token=') + 'access_token='.length;
          const tokenEnd = fullUrl.indexOf('&', tokenStart);
          if (tokenEnd > tokenStart) {
            fullUrlToken = fullUrl.substring(tokenStart, tokenEnd);
          } else {
            fullUrlToken = fullUrl.substring(tokenStart);
          }
          console.log('Extracted token from full URL:', !!fullUrlToken);
        }
      } catch (err) {
        console.error('Error parsing full URL:', err);
      }
      
      // If we found a token in the full URL, set the session
      if (fullUrlToken) {
        try {
          console.log('Setting session with token from full URL');
          const { error } = await supabase.auth.setSession({
            access_token: fullUrlToken,
            refresh_token: '',
          });
          
          if (error) {
            console.error('Error setting session with full URL token:', error);
          } else {
            console.log('Session set successfully with full URL token');
            setIsPasswordRecovery(true);
            return; // Skip the rest of the token checks
          }
        } catch (err) {
          console.error('Error setting session with full URL token:', err);
        }
      }
      
      // Continue with normal hash fragment and URL params checks
      const hasHashFragment = window.location.hash && 
        (window.location.hash.includes('access_token=') || 
         window.location.hash.includes('type=recovery'));
      
      const urlParams = new URLSearchParams(window.location.search);
      const hasTokenInParams = urlParams.has('token') || urlParams.has('access_token');
      
      console.log('Has hash fragment:', hasHashFragment);
      console.log('Has token in params:', hasTokenInParams);
      
      // Attempt to extract and use the token directly
      let accessToken = null;
      
      if (hasHashFragment) {
        try {
          // Extract the access token from the URL hash
          const hashParts = window.location.hash.substring(1).split('&');
          for (const part of hashParts) {
            if (part.startsWith('access_token=')) {
              accessToken = part.split('=')[1];
              break;
            }
          }
          
          if (accessToken) {
            console.log('Found access token in hash, setting session');
            
            // Set the access token directly to the auth session
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: '', // This might be optional for password reset
            });
            
            if (error) {
              console.error('Error setting session:', error);
            } else {
              console.log('Session set successfully');
              setIsPasswordRecovery(true);
            }
          }
        } catch (err) {
          console.error('Error parsing hash params:', err);
        }
      }
      
      // For URL parameters
      if (!accessToken && hasTokenInParams) {
        const token = urlParams.get('token') || urlParams.get('access_token');
        if (token) {
          console.log('Found token in URL params, setting session');
          
          // Set the access token directly to the auth session
          const { error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: '', // This might be optional for password reset
          });
          
          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Session set successfully');
            setIsPasswordRecovery(true);
          }
        }
      }
      
      // As a fallback, check the current session status
      if (!accessToken) {
        const { data } = await supabase.auth.getSession();
        console.log('Current auth session:', !!data.session);
        
        // If we already have a session, we can assume recovery is possible
        if (data.session) {
          setIsPasswordRecovery(true);
        }
      }
    };
    
    checkForToken();
    
    const handleAuthStateChange = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, !!session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => {
      handleAuthStateChange.data.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Form validation
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    // For simple form validation
    setIsValid(password.length >= 8 && password === confirmPassword)
  }, [password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Additional validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      // Try all possible methods to ensure the password update works
      
      // Method 1: Standard Supabase direct update - this works if the session is properly set
      console.log('Attempting standard password update...');
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session before password update:', !!sessionData.session);
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        console.error('Standard update error:', updateError.message);
        
        // Method 2: Try to parse the recovery token from URL again and use it explicitly
        console.log('Attempting recovery with URL token...');
        
        // Try to extract token from various places
        let token = null;
        
        // From hash
        if (window.location.hash.includes('access_token=')) {
          const hashParts = window.location.hash.substring(1).split('&');
          for (const part of hashParts) {
            if (part.startsWith('access_token=')) {
              token = part.split('=')[1];
              break;
            }
          }
        }
        
        // From URL params
        if (!token) {
          const urlParams = new URLSearchParams(window.location.search);
          token = urlParams.get('token') || urlParams.get('access_token');
        }
        
        // From full URL
        if (!token && window.location.href.includes('access_token=')) {
          const fullUrl = window.location.href;
          const tokenStart = fullUrl.indexOf('access_token=') + 'access_token='.length;
          const tokenEnd = fullUrl.indexOf('&', tokenStart);
          if (tokenEnd > tokenStart) {
            token = fullUrl.substring(tokenStart, tokenEnd);
          } else {
            token = fullUrl.substring(tokenStart);
          }
        }
        
        if (token) {
          console.log('Found token for recovery, setting session and trying update again');
          
          // Set the session with the token
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });
          
          if (sessionError) {
            console.error('Error setting session for recovery:', sessionError);
            throw new Error('Could not authenticate for password reset: ' + sessionError.message);
          }
          
          // Try update again with the set session
          const { error: retryError } = await supabase.auth.updateUser({
            password: password
          });
          
          if (retryError) {
            console.error('Retry update error:', retryError);
            throw new Error('Failed to update password: ' + retryError.message);
          }
        } else {
          throw new Error('Authentication token not found. Please request a new password reset link.');
        }
      }
      
      console.log('Password updated successfully in Supabase');
      
      // Sync the password change with Express backend
      try {
        const userEmail = sessionData?.session?.user?.email;
        if (userEmail) {
          console.log('Syncing password change with Express backend for:', userEmail);
          
          const response = await fetch('http://localhost:3001/api/auth/sync-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
              email: userEmail,
              password: password,
              supabase_token: sessionData.session?.access_token // Send the Supabase token for verification
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.warn('Note: Express sync failed, but Supabase update succeeded:', errorData);
            // We continue anyway since Supabase update worked
          } else {
            console.log('Password successfully synced with Express backend');
          }
        }
      } catch (syncErr) {
        console.warn('Express sync attempt failed, but continuing:', syncErr);
        // Non-blocking - we continue even if sync fails
      }
      
      // IMPORTANT: Sign out the user completely to invalidate the old session
      console.log('Signing out user to invalidate old session...');
      await supabase.auth.signOut();
      
      setIsSubmitted(true);
      
      // In production, we would redirect to login after some time
      setTimeout(() => {
        console.log('Redirecting to login page...');
        // Force a complete page reload to clear any cached state
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      console.error('Password update failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 }
  }

  // Add a debug function to manually attempt setting the session from the URL
  const debugSetSession = async () => {
    try {
      // Clear any existing errors first
      setError(null);
      
      console.log('Manually attempting to parse and set session token');
      
      // Try to extract token from various places
      let token = null;
      
      // From hash
      if (window.location.hash.includes('access_token=')) {
        const hashParts = window.location.hash.substring(1).split('&');
        for (const part of hashParts) {
          if (part.startsWith('access_token=')) {
            token = decodeURIComponent(part.split('=')[1]);
            break;
          }
        }
      }
      
      // From URL params
      if (!token) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token') || urlParams.get('access_token');
        if (token) token = decodeURIComponent(token);
      }
      
      // From full URL
      if (!token && window.location.href.includes('access_token=')) {
        const fullUrl = window.location.href;
        const tokenStart = fullUrl.indexOf('access_token=') + 'access_token='.length;
        const tokenEnd = fullUrl.indexOf('&', tokenStart);
        if (tokenEnd > tokenStart) {
          token = decodeURIComponent(fullUrl.substring(tokenStart, tokenEnd));
        } else {
          token = decodeURIComponent(fullUrl.substring(tokenStart));
        }
      }
      
      if (token) {
        console.log('Found token, attempting to set session');
        
        // Set the session with the token
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });
        
        if (error) {
          console.error('Error setting session:', error);
          setError(`Failed to set session: ${error.message}`);
        } else {
          console.log('Session set successfully');
          setIsPasswordRecovery(true);
        }
      } else {
        setError('No token found in URL. Please use the reset link from your email.');
      }
    } catch (err) {
      console.error('Error in debug function:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100"></div>
        <Image
          src="/village-items/decor/greenery_10.png"
          alt="Background Greenery"
          fill
          className="object-cover opacity-10"
        />
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-20 left-20"
          animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }} 
          transition={{ repeat: Infinity, duration: 8 }}
        >
          <Image 
            src="/village-items/houses/15.png" 
            alt="Village House" 
            width={170} 
            height={170} 
            className="opacity-25"
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-20 left-40"
          animate={{ y: [0, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 6, delay: 1.2 }}
        >
          <Image 
            src="/village-items/decor/tree_8.png" 
            alt="Tree" 
            width={120} 
            height={120}
            className="opacity-30"
          />
        </motion.div>
        
        <motion.div 
          className="absolute top-32 right-20"
          animate={{ y: [0, -7, 0], rotate: [0, -1, 0] }} 
          transition={{ repeat: Infinity, duration: 7, delay: 0.5 }}
        >
          <Image 
            src="/village-items/tents/2.png" 
            alt="Tent" 
            width={140} 
            height={140}
            className="opacity-30"
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 right-32"
          animate={{ y: [0, -4, 0], rotate: [0, 1, 0] }} 
          transition={{ repeat: Infinity, duration: 5, delay: 0.8 }}
        >
          <Image 
            src="/village-items/decor/decor_5.png" 
            alt="Decoration" 
            width={80} 
            height={80}
            className="opacity-40"
          />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 right-1/4"
          animate={{ opacity: [0.3, 0.5, 0.3] }} 
          transition={{ repeat: Infinity, duration: 8 }}
        >
          <Image 
            src="/village-items/decor/stones_4.png" 
            alt="Stones" 
            width={60} 
            height={60}
            className="opacity-30"
          />
        </motion.div>
      </div>
      
      {/* Main content */}
      <motion.div 
        className="max-w-md w-full z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-purple-100"
        >
          {!isPasswordRecovery && !isSubmitted && (
            <motion.div 
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h3>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Please request a new password reset link from the login page.
              </p>
              <div className="flex flex-col space-y-3">
                <motion.div
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link href="/forgot-password" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    Request New Link
                  </Link>
                </motion.div>
                
                <motion.div
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <button 
                    onClick={debugSetSession}
                    className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try to Fix Link
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {isPasswordRecovery && !isSubmitted && (
            <>
              <motion.div variants={itemVariants} className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
                  Reset Your Password
                </h2>
                <p className="text-gray-600">Create a new password for your JolliVille account</p>
              </motion.div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-purple-200 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                    placeholder="Create a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters
                  </p>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-purple-200 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </motion.div>

                {error && (
                  <motion.div 
                    variants={itemVariants}
                    className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading || !isValid}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    ) : 'Reset Password'}
                  </motion.button>
                </motion.div>
              </form>
            </>
          )}
          
          {isSubmitted && (
            <motion.div 
              variants={itemVariants} 
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Password Updated!</h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                You'll be redirected to the login page shortly...
              </p>
              <motion.div
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <Link href="/login" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Login Now
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
} 