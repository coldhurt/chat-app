'use client'

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { post } from '@/utils/fetch'
import Input from '@/components/Input'
import Button from '@/components/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await post('/api/auth/login', { username, password })

    if (res) {
      if (res.ok) {
        const data = await res.json()
        login(data.token)
      } else {
        setError('Login failed. Please check your credentials.')
      }
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
      <div className='w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-2xl p-8'>
        <h1 className='text-3xl font-bold text-center text-gray-800 dark:text-white mb-6'>
          Welcome Back
        </h1>

        {error && (
          <div className='bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm border border-red-300 dark:bg-red-200'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <Input
            label='Username'
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Enter your username'
            required
          />

          <Input
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter your password'
            required
          />

          <Button type='submit' className='w-full'>
            Login
          </Button>
        </form>
      </div>
    </div>
  )
}
