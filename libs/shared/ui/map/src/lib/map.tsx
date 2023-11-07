import MemoizedDynamicMap from './components/dynamic-map'
import { MapProps } from './types'
import dynamic from 'next/dynamic'

function MapComponent(props: MapProps) {
  return <MemoizedDynamicMap {...props} />
}

const MapContainer = dynamic(
  () => import('react-leaflet').then((module) => module.MapContainer),
  {
    ssr: false, // Disable server-side rendering for this component
  }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((module) => module.TileLayer),
  {
    ssr: false,
  }
)
const Marker = dynamic(
  () => import('react-leaflet').then((module) => module.Marker),
  {
    ssr: false,
  }
)

const Popup = dynamic(
  () => import('react-leaflet').then((module) => module.Popup),
  {
    ssr: false,
  }
)

export { MapComponent, Popup, Marker, TileLayer, MapContainer }
