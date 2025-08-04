'use client'

import { useState } from 'react'
import { post } from '@/utils/fetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { redirect } from 'next/navigation'
import ErrorInfo from '@/components/ErrorInfo'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await post('/api/auth/register', { username, password })

    if (res.ok) {
      redirect('/login')
    } else {
      setError('Register failed')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
      <div className='w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-2xl p-8'>
        <h1 className='text-3xl font-bold text-center text-gray-800 dark:text-white mb-6'>
          Register
        </h1>

        {error && (
          <ErrorInfo message={error} />
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
            Register
          </Button>
        </form>
      </div>
    </div>
  )
}
