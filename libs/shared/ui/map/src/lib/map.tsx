import dynamic from 'next/dynamic'
import { forwardRef } from 'react'
import { MapProps, MapRef } from './types'

// Wrap the dynamic component in forwardRef
const LazyMap = dynamic(() => import('./components/map-leaflet'), {
  ssr: false,
  loading: () => (
    <div className="text-white min-h-full flex justify-center items-center">
      <p>Loading Map...</p>
    </div>
  ),
})

// Dynamically load all Leaflet components with SSR disabled
const components = {
  MapContainer: dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false }),
  TileLayer: dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false }),
  Marker: dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false }),
  Popup: dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false }),
  Circle: dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false }),
  Polygon: dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false }),
  Rectangle: dynamic(() => import('react-leaflet').then((mod) => mod.Rectangle), { ssr: false }),
  CircleMarker: dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false }),
}

// Main map component
const MapComponent = forwardRef<MapRef, Omit<MapProps, 'mapRef'>>((props, ref) => {
  return <LazyMap {...props} mapRef={ref} />
})

export { components as Map, MapComponent }
