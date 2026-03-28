import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingKeys, classKeys } from '../shared'
import { apiClient } from '../../api/client'

export const useBookings = () => {
  const queryClient = useQueryClient()

  const getMine = useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: () =>
      apiClient.get('/bookings/me?cursor=0&limit=50').then((r) => r.data)
  })

  const create = useMutation({
    mutationFn: (classId: number) =>
      apiClient.post('/bookings', { class_id: classId }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    }
  })

  const cancel = useMutation({
    mutationFn: (bookingId: number) =>
      apiClient.delete(`/bookings/${bookingId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    }
  })

  return { getMine, create, cancel }
}
