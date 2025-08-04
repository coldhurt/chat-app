'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { io, Socket } from 'socket.io-client'
import clsx from 'clsx'
import { get } from '@/utils/fetch'
import AddFriend from './AddFriend'
import FriendRequests from './FriendRequests'
import { SERVER_URL } from '../config'
import Button from '@/components/Button'
import Input from '@/components/Input'

interface User {
  _id: string
  username: string
}

interface Message {
  _id: string
  sender: string
  receiver: string
  content: string
  read: boolean
  createdAt: string
}

export default function MessagesPage() {
  const { token, user, logout } = useAuth()
  const [friends, setFriends] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const router = useRouter()
  let messagesRef = useRef<HTMLDivElement>(null)

  const [isTabFocused, setIsTabFocused] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.hidden)
      setIsTabFocused(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Fetch friend list
  useEffect(() => {
    if (!token) return
    get('/api/friends/list', token)
      .then((res) => {
        if (res.status === 401) throw new Error('unauthorized')
        return res.json()
      })
      .then((data) => setFriends(data))
      .catch(() => {
        logout()
        router.push('/login')
      })
  }, [token])

  // Connect socket
  useEffect(() => {
    if (!token) return () => {}
    const socket = io(SERVER_URL.replace('http', 'ws'), {
      auth: { token },
    })

    socket.on('connect_error', (err) => {
      if (err.message.includes('Authentication')) {
        logout()
        router.push('/login')
      }
    })

    socket.on('receive_message', (msg: Message) => {
      if (selectedFriend?._id === msg.sender) {
        setMessages((prev) => [...prev, msg])
        console.log('Received message:', msg, !isTabFocused && Notification.permission === 'granted')
        if (!isTabFocused && Notification.permission === 'granted') {
          new Notification(`New message from ${selectedFriend.username}`, {
            body: msg.content,
            icon: '/vercel.svg', // optional
          })

          // Optional: also blink the tab title
          const originalTitle = document.title
          let blinkInterval = setInterval(() => {
            document.title =
              document.title === 'New Message!' ? originalTitle : 'New Message!'
          }, 1000)

          setTimeout(() => {
            clearInterval(blinkInterval)
            document.title = originalTitle
          }, 5000)
        }
      }
    })

    socket.on('message_sent', (msg: Message) => {
      if (selectedFriend?._id === msg.receiver) {
        setMessages((prev) => [...prev, msg])
      }
    })

    socketRef.current = socket
    return () => socket.disconnect()
  }, [token, selectedFriend])

  // Fetch messages
  useEffect(() => {
    if (!selectedFriend || !token) return

    get(`/api/messages/${selectedFriend._id}`, token)
      .then((res) => res.json())
      .then(setMessages)
  }, [selectedFriend])

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }, [])

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedFriend || !socketRef.current) return
    socketRef.current.emit('send_message', {
      to: selectedFriend._id,
      content: messageInput,
    })
    setMessageInput('')
  }

  return (
    <div className='flex h-screen text-sm max-w-6xl mx-auto'>
      {/* Sidebar */}
      <aside className='w-1/5 min-w-26 border-r p-4 space-y-6 bg-gray-50 dark:bg-gray-800'>
        <div className='space-y-0.5'>Welcome, {user?.username}</div>
        <h2 className='text-xl font-bold'>Friends</h2>
        <div>
          {friends.length ? (
            friends.map((friend) => (
              <div
                key={friend._id}
                className={clsx(
                  'p-3 rounded cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-gray-700',
                  selectedFriend?._id === friend._id &&
                    'bg-white text-blue-500 dark:bg-gray-900'
                )}
                onClick={() => setSelectedFriend(friend)}
              >
                {friend.username}
              </div>
            ))
          ) : (
            <>No friends</>
          )}
        </div>

        <AddFriend />
        <FriendRequests />
      </aside>

      {/* Chat Pane */}
      <main className='flex-1 flex flex-col'>
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <header className='p-4 border-b font-semibold text-lg bg-gray-100 dark:bg-gray-700 dark:text-white'>
              Chat with {selectedFriend.username}
            </header>

            {/* Messages */}
            <section
              ref={messagesRef}
              className='flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-gray-900'
            >
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={clsx(
                    'p-3 rounded-lg max-w-md shadow-sm',
                    msg.sender === user?.user_id
                      ? 'ml-auto bg-blue-500 text-white'
                      : 'mr-auto border border-gray-300 dark:border-gray-700'
                  )}
                >
                  <div className='text-xs opacity-70 mb-1'>
                    {msg.sender === user?.user_id
                      ? 'You'
                      : selectedFriend.username}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))}
            </section>

            {/* Message Input */}
            <footer className='p-4 border-t bg-gray-50 dark:bg-gray-800 flex gap-2 justify-end'>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder='Type a message...'
              />
              <Button onClick={sendMessage}>Send</Button>
            </footer>
          </>
        ) : (
          <div className='flex items-center justify-center flex-1 text-gray-500'>
            Select a friend to start chatting
          </div>
        )}
      </main>
    </div>
  )
}
