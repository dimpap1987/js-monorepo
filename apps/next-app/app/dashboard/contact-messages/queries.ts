import { ContactMessageDto, ContactStatus, PaginationType } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

type ContactMessagesResponse = PaginationType<ContactMessageDto>

const fetchContactMessages = async (searchParams?: string): Promise<ContactMessagesResponse> => {
  const response = await apiClient.get<ContactMessagesResponse>(`/contact${searchParams || ''}`)
  return handleQueryResponse(response)
}

export function useContactMessages(searchParams?: string) {
  return useQuery({
    queryKey: queryKeys.contact.messages(searchParams),
    queryFn: () => fetchContactMessages(searchParams),
    placeholderData: (previousData) => previousData,
  })
}

export function useContactMessage(id: number) {
  return useQuery({
    queryKey: queryKeys.contact.message(id),
    queryFn: async () => {
      const response = await apiClient.get<ContactMessageDto>(`/contact/${id}`)
      return handleQueryResponse(response)
    },
    enabled: !!id,
  })
}

export function useContactUnreadCount() {
  return useQuery({
    queryKey: queryKeys.contact.unreadCount(),
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>('/contact/unread-count')
      return handleQueryResponse(response)
    },
  })
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ContactStatus }) => {
      const response = await apiClient.patch<ContactMessageDto>(`/contact/${id}/status`, { status })
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.contact.unreadCount() })
    },
  })
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/contact/${id}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.contact.unreadCount() })
    },
  })
}
