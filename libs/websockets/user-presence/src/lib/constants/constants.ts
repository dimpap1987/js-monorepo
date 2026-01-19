export const Events = {
  onlineUsers: 'events:online-users',
  announcements: 'events:announcements',
  refreshSession: 'events:refresh-session',
  bookingUpdate: 'events:booking-update',
  scheduleCancelled: 'events:schedule-cancelled',
  classInvitation: 'events:class-invitation',
} as const

export const Rooms = {
  admin: 'admin-room',
  organizer: (organizerId: number) => `organizer-${organizerId}`,
  participant: (participantId: number) => `participant-${participantId}`,
} as const
