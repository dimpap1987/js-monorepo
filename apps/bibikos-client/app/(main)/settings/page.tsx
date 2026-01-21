import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = generateMetadata({
  title: 'Settings',
})

export default function SettingsPage() {
  redirect('/settings/account')
}
