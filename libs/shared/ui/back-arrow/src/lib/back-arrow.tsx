'use client'

import { cn } from '@js-monorepo/ui/util'
import { useRouter } from 'next-nprogress-bar'
import { IoArrowBackOutline } from 'react-icons/io5'

function BackArrow({ className, ...props }: { className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter()

  return (
    <button className={cn(className)} type="button" onClick={() => router.back()} {...props}>
      <IoArrowBackOutline className="text-xl" />
    </button>
  )
}

export { BackArrow }
