'use client'

import { Button } from '@js-monorepo/components/button'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const raysVariants = {
    hidden: {
      strokeOpacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    visible: {
      strokeOpacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rayVariant = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      scale: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        pathLength: { duration: 0.3 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 },
      },
    },
  }

  const shineVariant = {
    hidden: {
      opacity: 0,
      scale: 2,
      strokeDasharray: '20, 1000',
      strokeDashoffset: 0,
      filter: 'blur(0px)',
    },
    visible: {
      opacity: [0, 1, 0],
      strokeDashoffset: [0, -50, -100],
      filter: ['blur(2px)', 'blur(2px)', 'blur(0px)'],
      transition: {
        duration: 0.75,
        ease: 'linear',
      },
    },
  }

  const sunPath =
    'M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C60 29 69.5 38 70 49.5Z'
  const moonPath =
    'M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C39 45 49.5 59.5 70 49.5Z'

  return (
    <Button
      className="py-1 px-2 rounded-md hover:bg-transparent border-0 focus-visible:ring-primary focus-visible:ring-2 hover:ring-1 hover:ring-border"
      variant="outline"
      onClick={() => (theme === 'dark' ? setTheme('light') : setTheme('dark'))}
    >
      <motion.svg
        strokeWidth="4"
        strokeLinecap="round"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
      >
        <motion.path
          variants={shineVariant}
          d={moonPath}
          className={'absolute top-0 left-0 stroke-blue-100 '}
          initial="hidden"
          animate={theme === 'dark' ? 'visible' : 'hidden'}
        />

        <motion.g
          variants={raysVariants}
          initial="hidden"
          animate={theme === 'light' ? 'visible' : 'hidden'}
          className="stroke-6 stroke-yellow-600"
          style={{ strokeLinecap: 'round' }}
        >
          <motion.path className="origin-center" variants={rayVariant} d="M50 2V11" />
          <motion.path variants={rayVariant} d="M85 15L78 22" />
          <motion.path variants={rayVariant} d="M98 50H89" />
          <motion.path variants={rayVariant} d="M85 85L78 78" />
          <motion.path variants={rayVariant} d="M50 98V89" />
          <motion.path variants={rayVariant} d="M23 78L16 84" />
          <motion.path variants={rayVariant} d="M11 50H2" />
          <motion.path variants={rayVariant} d="M23 23L16 16" />
        </motion.g>

        <motion.path
          d={sunPath}
          fill="transparent"
          transition={{ duration: 1, type: 'spring' }}
          initial={{ fillOpacity: 0, strokeOpacity: 0 }}
          animate={
            theme === 'dark'
              ? {
                  d: moonPath,
                  rotate: -360,
                  scale: 2,
                  fill: 'whitesmoke',
                  stroke: 'whitesmoke',
                  fillOpacity: 0.35,
                  strokeOpacity: 1,
                  transition: { delay: 0.1 },
                }
              : {
                  d: sunPath,
                  rotate: 0,
                  stroke: '#FFD700',
                  fill: '#FFD700',
                  fillOpacity: 0.35,
                  strokeOpacity: 1,
                }
          }
        />
      </motion.svg>
    </Button>
  )
}
