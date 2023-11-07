import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import { MapContainer, TileLayer } from 'react-leaflet'
import { MapProps } from '../types'

export function MapLeaflet({ mapContainerProps, children }: MapProps) {
  return (
    <MapContainer
      zoom={11}
      scrollWheelZoom={true}
      style={{ height: '100%', zIndex: 0, ...mapContainerProps?.style }}
      {...mapContainerProps}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {children}
    </MapContainer>
  )
}

export default MapLeaflet
