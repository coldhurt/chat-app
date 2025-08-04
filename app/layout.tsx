// app/layout.tsx
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Chat App',
  description: 'Chat app with Next.js and Socket.IO',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
