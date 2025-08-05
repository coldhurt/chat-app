'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'
import { get } from '@/utils/fetch'
import Button from '@/components/Button'
import Input from '@/components/Input'
import SideBar, { User } from './SideBar'
import { useSocket } from '@/hooks/useSocket'

export default function MessagesPage() {
  const { token, user, logout } = useAuth()
  const [friends, setFriends] = useState<User[]>([])
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const router = useRouter()
  let messagesRef = useRef<HTMLDivElement>(null)

  const { messages, setMessages, sendMessage } = useSocket({ selectedFriend })

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

  const onSendMessage = () => {
    if (!messageInput.trim() || !selectedFriend) return
    sendMessage(selectedFriend._id, messageInput)
    setMessageInput('')
  }

  return (
    <>
      <div className='flex h-screen text-sm max-w-6xl mx-auto'>
        <SideBar
          friends={friends}
          setSelectedFriend={setSelectedFriend}
          selectedFriend={selectedFriend}
        />

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
                  onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                  placeholder='Type a message...'
                />
                <Button onClick={onSendMessage}>Send</Button>
              </footer>
            </>
          ) : (
            <div className='flex items-center justify-center flex-1 text-gray-500'>
              Select a friend to start chatting
            </div>
          )}
        </main>
      </div>
    </>
  )
}
