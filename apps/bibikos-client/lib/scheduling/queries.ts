import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { useSession } from '@js-monorepo/auth/next/client'
import type {
  AppUser,
  UpdateAppUserPayload,
  OrganizerProfile,
  CreateOrganizerPayload,
  UpdateOrganizerPayload,
  OrganizerPublicProfile,
  ParticipantProfile,
  Location,
  CreateLocationPayload,
  UpdateLocationPayload,
  Class,
  CreateClassPayload,
  UpdateClassPayload,
  ClassSchedule,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  CancelSchedulePayload,
  DiscoverSchedule,
  DiscoverFilters,
  Booking,
  BookingListResponse,
  MyBookingsResponse,
  CreateBookingPayload,
  CancelBookingPayload,
  MarkAttendancePayload,
  UpdateBookingNotesPayload,
} from './types'

// =============================================================================
// Query Keys
// =============================================================================

export const schedulingKeys = {
  all: ['scheduling'] as const,
  appUser: () => [...schedulingKeys.all, 'app-user'] as const,
  organizer: () => [...schedulingKeys.all, 'organizer'] as const,
  organizerPublic: (slug: string) => [...schedulingKeys.all, 'organizer', 'public', slug] as const,
  participant: () => [...schedulingKeys.all, 'participant'] as const,
  locations: () => [...schedulingKeys.all, 'locations'] as const,
  location: (id: number) => [...schedulingKeys.all, 'locations', id] as const,
  classes: () => [...schedulingKeys.all, 'classes'] as const,
  class: (id: number) => [...schedulingKeys.all, 'classes', id] as const,
  classPublic: (id: number) => [...schedulingKeys.all, 'classes', 'public', id] as const,
  schedules: () => [...schedulingKeys.all, 'schedules'] as const,
  schedulesCalendar: (startDate: string, endDate: string, classId?: number) =>
    [...schedulingKeys.all, 'schedules', 'calendar', startDate, endDate, classId] as const,
  schedulesUpcoming: (classId: number) => [...schedulingKeys.all, 'schedules', 'upcoming', classId] as const,
  schedule: (id: number) => [...schedulingKeys.all, 'schedules', id] as const,
  schedulePublic: (id: number) => [...schedulingKeys.all, 'schedules', 'public', id] as const,
  bookings: () => [...schedulingKeys.all, 'bookings'] as const,
  bookingsForSchedule: (scheduleId: number) => [...schedulingKeys.all, 'bookings', 'schedule', scheduleId] as const,
  myBookings: () => [...schedulingKeys.all, 'bookings', 'my'] as const,
  discover: (filters: DiscoverFilters) =>
    [
      ...schedulingKeys.all,
      'discover',
      filters.startDate,
      filters.endDate,
      filters.activity,
      filters.timeOfDay,
      filters.search,
    ] as const,
}

// =============================================================================
// App User Hooks
// Note: AppUser data is now included in the session response (session.appUser)
// Use useSession() from @js-monorepo/auth/next/client to access it
// =============================================================================

export function useUpdateAppUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateAppUserPayload) => {
      const response = await apiClient.patch<AppUser>('/scheduling/app-users/me', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      // Invalidate session to refresh scheduling data
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

// =============================================================================
// Onboarding Hooks
// =============================================================================

export interface CompleteOnboardingPayload {
  organizer: CreateOrganizerPayload
  location: CreateLocationPayload
  class: Omit<CreateClassPayload, 'locationId'>
}

export interface CompleteOnboardingResponse {
  organizer: OrganizerProfile
  location: Location
  class: Class
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CompleteOnboardingPayload) => {
      const response = await apiClient.post<CompleteOnboardingResponse>('/scheduling/onboarding/complete', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: schedulingKeys.organizer() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.locations() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.classes() })
      // Invalidate session to refresh scheduling data
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

// =============================================================================
// Organizer Hooks
// =============================================================================

export function useOrganizer() {
  const { session } = useSession()
  const hasOrganizerProfile = session?.appUser?.hasOrganizerProfile ?? false

  return useQuery({
    queryKey: schedulingKeys.organizer(),
    queryFn: async () => {
      const response = await apiClient.get<OrganizerProfile | null>('/scheduling/organizers/me')
      return handleQueryResponse(response)
    },
    enabled: hasOrganizerProfile,
  })
}

export function useCreateOrganizer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateOrganizerPayload) => {
      const response = await apiClient.post<OrganizerProfile>('/scheduling/organizers', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.organizer() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.appUser() })
    },
  })
}

export function useUpdateOrganizer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateOrganizerPayload) => {
      const response = await apiClient.patch<OrganizerProfile>('/scheduling/organizers/me', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.organizer() })
    },
  })
}

