'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { get, post } from '@/utils/fetch'

interface Request {
  _id: string
  username: string
}

export default function FriendRequests() {
  const { token } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])

  const fetchRequests = async () => {
    if (!token) return
    const res = await get('/api/friends/requests', token)
    const data = await res.json()
    setRequests(data.requests)
  }

  useEffect(() => {
    let inter = setInterval(fetchRequests, 1000)
    return () => clearInterval(inter)
  }, [])

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    if (!token) return
    await post(`/api/friends/${action}`, { sender_id: id }, token)
    fetchRequests()
  }

  return (
    <div className='space-y-2'>
      <h2 className='text-lg font-bold'>Pending Requests</h2>
      {requests.map((r) => (
        <div
          key={r._id}
          className='flex justify-between items-center p-2 rounded'
        >
          <span>{r.username}</span>
          <div className='space-x-2'>
            <button
              className='text-green-600'
              onClick={() => handleAction(r._id, 'accept')}
            >
              Accept
            </button>
            <button
              className='text-red-600'
              onClick={() => handleAction(r._id, 'reject')}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
