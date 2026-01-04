import { ContactMessageSchema, ContactMessageSchemaType } from '@js-monorepo/schemas'
import { ContactMessageDto } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

export function useContactMutation() {
  return useMutation({
    mutationFn: async (payload: ContactMessageSchemaType): Promise<ContactMessageDto> => {
      const response = await apiClient.post('/contact', payload)
      return handleQueryResponse(response)
    },
  })
}

export interface UseContactFormOptions {
  defaultValues?: Partial<ContactMessageSchemaType>
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useContactForm(options?: UseContactFormOptions) {
  const form = useForm<ContactMessageSchemaType>({
    resolver: zodResolver(ContactMessageSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      message: '',
      category: 'general',
      ...options?.defaultValues,
    },
  })

  const mutation = useContactMutation()

  const handleSubmit = async (data: ContactMessageSchemaType) => {
    try {
      // Don't send empty email - backend will fetch it for logged-in users
      await mutation.mutateAsync({
        ...data,
        email: data.email || undefined,
      })
      form.reset()
      options?.onSuccess?.()
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: form.reset,
  }
}
