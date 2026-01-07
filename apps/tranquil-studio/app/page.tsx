import { Carousel } from '@js-monorepo/components/ui/carousel'
import { ContainerTemplate } from '@js-monorepo/templates'
import Footer from 'apps/tranquil-studio/components/footer'
import Hero from 'apps/tranquil-studio/components/hero'
import MapWithIframe from '../components/map'
import { NearByLocations } from '../components/nearby-locations'
import { HOME_LOCATION_CORDINATES, ROOM_IMAGES, ROOM_MAP_URL } from '../contants'
import { SectionWrapper } from '../shared/section-wrapper'
import { getPlacesNearby } from '../shared/utils'

const nearbyThings = getPlacesNearby()

export default function LandingPage() {
  return (
    <ContainerTemplate className="flex flex-col justify-between flex-1 gap-8 mt-4">
      <Hero></Hero>

      <SectionWrapper id="image-carousel">
        <Carousel className="md:h-[50vh]" hrefs={ROOM_IMAGES}></Carousel>
      </SectionWrapper>

      <SectionWrapper id="location">
        <h2 className="text-center mb-5">Locate Us</h2>
        <MapWithIframe href={ROOM_MAP_URL}></MapWithIframe>
      </SectionWrapper>

      <SectionWrapper>
        <NearByLocations
          locationData={nearbyThings}
          roomLocation={{ latitude: HOME_LOCATION_CORDINATES.latitude, longitude: HOME_LOCATION_CORDINATES.longitude }}
        ></NearByLocations>
      </SectionWrapper>
      <Footer></Footer>
    </ContainerTemplate>
  )
}
