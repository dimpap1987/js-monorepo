import { LoaderComponent } from '@js-monorepo/loader'
import { LogoComponent, MenuItem, NavbarComponent } from '@js-monorepo/navbar'
import { NotificationComponent } from '@js-monorepo/notification'
import { VersionComponent } from '@js-monorepo/version'
import Main from '../components/main'

export default function Index() {
  const menuItems: MenuItem[] = [
    {
      link: 'https://www.google.com',
      name: 'Home',
    },
    {
      link: 'https://www.youtube.com',
      name: 'About',
    },
  ]
  return (
    <>
      <NavbarComponent menuItems={menuItems}>
        <LogoComponent>
          <h1>DPap</h1>
        </LogoComponent>
      </NavbarComponent>
      <LoaderComponent>
        <NotificationComponent>
          <Main className="p-2 flex-grow"></Main>
          <footer className="text-center py-4">
            <VersionComponent></VersionComponent>
          </footer>
        </NotificationComponent>
      </LoaderComponent>
    </>
  )
}
