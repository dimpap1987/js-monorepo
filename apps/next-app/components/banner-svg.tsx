'use client'
import { useEffect, useRef, useState } from 'react'

export type ConfigType = {
  count: number
  line1: string
  line2: string
  dashLengthInit: number
  strokeWidth: number
  speed: number
  width: number
  height: number
}

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return size
}

const bubbleConfig = {
  count: 50,
  minRadius: 4,
  maxRadius: 18,
  minDelay: 0,
  maxDelay: 5,
  speed: 0.15,
  colors: ['var(--chart-2)', 'var(--chart-4)', 'var(--chart-3)', 'var(--chart-1)', 'var(--primary)'],
  startOffset: -30,
}

type BubbleObject = {
  cx: number
  cy: number
  radius: number
  fill: string
  animationDelay: string
  animationDuration: string
  opacity: number
}

export default function BannerSVG() {
  const [bubbles, setBubbles] = useState<BubbleObject[]>([])
  const containerRef = useRef<SVGSVGElement>(null)
  const { width: windowWidth } = useWindowSize()
  const [containerHeight, setContainerHeight] = useState(500)

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerHeight(rect.height || 500)
      }
    }

    updateHeight()
    const resizeObserver = new ResizeObserver(updateHeight)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const bubbleArray: BubbleObject[] = []
    const w = Math.max(windowWidth, 400)
    const h = containerHeight || 500

    for (let i = 0; i < bubbleConfig.count; ++i) {
      // X position: spread across width
      const cx = Math.random() * w

      // Y position: Start all bubbles at the bottom (below visible area)
      // Add some random offset so they don't all start at exactly the same point
      const bottomOffset = 20 + Math.random() * 30 // Start 20-50px below the bottom
      const cy = h + bottomOffset

      const radius = Math.random() * (bubbleConfig.maxRadius - bubbleConfig.minRadius) + bubbleConfig.minRadius
      const fill = bubbleConfig.colors[Math.floor(Math.random() * bubbleConfig.colors.length)]
      // Stagger delays so bubbles appear at different times
      const delay = Math.random() * (bubbleConfig.maxDelay - bubbleConfig.minDelay) + bubbleConfig.minDelay
      const dur = (Math.ceil(Math.random() * 8) * 0.5) / bubbleConfig.speed

      // Lower opacity for subtle background effect
      const opacity = 0.15 + Math.random() * 0.25

      bubbleArray.push({
        cx,
        cy,
        radius,
        fill,
        animationDelay: `-${delay}s`,
        animationDuration: `${dur}s`,
        opacity,
      })
    }
    setBubbles(() => bubbleArray)
  }, [windowWidth, containerHeight])

  return (
    <svg
      ref={containerRef}
      xmlns="http://www.w3.org/2000/svg"
      className="absolute h-full w-full left-0 top-0 z-[-1]"
      fill="none"
      viewBox={`0 0 ${Math.max(windowWidth, 400)} ${containerHeight}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>
          {`@keyframes bubble-float {
            0% {
              transform: translateY(0) scale(1);
            }
            100% {
              transform: translateY(-${containerHeight + 150}px) scale(0.8);
            }
            }
            .animate-bubble {
              animation: bubble-float linear infinite;
            }`}
        </style>
      </defs>
      <g id="bubbleContainer">
        {bubbles.map((item, index) => (
          <circle
            key={index}
            cx={item.cx}
            cy={item.cy}
            r={item.radius}
            className="animate-bubble"
            style={{
              fill: item.fill,
              opacity: item.opacity,
              animationDelay: item.animationDelay,
              animationDuration: item.animationDuration,
            }}
          />
        ))}
      </g>
    </svg>
  )
}
