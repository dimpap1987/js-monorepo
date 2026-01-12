import { GrAnnounce } from 'react-icons/gr'
import { HiMiniUsers } from 'react-icons/hi2'
import { IoMdNotifications } from 'react-icons/io'
import { MdOutlineContactMail, MdOutlineSubscriptions } from 'react-icons/md'
import { RiUserSettingsFill } from 'react-icons/ri'
import { FiPackage } from 'react-icons/fi'

export const ADMIN_NAV_LINKS = [
  {
    href: '/admin/users',
    icon: RiUserSettingsFill,
    label: 'Users',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/admin/online-users',
    icon: HiMiniUsers,
    label: 'Online',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/admin/subscriptions',
    icon: MdOutlineSubscriptions,
    label: 'Subscriptions',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/admin/products',
    icon: FiPackage,
    label: 'Products',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/admin/notifications',
    icon: IoMdNotifications,
    label: 'Manage Alerts',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/admin/announcements',
    icon: GrAnnounce,
    label: 'Announcements',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/admin/contact-messages',
    icon: MdOutlineContactMail,
    label: 'Contact Messages',
    activeClassName: 'bg-primary text-primary-foreground',
  },
] as const
