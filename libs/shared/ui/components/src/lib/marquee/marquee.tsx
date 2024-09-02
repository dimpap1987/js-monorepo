import {
  AnimationDefinition,
  motion,
  useAnimationControls,
} from 'framer-motion'
import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

interface MarqueeProps {
  children?: ReactNode
  duration?: number // Duration for the animation
  direction?: 'left' | 'right' // Direction of the marquee
  repeat?: number // Number of loops before stopping
  onPlayingStateChange?: (isPlaying: boolean) => void
}

export interface MarqueeRef {
  start: () => void
  stop: () => void
}

// Use forwardRef to allow parent components to access start stop and isPlaying
const Marquee = forwardRef(
  (
    {
      children,
      duration = 15,
      repeat = undefined,
      onPlayingStateChange,
    }: MarqueeProps,
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const controls = useAnimationControls()
    const [controlConfig, setControlConfig] =
      useState<AnimationDefinition | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
      if (containerRef.current) {
        setControlConfig({
          x: [
            containerRef.current.offsetWidth,
            -containerRef.current.offsetWidth,
          ],
          transition: {
            duration,
            ease: 'linear',
            repeat,
            repeatType: repeat ? 'loop' : undefined,
          },
        })
      }
    }, [duration, repeat])

    // Expose start and stop functions to parent components
    useImperativeHandle(ref, () => ({
      start: () => controlConfig && controls?.start(controlConfig),
      stop: () => controls?.stop(),
    }))

    return (
      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          position: 'relative',
        }}
      >
        <motion.div
          className={`flex gap-40 ${isPlaying ? 'opacity-1' : 'opacity-0'} py-1`}
          animate={controls}
          onAnimationStart={() => {
            setIsPlaying(true)
            onPlayingStateChange?.(true)
          }}
          onAnimationComplete={() => {
            setIsPlaying(false)
            onPlayingStateChange?.(false)
          }}
          style={{
            display: 'inline-flex',
          }}
        >
          {React.Children?.map(children, (child) => (
            <div style={{ padding: '0 20px' }}>{child}</div>
          ))}
        </motion.div>
      </div>
    )
  }
)

Marquee.displayName = 'Marquee'

export { Marquee }
