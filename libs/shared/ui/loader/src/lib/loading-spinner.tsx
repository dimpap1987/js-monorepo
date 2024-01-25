import { CSSProperties } from 'react'
import './loader.module.css'
import { twMerge } from 'tailwind-merge'

export type DpLoadingProps = {
  readonly message?: string
  readonly styles?: CSSProperties
  readonly className?: string
}
const spinnerLoader = {
  height: '1.7rem',
  width: '1.7rem',
  animation: 'spin 1s linear infinite',
  stroke: 'white',
}

export function DpLoadingSpinner({
  message,
  styles,
  className,
}: DpLoadingProps) {
  return (
    <div
      aria-label="Loading..."
      role="status"
      className={twMerge('flex items-center', className)}
    >
      <svg style={{ ...spinnerLoader, ...styles }} viewBox="0 0 256 256">
        <line
          x1="128"
          y1="32"
          x2="128"
          y2="64"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
        <line
          x1="195.9"
          y1="60.1"
          x2="173.3"
          y2="82.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
        <line
          x1="224"
          y1="128"
          x2="192"
          y2="128"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
        <line
          x1="195.9"
          y1="195.9"
          x2="173.3"
          y2="173.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
        <line
          x1="128"
          y1="224"
          x2="128"
          y2="192"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
        <line
          x1="60.1"
          y1="195.9"
          x2="82.7"
          y2="173.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
        <line
          x1="32"
          y1="128"
          x2="64"
          y2="128"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
        <line
          x1="60.1"
          y1="60.1"
          x2="82.7"
          y2="82.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="34"
        ></line>
      </svg>
      {message && <div className="leading-4 font-bold ml-1">{message}</div>}
    </div>
  )
}

export default DpLoadingSpinner
