'use client'
import { cn } from '@js-monorepo/ui/util'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export const NavigationButton = ({ direction, onClick }: { direction: 'prev' | 'next'; onClick: () => void }) => {
  const isPrev = direction === 'prev'
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75',
        isPrev ? 'left-4' : 'right-4'
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={isPrev ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}

export const Indicators = ({
  hrefs,
  currentIndex,
  goToSlide,
}: {
  hrefs: string[]
  currentIndex: number
  goToSlide: (index: number) => void
}) => (
  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
    {hrefs.map((_, index) => (
      <button
        key={index}
        onClick={() => goToSlide(index)}
        className={`w-2 h-2 rounded-full ${
          currentIndex === index ? 'bg-gray-700' : 'bg-gray-400'
        } transition-colors duration-300`}
      ></button>
    ))}
  </div>
)

export const Carousel = ({ hrefs, className }: { hrefs: string[]; className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current) // Clear any existing interval
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === hrefs.length - 1 ? 0 : prevIndex + 1))
    }, 10000)
  }, [hrefs])

  useEffect(() => {
    startAutoSlide()

    return () => stopAutoSlide()
  }, [startAutoSlide, stopAutoSlide])

  const handleUserInteraction = (action: 'next' | 'prev') => {
    if (action === 'next') {
      setCurrentIndex((prevIndex) => (prevIndex === hrefs.length - 1 ? 0 : prevIndex + 1))
    } else if (action === 'prev') {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? hrefs.length - 1 : prevIndex - 1))
    }
    startAutoSlide()
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    startAutoSlide()
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsLightboxOpen(true)
    stopAutoSlide()
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    startAutoSlide()
  }

  return (
    <div className={cn('relative w-full max-w-4xl mx-auto h-64 md:h-96', className)}>
      {/* Carousel Images */}
      <div className="relative overflow-hidden rounded-lg w-full h-full">
        {hrefs.map((href, index) => (
          <Image
            key={index}
            src={href}
            fill={true}
            alt={`Slide ${index + 1}`}
            onClick={() => openLightbox(index)}
            className={`absolute object-contain top-0 left-0 cursor-pointer transition-opacity duration-300 ease-in-out transform ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Previous Button */}
      <NavigationButton direction="prev" onClick={() => handleUserInteraction('prev')} />

      {/* Next Button */}
      <NavigationButton direction="next" onClick={() => handleUserInteraction('next')} />

      {/* Position Indicators */}
      <Indicators hrefs={hrefs} currentIndex={currentIndex} goToSlide={goToSlide} />

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <button onClick={closeLightbox} className="absolute top-4 z-50 right-4 text-white text-4xl">
            &times;
          </button>
          <div className="relative w-full max-w-6xl h-[90svh] flex items-center justify-center">
            <Image className="object-contain" src={hrefs[currentIndex]} fill={true} alt={`Slide ${currentIndex + 1}`} />
            {/* Lightbox Previous Button */}
            <NavigationButton direction="prev" onClick={() => handleUserInteraction('prev')} />

            {/* Lightbox Next Button */}
            <NavigationButton direction="next" onClick={() => handleUserInteraction('next')} />
          </div>
        </div>
      )}
    </div>
  )
}
