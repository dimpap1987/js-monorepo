import { IonApp } from '@ionic/react'
import React, { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/routes'

const App: React.FC = () => (
  <IonApp>
    <BrowserRouter>
      <Suspense>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  </IonApp>
)

export default App
