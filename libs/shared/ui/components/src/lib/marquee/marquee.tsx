import { cn } from '@js-monorepo/ui/util'
import { motion } from 'framer-motion'
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
} from 'react'

interface MarqueeProps {
  children?: ReactNode
  className?: string
  duration?: number // Duration for the animation
  repeat?: number // Number of loops before stopping
  onAnimationComplete?: () => void // Callback to clear announcements
}

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
    const animationStatusRef = useRef(new Map<number, boolean>()) // Ref to track animation completion

    useEffect(() => {
      // Initialize the animation status map when children change
      animationStatusRef.current?.clear() // Clear previous status
      React.Children.forEach(children, (child, index) => {
        animationStatusRef.current?.set(index, false) // Set initial status to false
      })
    }, [children])

    const checkAllAnimationsCompleted = () => {
      // check if all animations are completed
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
        className={cn('overflow-hidden whitespace-nowrap py-1', className)}
      >
        <div className={`flex gap-40 min-h-6 relative items-center`}>
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              className="px-4 absolute"
              initial={{ x: `100vw` }}
              animate={{ x: `-300px` }}
              transition={{
                duration,
                ease: 'linear',
                delay: index * 1.5,
                onComplete: () => {
                  // Mark this animation as completed
                  animationStatusRef.current.set(index, true)
                  setTimeout(checkAllAnimationsCompleted, 400) // Small delay to ensure state updates
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
