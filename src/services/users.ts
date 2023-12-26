import { type User } from '../types'

export const fetchUsers = async ({ pageParam = 1 }: { pageParam?: number }): Promise<{ nextCursor?: number, users: User[] }> => {
  return await fetch(
    `https://randomuser.me/api?results=10&page=${pageParam}`
  )
    .then(async res => {
      if (!res.ok) throw new Error('Error en la petición')
      return await res.json()
    })
    .then(res => {
      const currentPage = Number(res.info.page)
      const nextCursor = currentPage > 3 ? undefined : currentPage + 1
      return {
        users: res.results,
        nextCursor
      }
    })
}
