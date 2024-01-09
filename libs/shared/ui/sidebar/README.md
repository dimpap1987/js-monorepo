# SidebarComponent

## Example

```jsx
import { SidebarComponent, MenuItem } from '@js-monorepo/sidebar'

export function Example() {
  const [openSideBar, setOpenSideBar] = useState(false)
  return (
    <SidebarComponent
      isOpen={openSideBar}
      onClose={() => setOpenSideBar(false)}
      position="right"
      items={menuItems}
    ></SidebarComponent>
  )
}
```

## Properties

- children?: `ReactNode`
- isOpen: `boolean`
- onClose: () => `void`
- position?: `SidebarPositionType`
- items: `MenuItem[]`
- header?: `string`
