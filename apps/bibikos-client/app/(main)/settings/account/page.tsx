import { Metadata } from 'next'
import { AccountSettings } from './account-settings'
import { generateMetadata } from '@js-monorepo/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Account Settings',
})

export default function AccountSettingsPage() {
  return <AccountSettings />
}
