'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@js-monorepo/components/card'
import React from 'react'
import { LocationListProps, ThingsToDoContentProps } from '../app/types'
import DynamicIcon from '../shared/dynamic-icon'

export function ThingsToDoContent({ location, onClick, distance, ...rest }: ThingsToDoContentProps) {
  return (
    <div {...rest} className="grid grid-cols-[max-content_auto_max-content] gap-4">
      <button onClick={onClick} className="map-button">
        📍
      </button>
      <span className="hover:font-semibold cursor-pointer" onClick={onClick}>
        {location.name}
      </span>
      {distance && <span className="hidden sm:inline">{distance} km</span>}
    </div>
  )
}

export const NearByLocations: React.FC<LocationListProps> = ({ locationData, roomLocation }) => {
  const openMap = (destinationLatitude: number, destinationLongitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${roomLocation.latitude},${roomLocation.longitude}&destination=${destinationLatitude},${destinationLongitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-center">Locations</h2>
      <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
        {locationData?.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex flex-row items-center gap-2">
                {category.icon && <DynamicIcon iconName={category.icon} />}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category.locations.map((location, locationIndex) => {
                return (
                  <ThingsToDoContent
                    key={locationIndex}
                    distance={location.distanceFromRoom}
                    location={location}
                    onClick={() => openMap(location.latitude, location.longitude)}
                  />
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
