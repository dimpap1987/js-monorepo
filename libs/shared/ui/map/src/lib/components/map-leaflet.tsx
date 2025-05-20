import L from 'leaflet'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { MapProps } from '../types'

export function MapLeaflet({ children, mapRef, ...props }: MapProps) {
  return (
    <MapContainer
      zoom={11}
      minZoom={1.5}
      attributionControl={false}
      scrollWheelZoom={true}
      style={{ height: '100%', zIndex: 0, ...props?.style, backgroundColor: '#222222' }}
      maxBoundsViscosity={1.0}
      maxBounds={L.latLngBounds(
        L.latLng(-90, -180), // Southwest corner
        L.latLng(90, 180) // Northeast corner
      )}
      ref={mapRef}
      {...props}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        noWrap
        minZoom={0}
        maxZoom={20}
      />
      {children}
    </MapContainer>
  )
}

export default MapLeaflet
