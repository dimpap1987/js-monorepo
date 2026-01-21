export * from './lib/navbar'
export * from './lib/components/user-metadata'

export type UserNavSocial = {
  type: 'google' | 'github' | 'facebook' | 'apple'
  onLogin: () => void
}
