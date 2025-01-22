'use client'
import { AppProgressBar as ProgressBar, ProgressBarProps } from 'next-nprogress-bar'
import { PropsWithChildren, Suspense } from 'react'

export type DpNextPageProgressBarProps = PropsWithChildren & ProgressBarProps

export function DpNextPageProgressBar({
  children,
  height = '2px',
  color = '#fffd00',
  options = { showSpinner: false },
}: DpNextPageProgressBarProps) {
  return (
    <>
      <Suspense>
        <ProgressBar height={height} color={color} options={options} shallowRouting />
      </Suspense>
      {children}
    </>
  )
}

export default DpNextPageProgressBar
