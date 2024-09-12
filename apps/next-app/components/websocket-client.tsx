import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState<any>()

  useEffect(() => {
    // Create a socket connection
    const socket = io('ws://localhost:4444/presence', {
      withCredentials: true,
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('Connected')

      // Emit an event to fetch messages
      //   socket.emit('fetch-events-messages', {})
    })

    // Listen for incoming messages
    // socket.on('events-messages-stream', (data) => {
    //   console.log(data)
    //   //   setMessages((prevMessages) => [data]) // Update state with new messages
    // })

    // Handle exceptions
    socket.on('exception', (data) => {
      console.log('event', data)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected')
    })

    const pingInterval = setInterval(() => {
      socket.emit('ping')
    }, 5000)

    return () => {
      socket.disconnect()
      clearInterval(pingInterval)
    }
  }, [])

  return <></>
}

export { WebSocketComponent }
