'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DpButton } from '@js-monorepo/button'
import {
  Form,
  FormControl,
  FormErrorDisplay,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/form'
import { Textarea } from '@js-monorepo/components/textarea'
import { useForm } from 'react-hook-form'
import { sendEmail } from '../app/actions/send-email'
import { ContactFormSubmit, ContactSchema } from '../app/types'

export default function ContactForm() {
  const form = useForm({
    defaultValues: { name: '', email: '', message: '' },
    resolver: zodResolver(ContactSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ContactFormSubmit) => {
    try {
      await sendEmail(data)

      form.clearErrors()

      alert('Email sent successfully!')
    } catch (error) {
      alert('Failed to send email')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-96 sm:w-[40vw] bg-white p-7 rounded-xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your Name" required />
              </FormControl>
              <FormErrorDisplay errors={form.formState.errors} fields={{ name: 'Name' }} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Your Email" required />
              </FormControl>
              <FormErrorDisplay errors={form.formState.errors} fields={{ email: 'Email' }} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Your Message" {...field} required />
              </FormControl>
              <FormErrorDisplay errors={form.formState.errors} fields={{ message: 'Message' }} />
            </FormItem>
          )}
        />

        <DpButton className="w-full" type="submit" size="large" disabled={!form.formState.isValid}>
          Send Message
        </DpButton>
      </form>
    </Form>
  )
}
