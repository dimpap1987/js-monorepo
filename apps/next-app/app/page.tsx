import { LoaderComponent } from '@js-monorepo/loader'
import Main from '../components/main'
import { NotificationComponent } from '@js-monorepo/notification'
import {
  NavbarComponent,
  MenuItem,
  MenuComponent,
  LogoComponent,
} from '@js-monorepo/navbar'

export default function Index() {
  const menuItems: MenuItem[] = [
    {
      link: 'https://www.google.com',
      name: 'Menu 1',
    },
    {
      link: 'https://www.youtube.com',
      name: 'Menu 2',
    },
  ]
  return (
    <>
      <NavbarComponent>
        <LogoComponent>
          <h1>DimPap</h1>
        </LogoComponent>
        <MenuComponent menuItems={menuItems}></MenuComponent>
      </NavbarComponent>
      <LoaderComponent>
        <NotificationComponent>
          <Main className="p-2"></Main>
        </NotificationComponent>
      </LoaderComponent>
    </>
  )
}
