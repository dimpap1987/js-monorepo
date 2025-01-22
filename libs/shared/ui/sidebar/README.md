<h1 style="display:inline"> DpNextSidebar </h1> <sub>a nextjs library</sub>

## Example

```jsx
import { DpNextSidebar, MenuItem } from '@js-monorepo/sidebar'

export function Example() {
  const [openSideBar, setOpenSideBar] = useState(false)
  return (
    <DpNextSidebar
      isOpen={openSideBar}
      onClose={() => setOpenSideBar(false)}
      position="right"
      items={menuItems}
    ></DpNextSidebar>
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
