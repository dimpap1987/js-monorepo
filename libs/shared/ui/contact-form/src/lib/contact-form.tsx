'use client'

import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/ui/card'
import {
  Form,
  FormControl,
  FormErrorDisplay,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { useNotifications } from '@js-monorepo/notification'
import { ContactCategory, CONTACT_CATEGORIES } from '@js-monorepo/types'
import { z } from 'zod'
import { cn } from '@js-monorepo/ui/util'
import { FiMail, FiMessageSquare, FiSend } from 'react-icons/fi'
import { useContactForm } from './use-contact-form'

const CATEGORY_LABELS: Record<ContactCategory, string> = {
  general: 'General',
  support: 'Technical Support',
  feedback: 'Feedback',
  bug: 'Bug Report',
  other: 'Other',
}

export interface ContactFormProps {
  user?: {
    email?: string
  }
  onSuccess?: () => void
  onError?: (error: Error) => void
  className?: string
  showCard?: boolean
  title?: string
  description?: string
}

export function ContactForm({
  user,
  onSuccess,
  onError,
  className,
  showCard = true,
  title = 'Contact Us',
  description = "Have a question or feedback? We'd love to hear from you.",
}: ContactFormProps) {
  const { addNotification } = useNotifications()
  const isLoggedIn = !!user

  const { form, handleSubmit, isSubmitting } = useContactForm({
    onSuccess: () => {
      addNotification({
        message: "We've got your message in our inbox. Sit tight—we'll be in touch shortly!",
        type: 'success',
        duration: 10000,
      })
      onSuccess?.()
    },
    onError: (error) => {
      // Extract error from response (handleQueryResponse attaches full response)
      const errorWithResponse = error as Error & {
        response?: { message?: string; errorCode?: string }
      }
      const errorCode = errorWithResponse.response?.errorCode
      let message: string

      switch (errorCode) {
        case 'EMAIL_REQUIRED':
          message = 'Please provide your email address.'
          form.setError('email', { message: 'Email is required' })
          break
        default:
          message = errorWithResponse.response?.message || 'Failed to send message. Please try again.'
      }

      addNotification({ message, type: 'error', duration: 20000 })
      onError?.(error)
    },
  })

  // Validate email for anonymous users before submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      const email = form.getValues('email')
      if (!email || !email.trim()) {
        form.setError('email', { message: 'Email is required' })
        return
      }
      // Use Zod email validation
      const result = z.string().email().safeParse(email)
      if (!result.success) {
        form.setError('email', { message: 'Please enter a valid email address' })
        return
      }
    }
    handleSubmit(e)
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {title && (
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <FiMessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            </div>
            {description && <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>}
          </div>
        )}

        <div className="space-y-4">
          {!isLoggedIn && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FiMail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="your@email.com" className="w-full h-10" />
                  </FormControl>
                  <FormErrorDisplay errors={form.formState.errors} fields={{ email: 'Email' }} />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONTACT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormErrorDisplay errors={form.formState.errors} fields={{ category: 'Category' }} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Message</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Tell us how we can help..." className="min-h-[140px] resize-none" />
                </FormControl>
                <FormErrorDisplay errors={form.formState.errors} fields={{ message: 'Message' }} />
              </FormItem>
            )}
          />
        </div>

        <DpButton
          type="submit"
          size="large"
          className="w-full gap-2"
          variant="accent"
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting ? (
            'Sending...'
          ) : (
            <>
              <FiSend className="h-4 w-4" />
              Send Message
            </>
          )}
        </DpButton>
      </form>
    </Form>
  )

  if (showCard) {
    return (
      <Card
        className={cn('w-full max-w-lg mx-auto p-6 sm:px-8 sm:py-10 bg-card border border-border shadow-sm', className)}
      >
        {formContent}
      </Card>
    )
  }

  return <div className={className}>{formContent}</div>
}
