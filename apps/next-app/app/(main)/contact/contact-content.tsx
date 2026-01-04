'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { ContactForm } from '@js-monorepo/contact-form'

export function ContactPageContent() {
  const { session } = useSession()
  const user = session?.user

  return (
    <ContactForm
      user={user}
      title="Contact Us"
      description="Have a question, feedback, or need support? Fill out the form below and we'll get back to you as soon as possible."
    />
  )
}
