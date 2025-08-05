'use client'

import { SERVER_URL } from '@/app/config'
import { User } from '@/app/messages/SideBar'
import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface Message {
  _id: string
  sender: string
  receiver: string
  content: string
  read: boolean
  createdAt: string
}

export const useSocket = ({
  selectedFriend,
}: {
  selectedFriend: User | null
}) => {
  const socketRef = useRef<Socket | null>(null)
  const { token, logout } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
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

  // Connect socket
  useEffect(() => {
    if (!token) return () => {}
    const socket = io(SERVER_URL.replace('http', 'ws'), {
      auth: { token },
    })

    socket.on('connect_error', (err) => {
      if (err.message.includes('Authentication')) {
        logout()
        redirect('/login')
      } else {
        console.error('Socket connection error:', err)
      }
    })

    socket.on('receive_message', (msg: Message) => {
      if (selectedFriend?._id === msg.sender) {
        setMessages((prev) => [...prev, msg])
        console.log(
          'Received message:',
          msg,
          !isTabFocused && Notification.permission === 'granted'
        )
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

  const sendMessage = (to: string, content: string) => {
    if (socketRef.current)
      socketRef.current.emit('send_message', {
        to: to,
        content,
      })
  }

  return {
    messages,
    setMessages,
    sendMessage,
  }
}
