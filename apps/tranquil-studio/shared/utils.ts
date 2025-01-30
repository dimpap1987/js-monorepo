import { HOME_LOCATION_CORDINATES } from '../contants'
import nearbyThingsJson from '../public/nearby_locations.json'

// Converts numeric degrees to radians
function toRad(Value: number) {
  return (Value * Math.PI) / 180
}

export function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  lat1 = toRad(lat1)
  lat2 = toRad(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getPlacesNearby() {
  const nearbyThings = nearbyThingsJson.map(({ locations, ...rest }) => ({
    ...rest,
    locations: locations.map(({ latitude, longitude, ...locationRest }) => {
      const distance = Number(
        calcDistance(
          HOME_LOCATION_CORDINATES.latitude,
          HOME_LOCATION_CORDINATES.longitude,
          latitude,
          longitude
        ).toFixed(2)
      )
      return {
        ...locationRest,
        latitude,
        longitude,
        distanceFromRoom: distance,
      }
    }),
  }))

  return nearbyThings.map((nt) => ({
    ...nt,
    locations: nt.locations.sort((a, b) => a.distanceFromRoom - b.distanceFromRoom),
  }))
}
