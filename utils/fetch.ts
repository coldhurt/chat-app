import { SERVER_URL } from "@/app/config"

export const post = async (url = '', body = {}, token = '') => {
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
