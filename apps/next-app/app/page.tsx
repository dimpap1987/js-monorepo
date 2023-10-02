import { LoaderProvider } from '@js-monorepo/loader'
import Main from '../components/main'

export default function Index() {
  return (
    <LoaderProvider>
      <Main></Main>
    </LoaderProvider>
  )
}
