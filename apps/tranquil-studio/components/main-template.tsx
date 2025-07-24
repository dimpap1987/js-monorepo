import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { PropsWithChildren } from 'react'
import NavBar from './navbar'
import { Toaster } from '@js-monorepo/components/sonner'

function MainTemplate({ children }: PropsWithChildren) {
  return (
    <DpNextPageProgressBar>
      <NavBar></NavBar>
      {children}
      <Toaster />
    </DpNextPageProgressBar>
  )
}

export default MainTemplate
