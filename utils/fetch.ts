import { SERVER_URL } from '@/app/config'
import { toast } from 'sonner'

export const post = async (url = '', body = {}, token = '') => {
  try {
    return await fetch(`${SERVER_URL}${url}`, {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    toast.error('Network error, please try again later.')
  }
}

export const get = async (url = '', token = '') => {
  return token
    ? await fetch(`${SERVER_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    : await fetch(`${SERVER_URL}${url}`)
}
