import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { PropsWithChildren } from 'react'
import NavBar from './navbar'

function MainTemplate({ children }: PropsWithChildren) {
  return (
    <DpNextPageProgressBar>
      <NavBar></NavBar>
      {children}
    </DpNextPageProgressBar>
  )
}

export default MainTemplate