export function useOrganizerPublicProfile(slug: string) {
  return useQuery({
    queryKey: schedulingKeys.organizerPublic(slug),
    queryFn: async () => {
      const response = await apiClient.get<OrganizerPublicProfile>(`/scheduling/organizers/public/${slug}`)
      return handleQueryResponse(response)
    },
    enabled: !!slug,
  })
}

export function useOrganizerPublicSchedules(slug: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...schedulingKeys.organizerPublic(slug), 'schedules', startDate, endDate] as const,
    queryFn: async () => {
      const response = await apiClient.get<ClassSchedule[]>(
        `/scheduling/organizers/public/${slug}/schedules?startDate=${startDate}&endDate=${endDate}`
      )
      return handleQueryResponse(response)
    },
    enabled: !!slug && !!startDate && !!endDate,
  })
}

export function useDiscoverSchedules(filters: DiscoverFilters) {
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
  })
  if (filters.activity) params.append('activity', filters.activity)
  if (filters.timeOfDay) params.append('timeOfDay', filters.timeOfDay)
  if (filters.search) params.append('search', filters.search)

  return useQuery({
    queryKey: schedulingKeys.discover(filters),
    queryFn: async () => {
      const response = await apiClient.get<DiscoverSchedule[]>(`/scheduling/schedules/discover?${params.toString()}`)
      return handleQueryResponse(response)
    },
    enabled: !!filters.startDate && !!filters.endDate,
  })
}

export function useCheckSlugAvailability() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await apiClient.get<{ available: boolean }>(`/scheduling/organizers/slug-check?slug=${slug}`)
      return handleQueryResponse(response)
    },
  })
}

// =============================================================================
// Participant Hooks
// =============================================================================

export function useParticipant() {
  return useQuery({
    queryKey: schedulingKeys.participant(),
    queryFn: async () => {
      const response = await apiClient.get<ParticipantProfile | null>('/scheduling/participants/me')
      return handleQueryResponse(response)
    },
  })
}

// =============================================================================
// Location Hooks
// =============================================================================

export function useLocations(includeInactive = false) {
  return useQuery({
    queryKey: [...schedulingKeys.locations(), includeInactive],
    queryFn: async () => {
      const url = includeInactive ? '/scheduling/locations?includeInactive=true' : '/scheduling/locations'
      const response = await apiClient.get<Location[]>(url)
      return handleQueryResponse(response)
    },
  })
}

export function useLocation(id: number) {
  return useQuery({
    queryKey: schedulingKeys.location(id),
    queryFn: async () => {
      const response = await apiClient.get<Location>(`/scheduling/locations/${id}`)
      return handleQueryResponse(response)
    },
    enabled: !!id,
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateLocationPayload) => {
      const response = await apiClient.post<Location>('/scheduling/locations', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.locations() })
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateLocationPayload & { id: number }) => {
      const response = await apiClient.patch<Location>(`/scheduling/locations/${id}`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.locations() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.location(variables.id) })
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/scheduling/locations/${id}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.locations() })
    },
  })
}

// =============================================================================
// Class Hooks
// =============================================================================

export function useClasses(includeInactive = false) {
  return useQuery({
    queryKey: [...schedulingKeys.classes(), includeInactive],
    queryFn: async () => {
      const url = includeInactive ? '/scheduling/classes?includeInactive=true' : '/scheduling/classes'
      const response = await apiClient.get<Class[]>(url)
      return handleQueryResponse(response)
    },
  })
}

export function useClass(id: number) {
  return useQuery({
    queryKey: schedulingKeys.class(id),
    queryFn: async () => {
      const response = await apiClient.get<Class>(`/scheduling/classes/${id}`)
      return handleQueryResponse(response)
    },
    enabled: !!id,
  })
}

export function useClassPublic(id: number) {
  return useQuery({
    queryKey: schedulingKeys.classPublic(id),
    queryFn: async () => {
      const response = await apiClient.get<Class>(`/scheduling/classes/${id}/public`)
      return handleQueryResponse(response)
    },
    enabled: !!id,
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateClassPayload) => {
      const response = await apiClient.post<Class>('/scheduling/classes', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.classes() })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateClassPayload & { id: number }) => {
      const response = await apiClient.patch<Class>(`/scheduling/classes/${id}`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.classes() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.class(variables.id) })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/scheduling/classes/${id}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.classes() })
    },
  })
}

// =============================================================================
// Schedule Hooks
// =============================================================================

