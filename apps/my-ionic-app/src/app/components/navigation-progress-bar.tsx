import { IonProgressBar } from '@ionic/react'
import { useEffect, useState } from 'react'

function NavigationProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => prevProgress + 0.01)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  if (progress > 1) {
    setTimeout(() => {
      setProgress(0)
    }, 1000)
  }

  return <IonProgressBar value={progress}></IonProgressBar>
}

export default NavigationProgressBar
