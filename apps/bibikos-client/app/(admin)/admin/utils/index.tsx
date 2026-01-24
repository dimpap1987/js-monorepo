import { GrAnnounce } from 'react-icons/gr'
import { HiMiniUsers } from 'react-icons/hi2'
import { IoMdNotifications } from 'react-icons/io'
import { MdOutlineContactMail, MdOutlineSubscriptions, MdOutlineToggleOn } from 'react-icons/md'
import { RiUserSettingsFill } from 'react-icons/ri'
import { FiPackage } from 'react-icons/fi'
import { BiTagAlt } from 'react-icons/bi'

interface NavLink {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  activeClassName: string
}

interface NavSection {
  title?: string
  links: NavLink[]
}

const defaultActiveClassName = 'bg-primary text-primary-foreground'

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Platform',
    links: [
      {
        href: '/admin/users',
        icon: RiUserSettingsFill,
        label: 'Users',
        activeClassName: defaultActiveClassName,
      },
      {
        href: '/admin/online-users',
        icon: HiMiniUsers,
        label: 'Online',
        activeClassName: defaultActiveClassName,
      },
      {
        href: '/admin/subscriptions',
        icon: MdOutlineSubscriptions,
        label: 'Subscriptions',
        activeClassName: defaultActiveClassName,
      },
      {
        href: '/admin/products',
        icon: FiPackage,
        label: 'Products',
        activeClassName: defaultActiveClassName,
      },
      {
        href: '/admin/notifications',
        icon: IoMdNotifications,
        label: 'Manage Alerts',
        activeClassName: defaultActiveClassName,
      },
      {
        href: '/admin/announcements',
        icon: GrAnnounce,
        label: 'Announcements',
        activeClassName: defaultActiveClassName,
      },
      {
        href: '/admin/contact-messages',
        icon: MdOutlineContactMail,
        label: 'Contact Messages',
        activeClassName: defaultActiveClassName,
      },
      {
        href: '/admin/feature-flags',
        icon: MdOutlineToggleOn,
        label: 'Feature Flags',
        activeClassName: defaultActiveClassName,
      },
    ],
  },
  {
    title: 'Bibikos',
    links: [
      {
        href: '/admin/bibikos/tags',
        icon: BiTagAlt,
        label: 'Tags',
        activeClassName: defaultActiveClassName,
      },
    ],
  },
]

// Flatten for backwards compatibility
export const ADMIN_NAV_LINKS = ADMIN_NAV_SECTIONS.flatMap((section) => section.links)
