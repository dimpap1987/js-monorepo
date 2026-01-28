'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown'

import { FaFacebookF, FaTwitter, FaWhatsapp, FaViber } from 'react-icons/fa'
import { FiShare2 } from 'react-icons/fi'
import { useEffect, useState } from 'react'

function ShareItem({
  href,
  bg,
  label,
  children,
}: {
  href: string
  bg: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`flex aspect-square w-8 items-center justify-center rounded-full text-white ${bg}
        transition-transform hover:scale-110`}
    >
      {children}
    </a>
  )
}

export function SocialShare({ scheduleUrl }: { scheduleUrl?: string }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(scheduleUrl ?? window.location.href)
  }, [scheduleUrl])

  if (!url) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <FiShare2 className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="rounded-xl p-3 min-w-0">
        {/* <p className="mb-3 text-xs text-muted-foreground">Share via</p> */}

        <div className="flex flex-col gap-3">
          <ShareItem
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            bg="bg-blue-600"
            label="Facebook"
          >
            <FaFacebookF />
          </ShareItem>

          <ShareItem
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`}
            bg="bg-sky-500"
            label="Twitter"
          >
            <FaTwitter />
          </ShareItem>

          <ShareItem
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check my availability: ${url}`)}`}
            bg="bg-green-500"
            label="WhatsApp"
          >
            <FaWhatsapp />
          </ShareItem>

          <ShareItem
            href={`viber://forward?text=${encodeURIComponent(`Check my availability: ${url}`)}`}
            bg="bg-purple-600"
            label="Viber"
          >
            <FaViber />
          </ShareItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