export function useSchedulesCalendar(startDate: string, endDate: string, classId?: number) {
  return useQuery({
    queryKey: schedulingKeys.schedulesCalendar(startDate, endDate, classId),
    queryFn: async () => {
      let url = `/scheduling/schedules/calendar?startDate=${startDate}&endDate=${endDate}`
      if (classId) url += `&classId=${classId}`
      const response = await apiClient.get<ClassSchedule[]>(url)
      return handleQueryResponse(response)
    },
    enabled: !!startDate && !!endDate,
  })
}

export function useUpcomingSchedules(classId: number, limit = 10) {
  return useQuery({
    queryKey: schedulingKeys.schedulesUpcoming(classId),
    queryFn: async () => {
      const response = await apiClient.get<ClassSchedule[]>(
        `/scheduling/schedules/class/${classId}/upcoming?limit=${limit}`
      )
      return handleQueryResponse(response)
    },
    enabled: !!classId,
  })
}

export function useSchedule(id: number) {
  return useQuery({
    queryKey: schedulingKeys.schedule(id),
    queryFn: async () => {
      const response = await apiClient.get<ClassSchedule>(`/scheduling/schedules/${id}`)
      return handleQueryResponse(response)
    },
    enabled: !!id,
  })
}

export function useSchedulePublic(id: number) {
  return useQuery({
    queryKey: schedulingKeys.schedulePublic(id),
    queryFn: async () => {
      const response = await apiClient.get<ClassSchedule>(`/scheduling/schedules/${id}/public`)
      return handleQueryResponse(response)
    },
    enabled: !!id,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateSchedulePayload) => {
      const response = await apiClient.post<ClassSchedule[]>('/scheduling/schedules', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      // Invalidate all schedule-related queries including calendar views
      // Using refetchType: 'all' to ensure immediate refetch
      queryClient.invalidateQueries({
        queryKey: ['scheduling', 'schedules'],
        refetchType: 'all',
      })
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateSchedulePayload & { id: number }) => {
      const response = await apiClient.patch<ClassSchedule>(`/scheduling/schedules/${id}`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduling', 'schedules'],
        refetchType: 'all',
      })
    },
  })
}

export function useCancelSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: CancelSchedulePayload & { id: number }) => {
      const response = await apiClient.post(`/scheduling/schedules/${id}/cancel`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduling', 'schedules'],
        refetchType: 'all',
      })
    },
  })
}

export function useDeleteFutureSchedules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<{ deleted: number }>(`/scheduling/schedules/${id}/future`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduling', 'schedules'],
        refetchType: 'all',
      })
    },
  })
}

export function useCancelSeriesSchedules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: CancelSchedulePayload & { id: number }) => {
      const response = await apiClient.post<{ cancelled: number }>(`/scheduling/schedules/${id}/cancel-series`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduling', 'schedules'],
        refetchType: 'all',
      })
    },
  })
}

// =============================================================================
// Booking Hooks
// =============================================================================

export function useBookingsForSchedule(scheduleId: number) {
  return useQuery({
    queryKey: schedulingKeys.bookingsForSchedule(scheduleId),
    queryFn: async () => {
      const response = await apiClient.get<BookingListResponse>(`/scheduling/bookings/schedule/${scheduleId}`)
      return handleQueryResponse(response)
    },
    enabled: !!scheduleId,
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: schedulingKeys.myBookings(),
    queryFn: async () => {
      const response = await apiClient.get<MyBookingsResponse>('/scheduling/bookings/my')
      return handleQueryResponse(response)
    },
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const response = await apiClient.post<Booking>('/scheduling/bookings', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.myBookings() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules() })
      // Also invalidate discover to update booking counts
      queryClient.invalidateQueries({ queryKey: [...schedulingKeys.all, 'discover'] })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: CancelBookingPayload & { id: number }) => {
      const response = await apiClient.post(`/scheduling/bookings/${id}/cancel`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.myBookings() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules() })
      // Also invalidate discover to update booking counts
      queryClient.invalidateQueries({ queryKey: [...schedulingKeys.all, 'discover'] })
    },
  })
}

export function useCancelBookingByOrganizer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: CancelBookingPayload & { id: number }) => {
      const response = await apiClient.post(`/scheduling/bookings/${id}/cancel-by-organizer`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules() })
    },
  })
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: MarkAttendancePayload) => {
      const response = await apiClient.post<{ updated: number }>('/scheduling/bookings/attendance', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.bookings() })
    },
  })
}

export function useUpdateBookingNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateBookingNotesPayload & { id: number }) => {
      const response = await apiClient.patch<Booking>(`/scheduling/bookings/${id}/notes`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.bookings() })
    },
  })
}
