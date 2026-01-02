'use client'

import { cn } from '@js-monorepo/ui/util'
import React, { useCallback, useEffect, useRef, useState } from 'react'

export interface SnapCarouselProps {
  children: React.ReactNode[]
  /** Index of item to center initially (defaults to middle item) */
  activeIndex?: number
  /** Width of each item as percentage (default: 80) */
  itemWidthPercent?: number
  /** Gap between items in pixels (default: 16) */
  gap?: number
  /** Show dot indicators (default: true) */
  showIndicators?: boolean
  /** Additional className for the container */
  className?: string
  /** Additional className for individual items */
  itemClassName?: string
  /** Callback when active item changes via scroll */
  onIndexChange?: (index: number) => void
}

export function SnapCarousel({
  children,
  activeIndex,
  itemWidthPercent = 80,
  gap = 16,
  showIndicators = true,
  className,
  itemClassName,
  onIndexChange,
}: SnapCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const count = React.Children.count(children)
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < count) {
      return activeIndex
    }
    return Math.floor(count / 2)
  })
  const itemCount = React.Children.count(children)
  const hasScrolled = useRef(false)

  // Scroll to a specific index
  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll<HTMLElement>('[data-carousel-item]')
    const targetItem = items[index]
    if (!targetItem) return

    const containerWidth = container.offsetWidth
    const itemLeft = targetItem.offsetLeft
    const itemWidth = targetItem.offsetWidth

    // Center the item
    const scrollPosition = itemLeft - (containerWidth - itemWidth) / 2

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior,
    })
  }, [])

  // Initial scroll on mount
  useEffect(() => {
    if (!hasScrolled.current && containerRef.current && itemCount > 0) {
      // Determine initial index
      let initialIndex = Math.floor(itemCount / 2)
      if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < itemCount) {
        initialIndex = activeIndex
      }

      setCurrentIndex(initialIndex)

      // Multiple attempts to ensure scroll works after render
      const attemptScroll = () => {
        scrollToIndex(initialIndex, 'instant')
        hasScrolled.current = true
      }

      // Try immediately, then after paint
      attemptScroll()
      requestAnimationFrame(attemptScroll)
      const timer = setTimeout(attemptScroll, 100)

      return () => clearTimeout(timer)
    }
  }, [activeIndex, scrollToIndex, itemCount])

  // Handle scroll to detect current index
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll<HTMLElement>('[data-carousel-item]')
    const containerCenter = container.scrollLeft + container.offsetWidth / 2

    let closestIndex = 0
    let closestDistance = Infinity

    items.forEach((el, index) => {
      const itemCenter = el.offsetLeft + el.offsetWidth / 2
      const distance = Math.abs(containerCenter - itemCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex)
      onIndexChange?.(closestIndex)
    }
  }, [currentIndex, onIndexChange])

  // Indicator click handler
  const handleIndicatorClick = (index: number) => {
    scrollToIndex(index)
    setCurrentIndex(index)
    onIndexChange?.(index)
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 items-stretch py-2 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Left spacer for centering first item */}
        <div
          className="flex-shrink-0"
          style={{ width: `calc((100% - ${itemWidthPercent}%) / 2)` }}
          aria-hidden="true"
        />

        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            data-carousel-item
            className={cn('flex-shrink-0 snap-center py-2', itemClassName)}
            style={{
              width: `${itemWidthPercent}%`,
              marginRight: index < itemCount - 1 ? `${gap}px` : 0,
            }}
          >
            {child}
          </div>
        ))}

        {/* Right spacer for centering last item */}
        <div
          className="flex-shrink-0"
          style={{ width: `calc((100% - ${itemWidthPercent}%) / 2)` }}
          aria-hidden="true"
        />
      </div>

      {/* Indicators */}
      {showIndicators && itemCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                currentIndex === index ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
