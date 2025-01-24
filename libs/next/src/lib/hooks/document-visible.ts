import { useState, useEffect } from 'react'

function useDocumentVisible(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}

export default useDocumentVisible
