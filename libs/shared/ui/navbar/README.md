<h1 style="display:inline"> DpNextNavbar </h1> <sub>a nextjs library</sub>

## Example

```jsx
import {
  DpLogo,
  DpNextNavbar,
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
    <DpNextNavbar
      user={{ isLoggedIn: true, username: 'username1' }}
      socialLogin={socials}
      menuItems={menuItems}
      onLogout={() => console.log('logged out')}
    >
      <DpLogo>
        Next App
      </DpLogo>
    </DpNextNavbar>
  )
}
```

## Properties

- children?: `ReactNode`
- menuItems?: `MenuItem[]`
- user?: `UserNavProps`
- socialLogin?: `UserNavSocial[]`
- onLogout?: () => `void`
