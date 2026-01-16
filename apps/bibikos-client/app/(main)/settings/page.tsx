import { redirect } from 'next/navigation'

// Redirect /settings to /settings/account as the default
export default function SettingsPage() {
  redirect('/settings/account')
}
