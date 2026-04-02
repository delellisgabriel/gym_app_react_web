export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  list: (gymId?: number) => [...userKeys.all, 'list', gymId] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const
}

export const classKeys = {
  all: ['classes'] as const,
  available: (cursor?: number, limit?: number) =>
    [...classKeys.all, 'available', cursor, limit] as const
}

export const bookingKeys = {
  all: ['bookings'] as const,
  mine: () => [...bookingKeys.all, 'me'] as const
}

export const trainerKeys = {
  all: ['trainers'] as const,
  list: () => [...trainerKeys.all, 'list'] as const
}
