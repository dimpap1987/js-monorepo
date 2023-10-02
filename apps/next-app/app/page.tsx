import { LoaderProvider } from '@js-monorepo/loader'
import Main from '../components/main'
import { NotificationProvider } from '@js-monorepo/notification'

export default function Index() {
  return (
    <LoaderProvider>
      <NotificationProvider>
        <Main></Main>
      </NotificationProvider>
    </LoaderProvider>
  )
}
