import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classKeys } from '../shared'
import { apiClient } from '../../api/client'

export const useClasses = (cursor = 0, limit = 50) => {
  const queryClient = useQueryClient()

  const getAvailable = useQuery({
    queryKey: classKeys.available(cursor, limit),
    queryFn: () =>
      apiClient
        .get(`/classes/available?cursor=${cursor}&limit=${limit}`)
        .then(({ data }) => data)
  })

  const createBatch = useMutation({
    mutationFn: (classes: any[]) =>
      apiClient
        .post('/classes/create', {
          method: 'POST',
          body: JSON.stringify(classes)
        })
        .then(({ data }) => data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classKeys.all })
  })

  return { getAvailable, createBatch }
}
