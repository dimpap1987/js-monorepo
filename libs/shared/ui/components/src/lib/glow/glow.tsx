'use client'
import { cn } from '@js-monorepo/ui/util'
import React, { ComponentPropsWithoutRef, CSSProperties, useEffect, useRef } from 'react'

interface GlowAreaProps extends ComponentPropsWithoutRef<'div'> {
  size?: number
}

export const GlowArea = (props: GlowAreaProps) => {
  const { className = '', size = 150, ...rest } = props
  const element = useRef<HTMLDivElement>(null)
  const frameId = useRef<number | null>(null)
  const latestCoords = useRef<{ x: number; y: number } | null>(null)

  const updateGlow = () => {
    if (latestCoords.current && element.current) {
      element.current.style.setProperty('--glow-x', `${latestCoords.current.x}px`)
      element.current.style.setProperty('--glow-y', `${latestCoords.current.y}px`)
      frameId.current = null
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    latestCoords.current = {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    }

    if (!frameId.current) {
      frameId.current = requestAnimationFrame(() => updateGlow())
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    latestCoords.current = null
    if (element.current) {
      element.current.style.setProperty('--glow-x', '-99999px')
      element.current.style.setProperty('--glow-y', '-99999px')
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (element.current) {
      const bounds = e.currentTarget.getBoundingClientRect()
      latestCoords.current = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      }
      updateGlow()
    }
  }

  useEffect(() => {
    const handleResize = () => updateGlow()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div
      ref={element}
      style={
        {
          position: 'relative',
          '--glow-size': `${size}px`,
        } as CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={cn(className, 'relative')}
      {...rest}
    />
  )
}

GlowArea.displayName = 'GlowArea'

interface GlowProps extends ComponentPropsWithoutRef<'div'> {
  color?: string
}

export const Glow = (props: GlowProps) => {
  const { className, color = 'var(--primary)', children, ...rest } = props
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateGlowPosition = () => {
      if (element.current) {
        element.current.style.setProperty('--glow-top', `${element.current.offsetTop}px`)
        element.current.style.setProperty('--glow-left', `${element.current.offsetLeft}px`)
      }
    }

    updateGlowPosition()
    window.addEventListener('resize', updateGlowPosition)

    return () => {
      window.removeEventListener('resize', updateGlowPosition)
    }
  }, [])

  return (
    <div ref={element} className={cn(className, 'relative rounded-xl')}>
      <div
        {...rest}
        style={{
          backgroundImage: `radial-gradient(
            var(--glow-size) var(--glow-size) at calc(var(--glow-x, -99999px) - var(--glow-left, 0px))
            calc(var(--glow-y, -99999px) - var(--glow-top, 0px)),
            ${color} 0%,
            transparent 100%
          )`,
        }}
        className={cn(
          className,
          "absolute pointer-events-none inset-0 mix-blend-soft-light rounded-xl after:content-[''] after:absolute after:bg-background/90 after:inset-0.25 after:rounded-[inherit]"
        )}
      ></div>
      {children}
    </div>
  )
}

Glow.displayName = 'Glow'
