import pkg from '@js-monorepo/package.json'
import { twMerge } from 'tailwind-merge'

export interface VersionComponentProps {
  readonly className?: string
}

export function VersionComponent({ className }: VersionComponentProps) {
  return (
    <span
      className={twMerge(
        'p-1 rounded-md text-gray-700 font-light text-sm text-white',
        className
      )}
    >
      Version: <span className="font-medium">"{pkg.version}"</span>
    </span>
  )
}

export default VersionComponent
