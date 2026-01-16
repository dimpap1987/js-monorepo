import { User, MapPin, Calendar } from 'lucide-react'
import type { Step } from './components/onboarding-progress'

export const ONBOARDING_STEPS: Step[] = [
  { id: 1, title: 'step1Title', subtitle: 'step1Subtitle', icon: User },
  { id: 2, title: 'step2Title', subtitle: 'step2Subtitle', icon: MapPin }, // Location is step 2
  { id: 3, title: 'step3Title', subtitle: 'step3Subtitle', icon: Calendar }, // Class is step 3
]
