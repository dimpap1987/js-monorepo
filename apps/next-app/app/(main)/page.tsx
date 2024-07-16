import { Metadata } from 'next'
import LandingComponent from '../../components/landing.component'

export const metadata: Metadata = {
  title: 'My Super App 😎',
}

export default function LandingPage() {
  return <LandingComponent></LandingComponent>
}
