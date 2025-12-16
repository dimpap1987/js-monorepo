'use client'
import { useEffect, useState } from 'react'

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

const useWindowWide = () => {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setWidth])

  return width
}

const bubbleConfig = {
  count: 40,
  minRadius: 5,
  maxRadius: 15,
  minDelay: 1,
  maxDelay: 4,
  speed: 0.2,
  colors: ['var(--chart-2)', 'var(--chart-4)', 'var(--chart-3)', 'var(--chart-1)'],
  width: 400,
  height: 100,
}

type BubbleObject = {
  cx: number
  cy: number
  radius: number
  fill: string
  animationDelay: string
  animationDuration: string
}

export default function BannerSVG() {
  const [bubbles, setBubbles] = useState<BubbleObject[]>([])
  const windowWidth = useWindowWide()
  const width = Math.max(windowWidth, bubbleConfig.width)

  useEffect(() => {
    const bubbleArray: BubbleObject[] = []
    const w = width

    for (let i = 0; i < bubbleConfig.count; ++i) {
      const cx = Math.random() * w
      const cy = bubbleConfig.height + Math.random() * bubbleConfig.height
      const radius = Math.random() * (bubbleConfig.maxRadius - bubbleConfig.minRadius) + bubbleConfig.minRadius
      const fill = bubbleConfig.colors[Math.floor(Math.random() * bubbleConfig.colors?.length)]
      const delay = Math.random() * (bubbleConfig.maxDelay - bubbleConfig.minDelay) + bubbleConfig.minDelay
      const dur = (Math.ceil(Math.random() * 5) * 0.5) / bubbleConfig.speed

      bubbleArray.push({
        cx,
        cy,
        radius,
        fill,
        animationDelay: `-${delay}s`,
        animationDuration: `${dur}s`,
      })
    }
    setBubbles(() => bubbleArray)
  }, [width])

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-full w-full left-0 top-0 z-[-1]" fill="none">
      <g id="bubbleContainer" className="[&>*]:animate-bubble">
        {bubbles.map((item, index) => (
          <circle
            key={index}
            cx={item.cx}
            cy={item.cy}
            r={item.radius}
            className="origin-[50%_50%] animate-bubble"
            style={{
              fill: item.fill,
              animationDelay: item.animationDelay,
              animationDuration: item.animationDuration,
            }}
          ></circle>
        ))}
      </g>
    </svg>
  )
}
