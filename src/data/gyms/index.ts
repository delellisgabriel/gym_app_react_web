import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export const gymKeys = {
  all: ['gyms'] as const,
  list: () => [...gymKeys.all, 'list'] as const
}

export const useGyms = () => {
  const { status } = useAuth()
  const queryClient = useQueryClient()

  console.log('status: ', status)

  const getAll = useQuery({
    queryKey: gymKeys.list(),
    queryFn: () => apiClient.get('/gyms').then(({ data }) => data),
    enabled: status === 'authenticated'
  })

  const create = useMutation({
    mutationFn: (data: { name: string; address: string }) =>
      apiClient.post('/gyms', data).then(({ data }) => data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymKeys.all })
  })

  return { getAll, create }
}
