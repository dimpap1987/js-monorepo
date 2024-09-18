'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { EventsReponse, EventsReponseType } from '@js-monorepo/types'
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

interface EventSourceContextType {
  getEvent: <T>(type: EventsReponseType) => EventsReponse<T>
}

const EventSourceContext = createContext<EventSourceContextType | undefined>(
  undefined
)

export const EventSourceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [event, setEvents] = useState<Partial<Record<EventsReponseType, any>>>(
    {}
  )
  const eventSourceRef = useRef<EventSource | null>(null) // Use a ref to store the EventSource instance
  const { isLoggedIn } = useSession()

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

    const reconnect = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      reconnectTimeout = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        connectToEventSource()
      }, 5000) // Reconnect after 5 seconds
    }

    const connectToEventSource = () => {
      const es = new EventSource(
        process.env.NEXT_PUBLIC_EVENT_SOURCE_ENDPOINT ?? '',
        {
          withCredentials: true,
        }
      )

      es.onmessage = (e) => {
        const parsedEvent = JSON.parse(e.data) as EventsReponse
        const type = parsedEvent?.type

        if (type) {
          setEvents((prevEvents) => ({
            ...prevEvents,
            [type]: {
              id: parsedEvent?.id,
              data: parsedEvent?.data,
              time: parsedEvent?.time,
            },
          }))
        }
      }

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null // Clear the ref on error
        reconnect()
      }

      eventSourceRef.current = es
    }

    if (isLoggedIn) {
      connectToEventSource()
    }

    return () => {
      eventSourceRef.current?.close() // Clean up the EventSource on component unmount or when isLoggedIn changes
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [isLoggedIn])

  const getEvent = <T,>(type: EventsReponseType): EventsReponse<T> => {
    return event[type]
  }

  return (
    <EventSourceContext.Provider value={{ getEvent }}>
      {children}
    </EventSourceContext.Provider>
  )
}

// Create a custom hook to use the EventSource context
export const useEventSourceContext = <T,>(type: EventsReponseType) => {
  const context = useContext(EventSourceContext)
  if (!context) {
    throw new Error(
      'useEventSourceContext must be used within an EventSourceProvider'
    )
  }
  const event = context.getEvent<T>(type)
  return { event }
}
