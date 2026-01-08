export type AuthRole = 'ADMIN' | 'USER'

export type MenuItem = {
  name: string
  href: string
  Icon?: any
  roles: (AuthRole | 'PUBLIC')[]
  className?: string
}
