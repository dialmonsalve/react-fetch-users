import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchUsers } from '../services/users'
import { type User } from '../types'

export const useUsers = () => {
  const { isLoading, isError, data, refetch, fetchNextPage, hasNextPage } = useInfiniteQuery<{ nextCursor: number, users: User[] }>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false
  })
  return {
    isLoading,
    isError,
    hasNextPage,
    users: data?.pages.flatMap(page => page.users) ?? [],
    refetch,
    fetchNextPage
  }
}
