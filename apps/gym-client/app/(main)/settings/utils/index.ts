import { IoMdNotifications } from 'react-icons/io'
import { MdAccountCircle, MdPalette } from 'react-icons/md'

interface SettingsNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

export const settingsNavItems: SettingsNavItem[] = [
  {
    href: '/settings/account',
    label: 'Account',
    icon: MdAccountCircle,
    description: 'Account information',
  },
  {
    href: '/settings/appearance',
    label: 'Appearance',
    icon: MdPalette,
    description: 'Themes and preferences',
  },
  {
    href: '/settings/notifications',
    label: 'Notifications',
    icon: IoMdNotifications,
    description: 'Push notifications and alerts',
  },
]
