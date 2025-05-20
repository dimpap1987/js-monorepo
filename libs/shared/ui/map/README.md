<h1 style="display:inline"> DpNextMap </h1> <sub>a nextjs library</sub>

## Example

```jsx
import { Map, MapComponent, MapRef } from '@js-monorepo/map'

export function Example() {
  const mapRef = (useRef < MapRef) | (null > null)

  return (
    <MapComponent center={{ lat: 37.98381, lng: 23.727539 }} zoom={10} ref={mapRef}>
      <Map.Marker
        position={{
          lat: 37.98381,
          lng: 23.727539,
        }}
      >
        <Map.Popup>You are here</Map.Popup>
      </Map.Marker>
    </MapComponent>
  )
}
```
