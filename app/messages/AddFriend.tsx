'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { post } from '@/utils/fetch'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ErrorInfo from '@/components/ErrorInfo'

export default function AddFriend() {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const { token } = useAuth()

  const sendRequest = async () => {
    if (!token) return
    const res = await post('/api/friends/add', { target_name: username }, token)
    if (res.ok) {
      setMessage('Request sent!')
      setUsername('')
    } else {
      const data = await res.json()
      setMessage(data.error || 'Failed to send')
    }
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Enter username'
          className='flex-1 w-auto'
        />
        <Button onClick={sendRequest}>Add Friend</Button>
      </div>
      {message && <ErrorInfo message={message} />}
    </>
  )
}
