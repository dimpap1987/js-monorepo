<h1 style="display:inline"> DpNextMap </h1> <sub>a nextjs library</sub>

## Example

```jsx
import { DpNextMap, DpMarker, DpPopup } from '@js-monorepo/map'

export function Example() {
  return (
    <DpNextMap
      mapContainerProps={{
        center: { lat: 37.98381, lng: 23.727539 },
        zoom: 10,
      }}
    >
      <DpMarker
        position={{
          lat: 37.98381,
          lng: 23.727539,
        }}
      >
        <DpPopup>You are here</DpPopup>
      </DpMarker>
    </DpNextMap>
  )
}
```
