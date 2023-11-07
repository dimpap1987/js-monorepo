import { MapContainerProps } from 'react-leaflet'

export type MarkerPosition = {
  lat: number
  lng: number
}

export interface MapProps {
  mapContainerProps?: MapContainerProps
  children?: React.ReactNode
}
