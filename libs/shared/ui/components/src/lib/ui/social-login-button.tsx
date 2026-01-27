import { cn } from '@js-monorepo/ui/util'
import * as React from 'react'

export type SocialProvider = 'google' | 'github' | 'facebook' | 'apple'

export interface SocialLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider
  loading?: boolean
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
      <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M23.64 12.204c0-.828-.074-1.624-.212-2.396H12v4.536h6.18c-.268 1.432-1.08 2.64-2.304 3.456v2.88h3.744c2.184-2.016 3.432-4.968 3.432-8.476z"
          fill="#4285F4"
        />
        <path
          d="M12 24c3.24 0 5.964-1.08 7.952-2.928l-3.744-2.88c-1.044.696-2.388 1.104-4.208 1.104-3.24 0-5.976-2.184-6.948-5.136H1.224v3.216C3.2 21.6 7.36 24 12 24z"
          fill="#34A853"
        />
        <path
          d="M5.052 14.216c-.216-.648-.336-1.344-.336-2.056s.12-1.408.336-2.056V6.888H1.224C.432 8.28 0 10.04 0 12c0 1.96.432 3.72 1.224 5.112l3.828-2.896z"
          fill="#FBBC05"
        />
        <path
          d="M12 4.8c1.764 0 3.348.608 4.596 1.8l3.432-3.432C17.964 1.944 15.24.864 12 .864 7.36.864 3.2 3.264 1.224 6.888l3.828 2.872C6.024 7.008 8.76 4.8 12 4.8z"
          fill="#EA4335"
        />
      </svg>
    </div>
  )
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 496 512"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <path d="M244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
      </svg>
    </div>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 512"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <path d="M279.1 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.4 0 225.4 0c-73.22 0-121.1 44.38-121.1 124.7v70.62H22.89V288h81.39v224h100.2V288z" />
      </svg>
    </div>
  )
}

export function AppleIcon({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 384 512"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
    </div>
  )
}

const providerConfig = {
  google: {
    label: 'Google',
    bgColor: '#ffffff',
    textColor: '#4285F4',
    hoverBg: '',
    icon: <GoogleIcon />,
  },
  github: {
    label: 'GitHub',
    bgColor: 'bg-gray-800',
    textColor: 'text-white',
    hoverBg: '',
    icon: <GitHubIcon className="text-gray-900" />,
  },
  facebook: {
    label: 'Facebook',
    bgColor: 'bg-blue-600 dark:bg-blue-700',
    textColor: 'text-white',
    hoverBg: '',
    icon: <FacebookIcon className="text-white" />,
  },
  apple: {
    label: 'Apple',
    bgColor: 'bg-gray-900',
    textColor: 'text-white',
    hoverBg: '',
    icon: <AppleIcon />,
  },
} as const

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export const SocialLoginButton = React.forwardRef<HTMLButtonElement, SocialLoginButtonProps>(
  ({ provider, loading, className, disabled, children, ...props }, ref) => {
    const config = providerConfig[provider]
    const isDisabled = loading || disabled

    return (
      <button
        type="button"
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'relative w-full rounded-lg px-4 py-3.5 text-sm font-medium transition-all duration-200 border',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'active:scale-[0.98] focus:outline-none',
          config.bgColor,
          config.textColor,
          config.hoverBg,
          'grid grid-cols-[0.6fr_1fr] sm:grid-cols-[0.5fr_1fr] items-center justify-center gap-3',
          'hover:scale-105 hover:border-l-2 hover:border-r-2'
        )}
        {...props}
      >
        {loading && (
          <div className="absolute left-4 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}

        {/* Icon */}
        {React.cloneElement(config.icon, {
          className: 'w-6 h-6',
        })}

        {/* Text */}
        <span className="flex items-center">
          {children || (
            <div className="flex gap-1">
              <span className="hidden sm:inline">Continue with </span>
              <span>{config.label}</span>
            </div>
          )}
        </span>
      </button>
    )
  }
)

SocialLoginButton.displayName = 'SocialLoginButton'
