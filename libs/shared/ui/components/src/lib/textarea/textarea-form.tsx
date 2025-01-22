'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../form'
import { Textarea } from './textarea'
import { DpButton } from '@js-monorepo/button'

const FormSchema = z.object({
  notification: z
    .string()
    .min(1, {
      message: 'Notification must be at least 10 characters.',
    })
    .max(160, {
      message: 'Notification must not be longer than 30 characters.',
    }),
})

//TODO REFACTOR THIS COMPONENT - MAKE IT REUSABLE
export function TextareaForm({ submitCallBack }: { submitCallBack: (data: z.infer<typeof FormSchema>) => any }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    return submitCallBack(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="notification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormDescription>Send this notification directly to the user</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DpButton type="submit" className="w-full">
          Send
        </DpButton>
      </form>
    </Form>
  )
}
