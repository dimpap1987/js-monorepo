import MemoizedDynamicMap from './components/dynamic-map'
import { MapProps } from './types'
import dynamic from 'next/dynamic'

function DpNextMap(props: MapProps) {
  return <MemoizedDynamicMap {...props} />
}

const DpMapContainer = dynamic(
  () => import('react-leaflet').then((module) => module.MapContainer),
  {
    ssr: false, // Disable server-side rendering for this component
  }
)
const DpTileLayer = dynamic(
  () => import('react-leaflet').then((module) => module.TileLayer),
  {
    ssr: false,
  }
)
const DpMarker = dynamic(
  () => import('react-leaflet').then((module) => module.Marker),
  {
    ssr: false,
  }
)

const DpPopup = dynamic(
  () => import('react-leaflet').then((module) => module.Popup),
  {
    ssr: false,
  }
)

export { DpNextMap, DpPopup, DpMarker, DpTileLayer, DpMapContainer }
