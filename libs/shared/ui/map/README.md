# MapComponent

## Example

```jsx
import { MapComponent, Marker, Popup } from '@js-monorepo/map'

export function Example() {
  return (
    <MapComponent
      mapContainerProps={{
        center: { lat: 37.98381, lng: 23.727539 },
        zoom: 10,
      }}
    >
      <Marker
        position={{
          lat: 37.98381,
          lng: 23.727539,
        }}
      >
        <Popup>You are here</Popup>
      </Marker>
    </MapComponent>
  )
}
```
