'use client'
import {
  AppProgressBar as ProgressBar,
  ProgressBarProps,
} from 'next-nprogress-bar'

export type PageProgressBarProps = {
  children: React.ReactNode
} & ProgressBarProps

export function PageProgressBar({
  children,
  height = '2px',
  color = '#fffd00',
  options = { showSpinner: false },
}: PageProgressBarProps) {
  return (
    <>
      <ProgressBar
        height={height}
        color={color}
        options={options}
        shallowRouting
      />
      {children}
    </>
  )
}

export default PageProgressBar
