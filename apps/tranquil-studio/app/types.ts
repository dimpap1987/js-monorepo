import { z } from 'zod'

export interface Location {
  name?: string
  latitude: number
  longitude: number
}

export interface ThingsToDoContentProps extends React.HTMLProps<HTMLDivElement> {
  location: Location
  onClick: () => void
  distance: string
}

export interface ThingsToDo {
  category: string
  icon?: string
  locations: Location[]
}

export interface LocationListProps {
  locationData: ThingsToDo[]
  roomLocation: Location
}

export const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
})

export type ContactFormSubmit = z.infer<typeof ContactSchema>
