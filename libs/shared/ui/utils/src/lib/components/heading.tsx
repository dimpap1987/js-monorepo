import React from 'react'
import { twMerge } from 'tailwind-merge'

function Heading({
  children,
  className,
  level = 'h1',
}: {
  readonly children: React.ReactNode
  readonly className?: string
  readonly level?: 'h1' | 'h2' | 'h3' | 'h4'
}) {
  const HeadingTag = level as keyof JSX.IntrinsicElements

  return (
    <HeadingTag
      style={{ letterSpacing: '0.02em' }}
      className={twMerge(
        'font-bold text-white',
        {
          h1: 'text-4xl',
          h2: 'text-3xl',
          h3: 'text-2xl',
          h4: 'text-xl',
        }[level],
        className
      )}
    >
      {children}
    </HeadingTag>
  )
}

export { Heading }
