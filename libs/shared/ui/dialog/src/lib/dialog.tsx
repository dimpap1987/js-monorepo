'use client'
import React, { ReactNode, useMemo, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import DialogContent from '../components/content'
import DialogHeader from '../components/header'
import DialogFooter from '../components/footer'
import ConfirmationDialogComponent from '../components/confirmation-dialog'
import { AiFillCloseCircle } from 'react-icons/ai'

export interface DialogComponentProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

function DialogComponent({
  isOpen = false,
  onClose,
  children,
  className,
}: DialogComponentProps) {
  const { footer, header, content } = useMemo(() => {
    let footerElement: ReactNode | null = null
    let headerElement: ReactNode | null = null
    let contentElement: ReactNode | null = null

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && typeof child.type !== 'string') {
        switch ((child.type as React.ComponentType).displayName) {
          case 'DialogFooter':
            footerElement = child
            break
          case 'DialogHeader':
            headerElement = child
            break
          case 'DialogContent':
            contentElement = child
            break
          default:
            break
        }
      }
    })

    if (!footerElement || !contentElement) {
      throw new Error(
        'Dialog requires DialogFooter, DialogHeader, and DialogContent as children.'
      )
    }
    return {
      footer: footerElement,
      header: headerElement,
      content: contentElement,
    }
  }, [children])

  const [shouldRender, setShouldRender] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300) // 300ms matches the animation duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <div
      data-dialog-backdrop="dialog"
      data-dialog-backdrop-close="true"
      className={twMerge(
        `fixed inset-0 z-20 grid h-screen w-screen place-items-center bg-black bg-opacity-20 backdrop-blur-sm transition-opacity duration-300 pointer-events-all`,
        className
      )}
    >
      <div
        data-dialog="dialog"
        className={twMerge(
          `relative min-w-[200px] w-2/5 max-w-[40%] rounded-lg bg-slate-100 font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased shadow-2xl pointer-events-auto transition ease-out duration-300 transform`,
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl cursor-pointer hover:scale-125"
          aria-label="Close dialog"
        >
          <AiFillCloseCircle></AiFillCloseCircle>
        </button>
        {header}
        {content}
        {footer}
      </div>
    </div>
  )
}

export {
  DialogComponent,
  DialogContent,
  DialogFooter,
  DialogHeader,
  ConfirmationDialogComponent,
}
