import { cn } from '@js-monorepo/utils'
import React, {
  ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { GrFormClose } from 'react-icons/gr'
import DpConfirmationDialog from '../components/confirmation-dialog'
import DpDialogContent from '../components/content'
import DpDialogFooter from '../components/footer'
import DpDialogHeader from '../components/header'
import DpLoginDialog from '../components/login-dialog'

export interface DpDialogProps {
  readonly isOpen?: boolean
  readonly onClose?: () => void
  readonly children: React.ReactNode
  readonly className?: string
  readonly overlayClassName?: string
}

const DpDialog = forwardRef<HTMLDivElement, DpDialogProps>(
  ({ isOpen = true, onClose, children, className, overlayClassName }, ref) => {
    const { footer, header, content } = useMemo(() => {
      let footerElement: ReactNode | null = null
      let headerElement: ReactNode | null = null
      let contentElement: ReactNode | null = null

      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          switch ((child.type as React.ComponentType).displayName) {
            case 'DpDialogFooter':
              footerElement = child
              break
            case 'DpDialogHeader':
              headerElement = child
              break
            case 'DpDialogContent':
              contentElement = child
              break
            default:
              break
          }
        }
      })

      if (!contentElement) {
        throw new Error('Dialog requires  DpDialogContent as children.')
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
      <>
        <div
          data-dialog-backdrop="dialog"
          data-dialog-backdrop-close="true"
          className={cn(
            `absolute inset-0 z-10 top-[50px] min-h-[calc(100vh-50px)] pointer-events-all bg-black bg-opacity-50`,
            overlayClassName
          )}
          onClick={onClose}
        ></div>
        <div
          data-dialog="dialog"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            `z-30 mb-50 fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border p-4 border-primary mb-20 max-h-[80%] overflow-y-auto m-auto rounded-2xl bg-slate-100 text-base font-light leading-relaxed antialiased pointer-events-auto transition ease-out duration-200 
             ${isOpen ? ' opacity-100 translate-y-0 ' : ' opacity-0 -translate-y-full '} `,
            className
          )}
          ref={ref}
        >
          <div className="flex justify-end p-1 float-right">
            <button
              onClick={onClose}
              className="text-3xl cursor-pointer"
              aria-label="Close dialog"
            >
              <GrFormClose className="text-slate-950 hover:text-slate-600" />
            </button>
          </div>
          {header ?? <div className="h-10 p-3"></div>}
          {content && (
            <div
              className={`relative p-3 border-t border-t-blue-gray-100
              ${footer ? ' border-b border-b-blue-gray-100 ' : ''} 
               p-4 font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased`}
            >
              {content}
            </div>
          )}
          {footer}
        </div>
      </>
    )
  }
)

DpDialog.displayName = 'DpDialog'

export {
  DpConfirmationDialog,
  DpDialog,
  DpDialogContent,
  DpDialogFooter,
  DpDialogHeader,
  DpLoginDialog,
}
