import { useQuery } from '@tanstack/react-query'
import { trainerKeys } from '../shared'
import { apiClient } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export const useTrainers = () => {
  const { status } = useAuth()

  const getAll = useQuery({
    queryKey: trainerKeys.list(),
    queryFn: () => apiClient.get('/trainers').then(({ data }) => data),
    enabled: status === 'authenticated',
  })

  return { getAll }
}
