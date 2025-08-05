import React from 'react'
import { IonPage, IonContent, IonText } from '@ionic/react'

const NotFound: React.FC = () => (
  <IonPage>
    <IonContent className="ion-padding">
      <IonText color="danger">
        <h1>404 - Page Not Found</h1>
      </IonText>
    </IonContent>
  </IonPage>
)

export default NotFound
