// src/pages/About.tsx

import React from 'react'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonButton } from '@ionic/react'
import { useNavigate } from 'react-router-dom'

const About: React.FC = () => {
  const navigate = useNavigate()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonText>
          <h2>About This App</h2>
          <p>
            This app is built with <strong>Ionic React</strong> and uses modern <strong>React Router v6</strong> for
            navigation.
          </p>
        </IonText>

        <IonButton expand="block" onClick={() => navigate('/home')}>
          Go to Home
        </IonButton>
      </IonContent>
    </IonPage>
  )
}

export default About
