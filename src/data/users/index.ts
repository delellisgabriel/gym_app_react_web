import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userKeys } from '../shared'
import { apiClient } from '../../api/client'

export const useUsers = (gymId?: number, userId?: number) => {
  const queryClient = useQueryClient()

  const getMe = useQuery({
    queryKey: userKeys.me(),
    queryFn: () => apiClient.get('/users/me').then(({ data }) => data)
  })

  const getAll = useQuery({
    queryKey: userKeys.list(gymId),
    queryFn: () =>
      apiClient
        .get(`/users${gymId ? `?gym_id=${gymId}` : ''}`)
        .then(({ data }) => data)
  })

  const getById = useQuery({
    queryKey: userKeys.detail(userId!),
    queryFn: () => apiClient.get(`/users/${userId}`).then(({ data }) => data),
    enabled: !!userId
  })

  const create = useMutation({
    mutationFn: (body: {
      gym_id: number
      name: string
      email: string
      phone?: string
    }) => apiClient.post('/users', body).then(({ data }) => data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all })
  })

  const update = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: number
      name: string
      email: string
      phone?: string
    }) => apiClient.put(`/users/${id}`, body).then(({ data }) => data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
    }
  })

  const remove = useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/users/${id}`).then(({ data }) => data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all })
  })

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      apiClient.patch(`/users/${id}/role`, { role }).then(({ data }) => data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
    }
  })

  return { getMe, getAll, getById, create, update, remove, changeRole }
}
