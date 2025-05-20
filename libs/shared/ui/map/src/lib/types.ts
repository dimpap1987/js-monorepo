import { Map } from 'leaflet'
import { MapContainerProps } from 'react-leaflet'
export type { Map as MapRef } from 'leaflet'

export type MarkerPosition = {
  lat: number
  lng: number
}

export interface MapProps extends MapContainerProps {
  children?: React.ReactNode
  className?: string
  mapRef?: React.Ref<Map>
}
