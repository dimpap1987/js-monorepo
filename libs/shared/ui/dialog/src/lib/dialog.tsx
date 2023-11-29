'use client'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { twMerge } from 'tailwind-merge'
import ConfirmationDialogComponent from '../components/confirmation-dialog'
import DialogContent from '../components/content'
import DialogFooter from '../components/footer'
import DialogHeader from '../components/header'
import LoginDialogComponent from '../components/login-dialog'

export interface DialogComponentProps {
  isOpen?: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

function DialogComponent({
  isOpen = true,
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

    if (!contentElement) {
      throw new Error('Dialog requires  DialogContent as children.')
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
      className={`fixed inset-0 z-20 grid h-screen w-screen place-items-center pointer-events-all bg-black bg-opacity-50`}
      onClick={onClose}
    >
      <div
        data-dialog="dialog"
        onClick={(e) => e.stopPropagation()}
        className={twMerge(
          `relative mb-20 min-w-[200px] md:max-w-[40%] max-w-[90%] max-h-[80%] overflow-y-auto m-auto rounded-lg bg-slate-100 font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased pointer-events-auto transition ease-out duration-200 transform`,
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full',
          className
        )}
      >
        <div className="flex justify-end p-1">
          <button
            onClick={onClose}
            className=" text-2xl cursor-pointer hover:scale-125"
            aria-label="Close dialog"
          >
            <AiFillCloseCircle></AiFillCloseCircle>
          </button>
        </div>
        {header}
        {content && (
          <div
            className={`relative p-3 ${
              header ? ' border-t border-t-blue-gray-100 ' : ''
            }
              ${footer ? ' border-b border-b-blue-gray-100 ' : ''} 
               p-4 font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased`}
          >
            {content}
          </div>
        )}
        {footer}
      </div>
    </div>
  )
}

export {
  ConfirmationDialogComponent,
  DialogComponent,
  DialogContent,
  DialogFooter,
  DialogHeader,
  LoginDialogComponent,
}
