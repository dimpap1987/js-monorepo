<h1 style="display:inline"> Navbar </h1> <sub>a nextjs library</sub>

## Example

```jsx
import {
  NavbarLogo,
  Navbar,
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
    <Navbar
      user={{ isLoggedIn: true, username: 'username1' }}
      socialLogin={socials}
      menuItems={menuItems}
      onLogout={() => console.log('logged out')}
    >
      <NavbarLogo>
        Next App
      </NavbarLogo>
    </Navbar>
  )
}
```

## Properties

- children?: `ReactNode`
- menuItems?: `MenuItem[]`
- user?: `UserNavProps`
- socialLogin?: `UserNavSocial[]`
- onLogout?: () => `void`
