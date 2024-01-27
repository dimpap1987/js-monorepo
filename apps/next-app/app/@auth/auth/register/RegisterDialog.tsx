'use client'

import { DpDialog, DpDialogContent, DpDialogHeader } from '@js-monorepo/dialog'
import { usePathname, useRouter } from 'next/navigation'

function RegisterDialog() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname !== '/auth/register') return null

  return (
    <DpDialog
      isOpen={true}
      onClose={() => router.replace('http://localhost:3000')}
      className="text-black shadow-2xl shadow-cyan-500/50 w-full min-w-[330px] max-w-[370px] md:w-[35%] p-2"
    >
      <DpDialogHeader className="justify-center p-5">Register</DpDialogHeader>
      <DpDialogContent className="p-3"></DpDialogContent>
    </DpDialog>
  )
}

export default RegisterDialog
