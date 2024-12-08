'use client'

import { cn } from '@js-monorepo/ui/util'
import { motion } from 'framer-motion'
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

interface MarqueeProps {
  children?: ReactNode
  className?: string
  duration?: number // Duration for the animation
  repeat?: number // Number of loops before stopping
  onAnimationComplete?: () => void // Callback to clear announcements
}

//TODO needs refactor
const Marquee = forwardRef(
  (
    {
      children,
      duration = 15,
      repeat = undefined,
      onAnimationComplete,
      className,
    }: MarqueeProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const childRefs = useRef<Map<number, HTMLDivElement | null>>(new Map())
    const [childWidths, setChildWidths] = useState<number[]>([])
    const animationStatusRef = useRef(new Map<number, boolean>())

    useEffect(() => {
      const widths: number[] = []
      childRefs.current.forEach((child, index) => {
        if (child) {
          widths[index] = child.offsetWidth
        }
      })
      setChildWidths(widths)
    }, [children])

    useEffect(() => {
      animationStatusRef.current?.clear()
      React.Children.forEach(children, (child, index) => {
        animationStatusRef.current.set(index, false)
      })
    }, [children])

    const checkAllAnimationsCompleted = () => {
      // Check if all animations are completed
      const allCompleted = Array.from(
        animationStatusRef.current.values()
      ).every((status) => status)

      if (allCompleted) {
        onAnimationComplete?.()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden whitespace-nowrap flex items-center pointer-events-none focus:pointer-events-auto',
          className
        )}
      >
        <div className="flex gap-40 relative items-center">
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              className="px-4 absolute"
              ref={(node) => {
                childRefs.current.set(index, node)
              }}
              initial={{ x: `100vw` }}
              animate={{ x: `-${childWidths[index] || 400}px` }} // Animate to negative of the width
              transition={{
                duration,
                ease: 'linear',
                delay: index * 1.5,
                onComplete: () => {
                  // Mark this animation as completed
                  animationStatusRef.current.set(index, true)
                  setTimeout(checkAllAnimationsCompleted, 400)
                },
              }}
            >
              {child}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }
)

Marquee.displayName = 'Marquee'

export { Marquee }
