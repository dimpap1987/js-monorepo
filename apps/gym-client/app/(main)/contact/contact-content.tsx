'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { ContactForm } from '@js-monorepo/contact-form'
import { useTranslations } from 'next-intl'

export function ContactPageContent() {
  const { session } = useSession()
  const user = session?.user
  const t = useTranslations('contact')

  return <ContactForm user={user} title={t('title')} description={t('description')} />
}
