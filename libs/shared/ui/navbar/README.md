# NavbarComponent

## Example

```jsx
import {
  LogoComponent,
  NavbarComponent,
  UserNavSocial,
} from '@js-monorepo/navbar'

export function Example() {

    const socials: UserNavSocial[] = [
        {
            type: 'github',
            onLogin: () => {},
        },
        {
            type: 'google',
            onLogin: () => {},
        },
        {
            type: 'facebook',
            onLogin: () => {},
        },
    ]
    const menuItems: MenuItem[] = [
        {
            href: '/',
            name: 'Home',
        },
        {
            href: '/about',
            name: 'About',
        },
    ]
  return (
    <NavbarComponent
      user={{ isLoggedIn: true, username: 'username1' }}
      socialLogin={socials}
      menuItems={menuItems}
      onLogout={() => console.log('logged out')}
    >
      <LogoComponent href="/">
        <SVGLogo></SVGLogo>
      </LogoComponent>
    </NavbarComponent>
  )
}
```

## Properties

- children?: `ReactNode`
- menuItems?: `MenuItem[]`
- user?: `UserNavProps`
- socialLogin?: `UserNavSocial[]`
- onLogout?: () => `void`
