import { useAuth } from "@/context/AuthContext"
import clsx from "clsx"
import AddFriend from "./AddFriend"
import FriendRequests from "./FriendRequests"

export interface User {
  _id: string
  username: string
}

interface SideBarProps {
  friends: User[]
  selectedFriend: User | null
  setSelectedFriend: (friend: User | null) => void
}

export default function SideBar({friends, selectedFriend, setSelectedFriend }: SideBarProps) {
  const {user} = useAuth()
  return <aside className='w-1/5 min-w-26 border-r p-4 space-y-6 bg-gray-50 dark:bg-gray-800'>
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
}