import {
  IonContent, // Main content area
  IonHeader, // Top header bar
  IonPage, // Wrapper for each page/screen
  IonTitle, // Title text
  IonToolbar, // Container for header content
  IonButton, // Ionic button component
  IonCard, // Card component
  IonCardContent, // Card content area
  IonCardHeader, // Card header
  IonCardTitle, // Card title
  IonIcon, // Icon component
  IonItem, // List item
  IonLabel, // Label for items
  IonList, // List container
} from '@ionic/react'
import {
  heart, // Heart icon
  star, // Star icon
  home, // Home icon
} from 'ionicons/icons'

const Home: React.FC = () => {
  const handleButtonClick = () => {
    console.log('Button clicked!')
  }

  return (
    <IonPage>
      {/* Header section */}
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Ionic App</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Main content area */}
      <IonContent className="ion-padding">
        {/* Welcome Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Welcome to Ionic React!</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            This is your first Ionic React app. Notice how it looks and feels like a native mobile app, even in the
            browser!
          </IonCardContent>
        </IonCard>

        {/* Button Examples */}
        <IonButton
          expand="block" // Makes button full width
          color="primary" // Uses primary theme color
          onClick={handleButtonClick}
        >
          <IonIcon icon={heart} slot="start" />
          Primary Button
        </IonButton>

        <IonButton expand="block" color="secondary" fill="outline">
          <IonIcon icon={star} slot="start" />
          Secondary Button
        </IonButton>

        {/* List Example */}
        <IonList>
          <IonItem>
            <IonIcon icon={home} slot="start" />
            <IonLabel>
              <h2>Home</h2>
              <p>This is a list item</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={star} slot="start" />
            <IonLabel>
              <h2>Favorites</h2>
              <p>Another list item</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default Home
