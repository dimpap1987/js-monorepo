import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.example.myionicapp',
  appName: 'My Ionic App',
  webDir: '../../dist/apps/my-ionic-app',
  server: { androidScheme: 'https' },
}

export default config
