'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  exp?: number
  [key: string]: any
}

interface User {
  user_id: string
  username: string
}

interface AuthContextType {
  token: string | null
  user: User | null
  login: (token: string) => void
  logout: () => void
  getTokenData: () => JwtPayload | false
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Check if token is expired or invalid
  const getTokenData = (t = token) => {
    if (!t) return false
    try {
      const decoded = jwtDecode<JwtPayload>(t)
      if (!decoded.exp) return false
      return decoded.exp * 1000 > Date.now() ? decoded : false
    } catch {
      return false
    }
  }

  // On mount, check stored token validity
  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (!stored) logout()
    try {
      const data = getTokenData(stored)
      if (data) {
        setToken(stored)
        setUser({ user_id: data.user_id, username: data.username })
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }, [router])

  const login = (newToken: string) => {
    if (getTokenData(newToken)) {
      localStorage.setItem('token', newToken)
      setToken(newToken)
      router.push('/messages')
    } else {
      logout()
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, getTokenData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
