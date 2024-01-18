'use client'
import {
  AppProgressBar as ProgressBar,
  ProgressBarProps,
} from 'next-nprogress-bar'
import { PropsWithChildren } from 'react'

export type DpNextPageProgressBarProps = PropsWithChildren & ProgressBarProps

export function DpNextPageProgressBar({
  children,
  height = '2px',
  color = '#fffd00',
  options = { showSpinner: false },
}: DpNextPageProgressBarProps) {
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

export default DpNextPageProgressBar
